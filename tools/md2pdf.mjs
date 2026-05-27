#!/usr/bin/env node
// Convert a Markdown file to PDF using marked + Chrome headless.
// Usage: node tools/md2pdf.mjs <input.md> <output.pdf> [title]
import { marked } from 'marked';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname, basename } from 'node:path';

const [, , inputArg, outputArg, titleArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error('Usage: node tools/md2pdf.mjs <input.md> <output.pdf> [title]');
  process.exit(1);
}

const input = resolve(inputArg);
const output = resolve(outputArg);
const title = titleArg || basename(input, '.md');

const md = readFileSync(input, 'utf8');
const body = marked.parse(md, { gfm: true, breaks: false });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  html, body { background:#fff; color:#0b0b12; font: 11pt/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
  body { max-width: 100%; }
  h1 { font-size: 22pt; letter-spacing: -0.01em; margin: 0 0 12pt; border-bottom: 2px solid #7c3aed; padding-bottom: 6pt; color:#1a0b3a; }
  h2 { font-size: 15pt; margin: 22pt 0 8pt; color:#3b1078; }
  h3 { font-size: 12.5pt; margin: 16pt 0 6pt; color:#4b1d8a; }
  h4 { font-size: 11pt; margin: 12pt 0 4pt; color:#4b1d8a; }
  p { margin: 0 0 8pt; }
  hr { border:none; border-top:1px solid #e5e7eb; margin: 16pt 0; }
  code { font-family: "JetBrains Mono","SFMono-Regular",ui-monospace,Menlo,monospace; background:#f2f0fb; padding:1pt 4pt; border-radius:3pt; font-size: 9.5pt; }
  pre { background:#0b0b12; color:#e7e7ee; padding: 10pt 12pt; border-radius: 6pt; overflow:auto; font-size: 9.5pt; }
  pre code { background: transparent; color: inherit; padding: 0; }
  blockquote { border-left: 3px solid #06b6d4; padding: 4pt 10pt; margin: 8pt 0; color:#374151; background:#ecfeff; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0 14pt; font-size: 8.5pt; page-break-inside: auto; }
  thead { background: linear-gradient(90deg,#ede9fe,#cffafe); }
  th, td { border: 1px solid #d1d5db; padding: 4pt 6pt; text-align: left; vertical-align: top; }
  th { color: #1a0b3a; font-weight: 600; }
  tbody tr:nth-child(even) { background: #fafafe; }
  tr { page-break-inside: avoid; page-break-after: auto; }
  ul, ol { padding-left: 18pt; margin: 4pt 0 10pt; }
  li { margin-bottom: 3pt; }
  strong { color:#1a0b3a; }
  .meta { color:#6b7280; font-size: 9pt; }
</style>
</head>
<body>
${body}
</body>
</html>`;

const tmpHtml = output.replace(/\.pdf$/i, '.tmp.html');
writeFileSync(tmpHtml, html, 'utf8');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) {
  console.error('Chrome not found at', CHROME);
  process.exit(2);
}

try {
  execSync(`"${CHROME}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${output}" --print-to-pdf-no-header "file://${tmpHtml}"`, { stdio: 'pipe' });
} finally {
  unlinkSync(tmpHtml);
}

console.log(`✅ Wrote ${output}`);
