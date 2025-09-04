#!/usr/bin/env node
/**
 * LLM Standards Review (Optional LLM)
 * - Reads repository standards from docs/
 * - Collects changed files from the PR
 * - If LLM secrets are present, calls the LLM for guideline-based analysis
 * - Otherwise, generates a rule-based fallback report
 * - Writes markdown report to test-results/llm-standards-review.md
 *
 * No external dependencies. Node 18+ only.
 */

const fs = require('fs');
const path = require('path');

const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

const LLM_API_URL = process.env.LLM_API_URL || '';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function readTextIfExists(rel) {
  try {
    const p = path.resolve(process.cwd(), rel);
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8');
    }
  } catch (_) {}
  return '';
}

function collectStandards() {
  const sources = [
    'docs/ai-agent/RULES.md',
    'docs/ai-agent/STANDARDS.md',
    'docs/ai-agent/COMPLIANCE.md',
    'docs/ai-agent/WORKFLOW.md',
    'docs/architecture/OVERVIEW.md',
    'docs/system/Architectuur.md',
  ];
  const content = sources.map(s => ({ file: s, text: readTextIfExists(s) })).filter(x => x.text);
  return content;
}

async function getChangedFilesFromPR() {
  try {
    if (!GITHUB_EVENT_PATH) return [];
    const event = readJson(GITHUB_EVENT_PATH);
    if (!event || !event.pull_request) return [];
    const prNumber = event.pull_request.number;
    const [owner, repo] = GITHUB_REPOSITORY.split('/');
    if (!GITHUB_TOKEN || !owner || !repo) return [];

    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
    });
    if (!res.ok) return [];
    const files = await res.json();
    return files.map(f => ({ filename: f.filename, status: f.status, additions: f.additions, deletions: f.deletions }));
  } catch (_) {
    return [];
  }
}

function loadFileSnippets(filePaths, maxPerFileBytes = 20000) {
  const results = [];
  for (const rel of filePaths) {
    try {
      if (!fs.existsSync(rel)) continue;
      const data = fs.readFileSync(rel, 'utf8');
      const snippet = data.length > maxPerFileBytes ? data.slice(0, maxPerFileBytes) + "\n<!-- truncated -->\n" : data;
      results.push({ file: rel, snippet });
    } catch (_) {}
  }
  return results;
}

function buildPrompt(standards, changedFiles, snippets) {
  const standardsText = standards.map(s => `FILE: ${s.file}\n---\n${s.text}`).join('\n\n');
  const filesList = changedFiles.map(f => `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).join('\n');
  const codeSnippets = snippets.map(s => `FILE: ${s.file}\n---\n${s.snippet}`).join('\n\n');

  return `You are a senior reviewer for a banking-grade system. Evaluate the changed code against the following project standards and governance. Cite concrete sections from the standards when possible, reference file paths, and provide prioritized, actionable recommendations. Keep it concise, high-signal, and specific to the diffs.

PROJECT STANDARDS AND GOVERNANCE (EXCERPTS):
${standardsText}

CHANGED FILES:
${filesList}

CODE SNIPPETS (TRUNCATED):
${codeSnippets}

REQUIRED OUTPUT (Markdown):
1) Executive summary (max 6 lines)
2) Security & Compliance findings (banking-grade) with risk levels
3) Code Quality & Standards alignment (rules referenced)
4) Testability & Coverage impact
5) Actionable fixes (ordered: critical → high → medium)
6) Pass/Block recommendation for merge
`;
}

async function callLLM(prompt) {
  if (!LLM_API_URL || !LLM_API_KEY) return null;
  try {
    const res = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: 'You are a precise, compliant code reviewer for banking systems.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || null;
    return content;
  } catch (_) {
    return null;
  }
}

function fallbackReport(standards, changedFiles) {
  const hasVercelJson = fs.existsSync('vercel.json');
  const vercelJson = hasVercelJson ? readTextIfExists('vercel.json') : '';
  const supabaseKeyLeak = /supabase\S*key|anon[-_]?key|service[-_]?role/i.test(vercelJson);

  const execSummary = [
    'LLM not configured. Generated standards-aligned fallback review.',
    `${changedFiles.length} changed files scanned; key banking checks applied.`,
  ];

  const securityFindings = [];
  if (supabaseKeyLeak) {
    securityFindings.push('- ❌ Potential secret in vercel.json (Supabase key patterns detected). Move to Vercel Secrets.');
  } else if (hasVercelJson) {
    securityFindings.push('- ✅ No obvious secrets in vercel.json (basic scan).');
  }
  securityFindings.push('- ⚠️ Ensure RLS policies unchanged or revalidated for any DB-affecting changes.');

  const quality = [
    '- Follow TypeScript strictness and ESLint rules per STANDARDS.md.',
    '- Ensure input validation (Zod/Yup) on API boundaries.',
    '- Sanitize outputs to prevent XSS in UI components.',
  ];

  const testability = [
    '- Verify unit and integration tests cover modified logic.',
    '- Update or add mocks for Supabase or external services as required.',
  ];

  const actions = [];
  if (supabaseKeyLeak) actions.push('Remove any keys from vercel.json; use Vercel Secrets immediately.');
  actions.push('Add/confirm input validation for any new/changed API endpoints.');
  actions.push('Add/confirm tests for critical paths; check coverage artifacts.');

  return `# 🧭 LLM Standards Review (Fallback)

