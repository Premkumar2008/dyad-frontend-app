/**
 * Generates PDF from Dyad-Architecture-Report.html using puppeteer.
 * Run: node reports/generate-pdf.mjs
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'Dyad-Architecture-Report.html');
const pdfPath = path.join(__dirname, 'Dyad-Architecture-Report.pdf');

async function main() {
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    console.log('Installing puppeteer (one-time)...');
    const { execSync } = await import('child_process');
    execSync('npm install puppeteer --no-save', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    puppeteer = await import('puppeteer');
  }

  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
  });
  await browser.close();
  console.log(`PDF written: ${pdfPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
