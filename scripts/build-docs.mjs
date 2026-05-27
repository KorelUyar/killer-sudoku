#!/usr/bin/env node
// Build a polished, light-themed A4 PDF from docs/DOCUMENTATION.md.
// Uses Puppeteer + Mermaid CDN. Embeds images as data URIs so the PDF is portable.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const docsDir = resolve(projectRoot, 'docs');
const mdPath = resolve(docsDir, 'DOCUMENTATION.md');
const pdfPath = resolve(docsDir, 'DOCUMENTATION.pdf');

// --- Image renderer: base64-inline local images so the PDF is portable. ---
// Marked passes (href, title, text) as positional args here.
function imageToken(href, title, text) {
  if (!href) return `<div class="ph">${text || 'Screenshot wird nachgereicht — siehe Live-URL.'}</div>`;
  let src = href;
  if (!/^(https?:|data:|file:)/.test(href)) {
    const abs = resolve(docsDir, href);
    if (existsSync(abs)) {
      const ext = extname(abs).toLowerCase();
      const mime = ext === '.png' ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
        : ext === '.webp' ? 'image/webp'
        : 'image/png';
      const data = readFileSync(abs).toString('base64');
      src = `data:${mime};base64,${data}`;
    } else {
      return `<div class="ph">Screenshot wird nachgereicht — siehe Live-URL.<br><small>${text || ''}</small></div>`;
    }
  }
  const titleAttr = title ? ` title="${title}"` : '';
  const altAttr = text ? ` alt="${text}"` : ' alt=""';
  return `<img src="${src}"${altAttr}${titleAttr} />`;
}
marked.use({ renderer: { image: imageToken } });
const md = readFileSync(mdPath, 'utf8');
let body = marked.parse(md, { gfm: true, breaks: false });

// Marked might have escaped the mermaid block content. Use raw <div class="mermaid"> already in source,
// but its contents might still be HTML-encoded. Decode them so Mermaid can parse.
body = body.replace(/<div class="mermaid">([\s\S]*?)<\/div>/g, (_m, inner) => {
  const decoded = inner
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return `<div class="mermaid">${decoded}</div>`;
});

// Cover-page wrapper
body = body.replace(/<div class="cover">[\s\S]*?<\/div>/, (m) => `<section class="cover-page">${m}</section>`);