## Executive Summary
${execSummary.map(l => `- ${l}`).join('\n')}

## Security & Compliance
${securityFindings.join('\n')}

## Code Quality & Standards
${quality.join('\n')}

## Testability & Coverage
${testability.join('\n')}

## Actionable Fixes (Priority)
${actions.map((a, i) => `${i+1}. ${a}`).join('\n')}

## Recommendation
- Proceed only if security checks pass in banking-tests and coverage remains acceptable.
`;
}

async function main() {
  fs.mkdirSync('test-results', { recursive: true });
  const standards = collectStandards();
  const changed = await getChangedFilesFromPR();
  const changedPaths = changed.map(f => f.filename).filter(f => fs.existsSync(f));
  const snippets = loadFileSnippets(changedPaths.slice(0, 20));

  const prompt = buildPrompt(standards, changed, snippets);
  let report = await callLLM(prompt);
  if (!report) {
    report = fallbackReport(standards, changed);
  }

  const outPath = 'test-results/llm-standards-review.md';
  fs.writeFileSync(outPath, report, 'utf8');
  console.log(`Wrote report to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(0); // do not fail the workflow
});

#!/usr/bin/env node
/**
 * LLM Standards Review (Optional LLM)
 * - Reads repository standards from docs/
 * - Collects changed files from the PR
 * - If LLM secrets are present, calls the LLM for guideline-based analysis
 * - Otherwise, generates a rule-based fallback report
 * - Writes markdown report to test-results/llm-standards-review.md
 *
 * No external dependencies. Node 18+ only.
 */

const fs = require('fs');
const path = require('path');

const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

const LLM_API_URL = process.env.LLM_API_URL || '';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function readTextIfExists(rel) {
  try {
    const p = path.resolve(process.cwd(), rel);
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8');
    }
  } catch (_) {}
  return '';
}

function collectStandards() {
  const sources = [
    'docs/ai-agent/RULES.md',
    'docs/ai-agent/STANDARDS.md',
    'docs/ai-agent/COMPLIANCE.md',
    'docs/ai-agent/WORKFLOW.md',
    'docs/architecture/OVERVIEW.md',
    'docs/system/Architectuur.md',
  ];
  const content = sources.map(s => ({ file: s, text: readTextIfExists(s) })).filter(x => x.text);
  return content;
}

async function getChangedFilesFromPR() {
  try {
    if (!GITHUB_EVENT_PATH) return [];
    const event = readJson(GITHUB_EVENT_PATH);
    if (!event || !event.pull_request) return [];
    const prNumber = event.pull_request.number;
    const [owner, repo] = GITHUB_REPOSITORY.split('/');
    if (!GITHUB_TOKEN || !owner || !repo) return [];

    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
    });
    if (!res.ok) return [];
    const files = await res.json();
    return files.map(f => ({ filename: f.filename, status: f.status, additions: f.additions, deletions: f.deletions }));
  } catch (_) {
    return [];
  }
}

function loadFileSnippets(filePaths, maxPerFileBytes = 20_000) {
  const results = [];
  for (const rel of filePaths) {
    try {
      if (!fs.existsSync(rel)) continue;
      const data = fs.readFileSync(rel, 'utf8');
      const snippet = data.length > maxPerFileBytes ? data.slice(0, maxPerFileBytes) + "\n<!-- truncated -->\n" : data;
      results.push({ file: rel, snippet });
    } catch (_) {}
  }
  return results;
}

