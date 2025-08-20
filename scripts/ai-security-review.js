// Security-first, standards-aware PR reviewer.
// - Summarizes repo standards from README/SECURITY/docs/.github/*.md
// - Reviews changed files with a security bias
// - Posts/updates a single sticky PR comment
// - Optionally fails the job on High-severity findings (FAIL_ON_HIGH)

const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const OpenAI = require("openai");
const core = require("@actions/core");

// --- Env & clients ---
const { GITHUB_TOKEN, OPENAI_API_KEY, PR_NUMBER, REPO, FAIL_ON_HIGH = "true" } = process.env;
if (!GITHUB_TOKEN || !OPENAI_API_KEY || !PR_NUMBER || !REPO) {
  console.error("Missing env vars (GITHUB_TOKEN, OPENAI_API_KEY, PR_NUMBER, REPO).");
  process.exit(1);
}
const [owner, repo] = REPO.split("/");
const octokit = new Octokit({ auth: GITHUB_TOKEN });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Config ---
const MODEL = "gpt-4o-mini";        // swap to "gpt-4o" for deeper reviews
const MAX_FILE_BYTES = 200_000;     // skip huge files
const MAX_INPUT_CHARS = 32_000;     // chunk prompts under this limit
const EXCLUDE_PATHS = [
  "dist/", "build/", "out/", "node_modules/", "vendor/",
  "package-lock.json", "pnpm-lock.yaml", "yarn.lock"
];
const CODE_EXTS = [
  ".js",".jsx",".ts",".tsx",".mjs",".cjs",".py",".rb",".go",".java",".kt",".scala",".rs",
  ".php",".cs",".cpp",".c",".h",".hpp",".m",".mm",".swift",".sh",".yml",".yaml",".json",
  ".toml",".md",".sql",".css",".scss",".html",".tf",".cue",".dockerfile",".env.example"
];

const isBinary = (name) => /\.(png|jpe?g|gif|webp|svg|pdf|zip|gz|tar|tgz|mp4|mov|exe|dll|wasm|ico)$/i.test(name);
const shouldSkipPath = (name) => isBinary(name) || EXCLUDE_PATHS.some(p => name.startsWith(p));
const extOf = (name) => (name.lastIndexOf(".") >= 0 ? name.slice(name.lastIndexOf(".")) : "");

async function getPR() {
  const { data } = await octokit.pulls.get({ owner, repo, pull_number: +PR_NUMBER });
  return data;
}

async function buildStandardsDigest(docs) {
  if (!docs || docs.length === 0) {
    return "No explicit project standards found in this repo.";
  }
  // ... rest of summarization
}


async function fetchChangedFiles() {
  const files = [];
  let page = 1;
  while (true) {
    try {
      const { data } = await octokit.pulls.listFiles({ owner, repo, pull_number: +PR_NUMBER, per_page: 100, page });
      files.push(...data);
      if (data.length < 100) break;
      page++;
    } catch (error) {
      console.error(`❌ Failed to fetch changed files: ${error.message}`);
      throw error;
    }
  }
  console.log(`📁 Analyzing ${files.length} changed files`);
  return files;
}

async function getFileText(path) {
  try {
    const pr = await getPR();
    const ref = pr.head.sha;
    const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
    if (Array.isArray(data) || data.size > MAX_FILE_BYTES) return null;
    const buff = Buffer.from(data.content, data.encoding || "base64");
    return buff.toString("utf-8");
  } catch {
    return null;
  }
}

async function listRepoTreePaths() {
  try {
    const pr = await getPR();
    const headSha = pr.head.sha;
    const { data: commit } = await octokit.git.getCommit({ owner, repo, commit_sha: headSha });
    const treeSha = commit.tree.sha;
    const { data: treeObj } = await octokit.git.getTree({ owner, repo, tree_sha: treeSha, recursive: "true" });
    return (treeObj.tree || []).filter(t => t.type === "blob").map(t => t.path);
  } catch {
    return [];
  }
}

