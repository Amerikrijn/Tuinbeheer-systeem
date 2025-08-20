const fs = require('fs/promises');
const path = require('path');

async function readJson(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function collect(dir) {
  const result = {};
  try {
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      if (entry.endsWith('.json')) {
        const full = path.join(dir, entry);
        result[entry] = await readJson(full);
      }
    }
  } catch {
    // ignore missing directories
  }
  return result;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function main() {
  const dirs = process.argv.slice(2);
  const report = {};
  for (const dir of dirs) {
    const name = path.basename(dir);
    report[name] = await collect(dir);
  }
  await fs.writeFile('report.json', JSON.stringify(report, null, 2));
  const html = `<!DOCTYPE html><html><body><pre>${escapeHtml(JSON.stringify(report, null, 2))}</pre></body></html>`;
  await fs.writeFile('report.html', html);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