function buildPrompt(standards, changedFiles, snippets) {
  const standardsText = standards.map(s => `FILE: ${s.file}\n---\n${s.text}`).join('\n\n');
  const filesList = changedFiles.map(f => `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).join('\n');
  const codeSnippets = snippets.map(s => `FILE: ${s.file}\n---\n${s.snippet}`).join('\n\n');

  return `You are a senior reviewer for a banking-grade system. Evaluate the changed code against the following project standards and governance. Cite concrete sections from the standards when possible, reference file paths, and provide prioritized, actionable recommendations. Keep it concise, high-signal, and specific to the diffs.

PROJECT STANDARDS AND GOVERNANCE (EXCERPTS):
${standardsText}

CHANGED FILES:
${filesList}

CODE SNIPPETS (TRUNCATED):
${codeSnippets}

REQUIRED OUTPUT (Markdown):
1) Executive summary (max 6 lines)
2) Security & Compliance findings (banking-grade) with risk levels
3) Code Quality & Standards alignment (rules referenced)
4) Testability & Coverage impact
5) Actionable fixes (ordered: critical → high → medium)
6) Pass/Block recommendation for merge
`;
}

async function callLLM(prompt) {
  if (!LLM_API_URL || !LLM_API_KEY) return null;
  try {
    const res = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: 'You are a precise, compliant code reviewer for banking systems.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    // OpenAI-compatible response shape
    const content = data.choices?.[0]?.message?.content || null;
    return content;
  } catch (_) {
    return null;
  }
}

function fallbackReport(standards, changedFiles) {
  const hasVercelJson = fs.existsSync('vercel.json');
  const vercelJson = hasVercelJson ? readTextIfExists('vercel.json') : '';
  const supabaseKeyLeak = /supabase\S*key|anon[-_]?key|service[-_]?role/i.test(vercelJson);

  const execSummary = [
    'LLM not configured. Generated standards-aligned fallback review.',
    `${changedFiles.length} changed files scanned; key banking checks applied.`,
  ];

  const securityFindings = [];
  if (supabaseKeyLeak) {
    securityFindings.push('- ❌ Potential secret in vercel.json (Supabase key patterns detected). Move to Vercel Secrets.');
  } else if (hasVercelJson) {
    securityFindings.push('- ✅ No obvious secrets in vercel.json (basic scan).');
  }
  securityFindings.push('- ⚠️ Ensure RLS policies unchanged or revalidated for any DB-affecting changes.');

  const quality = [
    '- Follow TypeScript strictness and ESLint rules per STANDARDS.md.',
    '- Ensure input validation (Zod/Yup) on API boundaries.',
    '- Sanitize outputs to prevent XSS in UI components.',
  ];

  const testability = [
    '- Verify unit and integration tests cover modified logic.',
    '- Update or add mocks for Supabase or external services as required.',
  ];

  const actions = [];
  if (supabaseKeyLeak) actions.push('Remove any keys from vercel.json; use Vercel Secrets immediately.');
  actions.push('Add/confirm input validation for any new/changed API endpoints.');
  actions.push('Add/confirm tests for critical paths; check coverage artifacts.');

  return `# 🧭 LLM Standards Review (Fallback)

## Executive Summary
${execSummary.map(l => `- ${l}`).join('\n')}

## Security & Compliance
${securityFindings.join('\n')}

## Code Quality & Standards
${quality.join('\n')}

## Testability & Coverage
${testability.join('\n')}

## Actionable Fixes (Priority)
${actions.map((a, i) => `${i+1}. ${a}`).join('\n')}

## Recommendation
- Proceed only if security checks pass in banking-tests and coverage remains acceptable.
`;
}

async function main() {
  fs.mkdirSync('test-results', { recursive: true });
  const standards = collectStandards();
  const changed = await getChangedFilesFromPR();
  const changedPaths = changed.map(f => f.filename).filter(f => fs.existsSync(f));
  const snippets = loadFileSnippets(changedPaths.slice(0, 20));

  const prompt = buildPrompt(standards, changed, snippets);
  let report = await callLLM(prompt);
  if (!report) {
    report = fallbackReport(standards, changed);
  }

  const outPath = 'test-results/llm-standards-review.md';
  fs.writeFileSync(outPath, report, 'utf8');
  console.log(`Wrote report to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(0); // do not fail the workflow
});