async function collectRepoDocs() {
  const paths = new Set([
    "README.md","README","SECURITY.md","CONTRIBUTING.md","CODE_OF_CONDUCT.md",
    "CODEOWNERS",".github/CODEOWNERS",".github/SECURITY.md",".github/CONTRIBUTING.md"
  ]);

  const treePaths = await listRepoTreePaths();
  for (const p of treePaths) {
    const lower = p.toLowerCase();
    if (lower.startsWith("docs/") && lower.endsWith(".md")) paths.add(p);
    if (lower.startsWith(".github/") && lower.endsWith(".md")) paths.add(p);
    if (!p.includes("/") && lower.endsWith(".md")) paths.add(p);
  }

  const docs = [];
  for (const p of paths) {
    const text = await getFileText(p);
    if (!text) continue;
    const capped = text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) + "\n<!-- truncated -->" : text;
    docs.push({ path: p, text: capped });
  }
  return docs;
}

async function buildStandardsDigest(docs) {
  if (!docs.length) return "No explicit project standards found. Review will proceed with general security best practices.";
  const joined = docs.map(d => `FILE: ${d.path}\n${d.text}`).join("\n\n-----\n\n");

  const messages = [
    { role: "system", content:
`You are a staff engineer. Extract enforceable project rules from the documents.
Group by: Security, Code Style, Testing, Dependencies, API, Infra, Other.
Quote exact rules when helpful. Keep under 500 words.` },
    { role: "user", content: joined }
  ];

  try {
    const resp = await openai.chat.completions.create({
      model: MODEL, temperature: 0.1, messages
    });
    return resp.choices?.[0]?.message?.content?.trim() || "Standards summary unavailable.";
  } catch (error) {
    console.warn("Failed to generate standards digest:", error.message);
    return "Standards summary unavailable due to API error. Review will proceed with general security best practices.";
  }
}

function chunkText(text, max = MAX_INPUT_CHARS) {
  const chunks = [];
  for (let i = 0; i < text.length; i += max) chunks.push(text.slice(i, i + max));
  return chunks;
}

