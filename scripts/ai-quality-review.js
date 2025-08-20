const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const OpenAI = require("openai");
const core = require("@actions/core");

const { GITHUB_TOKEN, OPENAI_API_KEY, PR_NUMBER, REPO } = process.env;
if (!GITHUB_TOKEN || !OPENAI_API_KEY || !PR_NUMBER || !REPO) {
  console.error("Missing env vars (GITHUB_TOKEN, OPENAI_API_KEY, PR_NUMBER, REPO).");


}

const [owner, repo] = REPO.split("/");
const octokit = new Octokit({ auth: GITHUB_TOKEN });

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const MODEL = "gpt-4o-mini";

async function fetchChangedFiles() {
  const files = [];
  let page = 1;
  while (true) {
    const { data } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: +PR_NUMBER,
      per_page: 100,
      page,
    });
    files.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return files;
}

async function main() {
  console.log("🚀 Starting AI code quality review...");
  const changed = await fetchChangedFiles();
  if (!changed.length) {
    console.log("No files changed");
    return;
  }
  const diffs = changed
    .filter(f => f.patch)
    .map(f => `FILE: ${f.filename}\n${f.patch}`)
    .join("\n\n")
    .slice(0, 32_000);

  const prompt = `You are a code quality assistant. Review the following Git diff snippets and provide constructive feedback:\n\n${diffs}`;
  const response = await openai.responses.create({
    model: MODEL,
    input: prompt,
  });
  const review = response.output_text.trim();

  const body = `<!-- ai-code-quality-review -->\n# 🤖 AI Code Quality Review\n\n${review}`;
  const outputPath = "ai-code-quality-review.md";
  fs.writeFileSync(outputPath, body);
  console.log(`📝 Review written to ${outputPath}`);

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: +PR_NUMBER,
    body,
  });
  console.log("✅ Posted code quality review");
}

main().catch(err => {
  core.setFailed(`Review failed: ${err.message}`);
});