// Mark the detailed test-cases table (the wide one) so we can apply tighter CSS.
body = body.replace(
  /(<h3[^>]*>14\.3 Detaillierte Test-Cases<\/h3>[\s\S]*?)<table>/,
  '$1<table class="test-cases">',
);

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Killer Sudoku — Documentation</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<style>
  @page { size: A4; margin: 22mm 18mm 22mm 18mm; }
  * { box-sizing: border-box; }
  html, body {
    background: #ffffff;
    color: #1a1a23;
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body { margin: 0; padding: 0; max-width: 100%; }
  h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.02em; margin: 18pt 0 8pt; color: #0a0a14; border-bottom: 2px solid #a78bfa; padding-bottom: 6pt; page-break-before: always; page-break-after: avoid; }
  h1:first-of-type, h1.no-break { page-break-before: avoid; }
  h2 { font-size: 14pt; font-weight: 600; letter-spacing: -0.01em; margin: 18pt 0 6pt; color: #1a1a23; page-break-after: avoid; }
  h3 { font-size: 12pt; font-weight: 600; margin: 14pt 0 4pt; color: #2d2d3a; page-break-after: avoid; }
  h4 { font-size: 11pt; font-weight: 600; margin: 12pt 0 4pt; color: #2d2d3a; }
  p { margin: 4pt 0 8pt; }
  ul, ol { padding-left: 20pt; margin: 4pt 0 10pt; }
  li { margin-bottom: 3pt; }
  strong { color: #0a0a14; }
  code { background: #f4f4f7; padding: 1pt 4pt; border-radius: 3pt; font-family: "JetBrains Mono", ui-monospace, Menlo, monospace; font-size: 9.5pt; color: #2d2d3a; }
  pre { background: #f7f7fa; padding: 10pt 12pt; border-radius: 6pt; overflow: hidden; font-size: 9pt; border: 1px solid #e5e5ea; }
  pre code { background: transparent; padding: 0; color: #1a1a23; font-size: 9pt; }
  blockquote { border-left: 3px solid #a78bfa; padding: 4pt 12pt; margin: 8pt 0; color: #404052; background: #f9f7ff; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8pt 0 12pt;
    font-size: 8pt;
    page-break-inside: auto;
    table-layout: fixed;
  }
  thead { background: #f4f4f7; }
  th, td {
    border: 1px solid #dcdce0;
    padding: 4pt 5pt;
    text-align: left;
    vertical-align: top;
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }
  th { color: #1a1a23; font-weight: 600; }
  /* Inside table cells, code must wrap — otherwise long identifiers blow out the column. */
  td code, th code { white-space: normal; word-break: break-all; font-size: 7.5pt; padding: 0 2pt; }
  tbody tr { page-break-inside: avoid; }
  /* Detailed test-case table — many narrow columns. Force smaller font + tighter padding. */
  table.test-cases { font-size: 7pt; }
  table.test-cases th, table.test-cases td { padding: 3pt 4pt; }
  table.test-cases td code, table.test-cases th code { font-size: 6.5pt; padding: 0 1pt; }
  hr { border: none; border-top: 1px solid #e5e5ea; margin: 14pt 0; }
  a { color: #6d28d9; text-decoration: none; }
  a:hover { text-decoration: underline; }
  img { max-width: 100%; height: auto; margin: 8pt 0; border-radius: 6pt; border: 1px solid #e5e5ea; page-break-inside: avoid; display: block; }
  .ph { background: #f4f4f7; border: 1px dashed #a8a8b8; padding: 32pt; text-align: center; color: #65657a; border-radius: 6pt; margin: 8pt 0; }
  .mermaid { background: #fafafe; border: 1px solid #e5e5ea; border-radius: 8pt; padding: 14pt; margin: 10pt 0; text-align: center; page-break-inside: avoid; }
  .mermaid svg { max-width: 100%; height: auto; }
  /* Cover page */
  .cover-page { page-break-after: always; padding: 60mm 0 0 0; text-align: center; min-height: 240mm; }
  .cover-page h1 { font-size: 38pt; border: none; padding: 0; margin: 0 0 8pt; }
  .cover-page h3 { font-size: 16pt; color: #6d28d9; font-weight: 500; margin: 0 0 24pt; }
  .cover-page p { font-size: 11pt; color: #65657a; margin: 4pt 0; }
  .cover-page strong { font-size: 13pt; color: #1a1a23; }
  /* Heading first-level after cover should still start a new page (it's the TOC) */
  .cover-page + hr + h2 { page-break-before: always; }
</style>
</head>
<body>
${body}
<script>
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    themeVariables: {
      fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
      primaryColor: '#ede9fe',
      primaryTextColor: '#1a1a23',
      primaryBorderColor: '#a78bfa',
      lineColor: '#65657a',
    },
  });
  // Render every <div class="mermaid"> and only then signal completion.
  (async () => {
    const nodes = Array.from(document.querySelectorAll('div.mermaid'));
    console.log('Mermaid nodes found:', nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const src = node.textContent.trim();
      try {
        const { svg } = await mermaid.render('mmd-' + i, src);
        node.innerHTML = svg;
      } catch (err) {
        console.error('mermaid render error #' + i + ': ' + (err && err.message ? err.message : err) + ' --- src head: ' + src.slice(0, 80));
        node.innerHTML = '<pre>' + src + '</pre>';
      }
    }
    window.__mermaid_done__ = true;
  })();
</script>
</body>
</html>`;

const htmlPath = resolve(docsDir, 'DOCUMENTATION.tmp.html');
writeFileSync(htmlPath, html, 'utf8');

console.log('Launching headless Chromium…');
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
// Surface browser console + errors during dev runs.
page.on('console', (msg) => console.log(`[browser ${msg.type()}]`, msg.text()));
page.on('pageerror', (err) => console.warn('[browser error]', err.message));
await page.setViewport({ width: 1280, height: 1800 });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 120_000 });

// Wait for Mermaid to finish.
try {
  await page.waitForFunction(() => (window).__mermaid_done__ === true, { timeout: 30_000 });
  console.log('Mermaid diagrams rendered ✓');
} catch {
  console.warn('Mermaid wait timed out — proceeding anyway');
}
// Give fonts and images a moment to settle.
await new Promise((r) => setTimeout(r, 500));

await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '22mm', right: '18mm', bottom: '22mm', left: '18mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `<div style="font-size:8pt; width:100%; padding: 0 18mm; color:#8a8a98; display:flex; justify-content:space-between;">
    <span>Killer Sudoku · Skills Battle 2026 · Korel Uyar</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`,
});

await browser.close();
// Optional: leave the HTML around for debugging during dev; remove for final.
try { require && require('node:fs').unlinkSync(htmlPath); } catch { /* swallow */ }

console.log(`✅ ${pdfPath}`);