function buildReviewMessageChunks({ standardsDigest, reviewTargets }) {
  const header =
`You are a principal security engineer performing a comprehensive code review.

PRIMARY GOAL: Identify ALL security risks and violations with precise locations and examples.
SECONDARY GOALS: correctness, reliability, performance, maintainability.

Severity levels:
- Critical: Immediate security threats (RCE, SQL injection, auth bypass, secret exposure)
- High: Likely exploitable vulnerabilities (XSS, SSRF, IDOR, weak crypto, insecure defaults)
- Medium: Risky patterns (unsafe parsing, weak validation, trust boundary issues, DoS vectors)
- Low: Defense-in-depth improvements (hardening, security headers, input sanitization)

CRITICAL REQUIREMENTS:
1. For EVERY finding, provide EXACT line numbers or line ranges
2. Include the ACTUAL vulnerable code snippet from the file
3. Specify the EXACT file path and location
4. Provide a concrete fix with example code
5. Explain the security impact and exploitation scenario

Project Standards (digest):
${standardsDigest}

DO NOT include a summary section at the top. Generate detailed findings first, then I will create the summary based on your findings.

OUTPUT FORMAT (STRICT MARKDOWN):

## 🔍 Detailed Security Findings

### 🚨 Critical Issues
[If critical issues found, use this EXACT format for each:]

**File**: \`src/auth.js\`  
**Lines**: 45-48  
**Issue**: SQL Injection Vulnerability  
**Vulnerable Code**:
\`\`\`javascript
const query = "SELECT * FROM users WHERE email = '" + userEmail + "'";
db.execute(query);
\`\`\`
**Risk**: Attackers can inject malicious SQL to bypass authentication or extract sensitive data  
**Fix**:
\`\`\`javascript
const query = "SELECT * FROM users WHERE email = ?";
db.execute(query, [userEmail]);
\`\`\`

### ⚠️ High Priority Issues
[If high severity issues found, use same format as above]

### 🔶 Medium Priority Issues
[If medium severity issues found, use same format as above]

### 📝 Low Priority Issues
[If low priority issues found, use same format as above]

## ✅ Standards Compliance Analysis
[Brief analysis of compliance with project standards - 2-3 sentences max]

## 🧪 Recommended Security Tests
- **Unit Tests**: [specific test recommendations]
- **Integration Tests**: [specific test recommendations]  
- **E2E Tests**: [specific test recommendations]

## 📋 Prioritized Action Items

### 🚨 Critical - Fix Immediately
- [ ] **Fix SQL injection in src/auth.js:45-48** - Replace string concatenation with parameterized queries
- [ ] **[Next critical item if any]**

### ⚠️ High Priority - Fix This Week  
- [ ] **[High priority item with specific file:line]**
- [ ] **[Next high priority item]**

### 🔶 Medium Priority - Address in Next Sprint
- [ ] **[Medium priority item with specific file:line]**
- [ ] **[Next medium priority item]**

### 📝 Low Priority - Future Improvements
- [ ] **[Low priority item with specific file:line]**
- [ ] **[Next low priority item]**

CRITICAL: 
- ALWAYS include actual vulnerable code in code blocks
- ALWAYS provide exact line numbers (not ranges like 1-100)
- ALWAYS include proposed fix code
- Use markdown checkboxes (- [ ]) for all action items
- If NO issues found, state "No security issues detected in the analyzed files"`;

  const filesText = reviewTargets.map(({ path, patch, content }) => {
    const parts = [`\n=== FILE: ${path} ===`];
    if (patch) parts.push(`--- DIFF:\n${patch}`);
    if (content) {
      // Add line numbers to content for precise reference
      const numberedContent = content.split('\n').map((line, i) => `${i + 1}: ${line}`).join('\n');
      parts.push(`--- CONTENT WITH LINE NUMBERS:\n${numberedContent}`);
    }
    return parts.join("\n");
  }).join("\n");

  const combined = `${header}\n${filesText}`;
  const chunks = chunkText(combined);
  return chunks.map((c, i) => [
    { role: "system", content: "Be a strict but helpful security reviewer." },
    { role: "user", content: i === 0 ? c : `Continuation chunk ${i+1}:\n${c}` }
  ]);
}

// Generate summary section with accurate counts from detailed findings
function generateSummary(reviewContent, reviewTargets) {
  // Count issues by severity from the detailed findings
  const criticalCount = (reviewContent.match(/### 🚨 Critical Issues[\s\S]*?(?=### |## |$)/g)?.[0]?.match(/\*\*File\*\*:/g) || []).length;
  const highCount = (reviewContent.match(/### ⚠️ High Priority Issues[\s\S]*?(?=### |## |$)/g)?.[0]?.match(/\*\*File\*\*:/g) || []).length;
  const mediumCount = (reviewContent.match(/### 🔶 Medium Priority Issues[\s\S]*?(?=### |## |$)/g)?.[0]?.match(/\*\*File\*\*:/g) || []).length;
  const lowCount = (reviewContent.match(/### 📝 Low Priority Issues[\s\S]*?(?=### |## |$)/g)?.[0]?.match(/\*\*File\*\*:/g) || []).length;
  
  const totalIssues = criticalCount + highCount + mediumCount + lowCount;
  const filesAnalyzed = reviewTargets.length;
  
  // Determine most critical finding
  let mostCritical = "No security issues found";
  if (criticalCount > 0) {
    const criticalSection = reviewContent.match(/### 🚨 Critical Issues[\s\S]*?(?=### |## |$)/g)?.[0];
    const firstCritical = criticalSection?.match(/\*\*Issue\*\*:\s*([^\n]+)/)?.[1];
    mostCritical = firstCritical || "Critical security vulnerabilities detected";
  } else if (highCount > 0) {
    const highSection = reviewContent.match(/### ⚠️ High Priority Issues[\s\S]*?(?=### |## |$)/g)?.[0];
    const firstHigh = highSection?.match(/\*\*Issue\*\*:\s*([^\n]+)/)?.[1];
    mostCritical = firstHigh || "High severity security issues detected";
  }

  return `## 🔒 Security Review Summary
- **Total Issues Found**: ${totalIssues}
- **Critical**: ${criticalCount} | **High**: ${highCount} | **Medium**: ${mediumCount} | **Low**: ${lowCount}
- **Files Analyzed**: ${filesAnalyzed}
- **Most Critical**: ${mostCritical}

## 📊 Issue Overview by Severity

${criticalCount > 0 ? `### 🚨 Critical Severity Issues (${criticalCount})
${criticalCount} critical security vulnerabilities requiring immediate attention

` : ''}${highCount > 0 ? `### ⚠️ High Severity Issues (${highCount})
${highCount} high-priority security issues that should be fixed this week

` : ''}${mediumCount > 0 ? `### 🔶 Medium Severity Issues (${mediumCount})
${mediumCount} medium-priority security improvements for next sprint

` : ''}${lowCount > 0 ? `### 📝 Low Severity Issues (${lowCount})
${lowCount} low-priority hardening improvements for future releases

` : ''}${totalIssues === 0 ? `### ✅ No Security Issues Detected
All analyzed files appear to follow secure coding practices.

` : ''}`;
}

// Validate that the security review output contains required elements
function validateSecurityReview(reviewContent, reviewTargets) {
  const validation = {
    isValid: true,
    missingElements: [],
    hasFileReferences: false,
    hasLineNumbers: false,
    hasCodeExamples: false
  };

  // Check for file references
  validation.hasFileReferences = /\*\*File\*\*:\s*`[^`]+`/.test(reviewContent);

  // Check for line numbers
  validation.hasLineNumbers = /\*\*Lines?\*\*:\s*\d+/.test(reviewContent);

  // Check for code examples (both vulnerable and fix code)
  const codeBlocks = reviewContent.match(/```[\s\S]*?```/g) || [];
  validation.hasCodeExamples = codeBlocks.length >= 2; // Should have vulnerable + fix code

  // Check for action items with checkboxes
  const hasCheckboxes = /- \[ \]/.test(reviewContent);
  
  if (!validation.hasFileReferences) validation.missingElements.push('Missing file references');
  if (!validation.hasLineNumbers) validation.missingElements.push('Missing line numbers');
  if (!validation.hasCodeExamples) validation.missingElements.push('Missing code examples');
  if (!hasCheckboxes) validation.missingElements.push('Missing checkbox action items');

  validation.isValid = validation.missingElements.length === 0;
  return validation;
}

async function askOpenAI(messages) {
  console.log(`🤖 Calling OpenAI API (model: ${MODEL})...`);
  
  try {
    const resp = await openai.chat.completions.create({ 
      model: MODEL, 
      temperature: 0.1, 
      messages 
    });
    
    const content = resp.choices?.[0]?.message?.content?.trim() || "";
    console.log(`✅ OpenAI response received (${content.length} chars)`);
    
    return content;
  } catch (error) {
    console.error("❌ OpenAI API call failed:", error.message);
    throw error;
  }
}

async function postSecurityReviewComment(body) {
  try {
    const timestamp = new Date().toISOString();
    const reviewHeader = `<!-- ai-security-review-${timestamp} -->\n# 🔒 AI Security Review - ${new Date().toLocaleString()}\n\n`;
    const taggedBody = reviewHeader + body;
    
    await octokit.issues.createComment({ owner, repo, issue_number: +PR_NUMBER, body: taggedBody });
    console.log("✅ New security review comment posted");
  } catch (error) {
    console.error("❌ Failed to post comment:", error.message);
    throw error;
  }
}

(async () => {
  console.log("🚀 Starting enhanced AI security review...");
  console.log(`📊 Environment: PR#${PR_NUMBER} in ${REPO}`);

  try {
    // 1) Standards digest
    console.log("📚 Collecting project standards...");
    const docs = await collectRepoDocs();
    const standardsDigest = await buildStandardsDigest(docs);
    console.log(`📋 Found ${docs.length} documentation files`);

    // 2) Changed files
    const changed = await fetchChangedFiles();
    const reviewTargets = [];
    
    for (const f of changed) {
      const path = f.filename;
      
      if (shouldSkipPath(path)) continue;

      const ext = extOf(path);
      const includeContent = CODE_EXTS.includes(ext) || ext === "";
      const section = { path, patch: f.patch || null, content: null };

      if (includeContent) {
        const text = await getFileText(path);
        if (text) {
          section.content = text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) + "\n/* ...truncated... */" : text;
        }
      }

      if (section.patch || section.content) {
        reviewTargets.push(section);
      }
    }

    console.log(`🔍 Reviewing ${reviewTargets.length} files for security issues`);

    if (!reviewTargets.length) {
      await postSecurityReviewComment("## 🔒 Security Review Summary\n\nNo reviewable code changes detected in this PR. Only binary, configuration, or excluded files were modified.");
      return;
    }

    // 3) AI review with validation
    console.log("🤖 Generating comprehensive security analysis...");
    const messageBatches = buildReviewMessageChunks({ standardsDigest, reviewTargets });
    
    const outputs = [];
    for (let i = 0; i < messageBatches.length; i++) {
      const result = await askOpenAI(messageBatches[i]);
      outputs.push(result);
    }
    
    const detailedFindings = outputs.join("\n\n---\n\n");
    
    // 4) Generate accurate summary based on findings
    console.log("📊 Generating summary from findings...");
    const summary = generateSummary(detailedFindings, reviewTargets);
    
    // 5) Combine summary with detailed findings
    const completeReview = summary + "\n" + detailedFindings;
    
    // 6) Validate review completeness
    console.log("🔍 Validating review completeness...");
    const validation = validateSecurityReview(completeReview, reviewTargets);
    
    let reviewToPost = completeReview;
    if (!validation.isValid) {
      console.log("⚠️ Review validation issues:", validation.missingElements.join(', '));
      // Still post the review but note validation issues
      reviewToPost = `${completeReview}\n\n---\n*Note: Review validation detected some formatting issues but proceeding with current analysis.*`;
    }

    await postSecurityReviewComment(reviewToPost);
    fs.writeFileSync("ai-security-review.md", reviewToPost);
    console.log("📝 Security review written to ai-security-review.md");

    // 7) Check for critical/high severity issues
    if (String(FAIL_ON_HIGH).toLowerCase() === "true") {
      const hasCriticalOrHigh = /### 🚨 Critical|### ⚠️ High/i.test(reviewToPost);
      if (hasCriticalOrHigh) {
        console.log("❌ Critical or high severity security issues found");
        core.setFailed("Critical or high severity security findings detected by AI review.");
      } else {
        console.log("✅ No critical or high severity issues found");
      }
    }

    console.log("🎉 Enhanced security review completed");

  } catch (stepError) {
    console.error("❌ Security review failed:", stepError.message);
    throw stepError;
  }
})().catch(async (e) => {
  console.error("💥 FATAL: Security review failed -", e.message);
  
  const msg = `## 🚨 AI Security Review Failed\n\nThe automated security review encountered an error:\n\n\`\`\`\n${String(e?.message || e)}\n\`\`\`\n\nPlease check the GitHub Actions logs for more details.`;
  try { 
    await postSecurityReviewComment(msg);
    fs.writeFileSync("ai-security-review.md", msg);
    console.log("📝 Security review error written to ai-security-review.md");
  } catch (commentError) {
    console.error("Failed to post error comment:", commentError.message);
  }
  
  core.setFailed("AI security review step failed.");
});
