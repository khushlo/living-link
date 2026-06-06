#!/usr/bin/env node
/**
 * LivingLink -- KidneyX EMPOWER Track B Submission PDF Generator
 * Renders template.html via headless Chromium (Puppeteer) to a print-ready PDF.
 *
 * Usage:  node scripts/generate-submission-pdf/index.js
 * Output: submission/LivingLink-KidneyX-TrackB-Submission.pdf
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const TEMPLATE_PATH = path.join(__dirname, "template.html");
const OUTPUT_DIR = path.join(__dirname, "..", "..", "submission");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "LivingLink-KidneyX-TrackB-Submission.pdf");

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();

  // Set a wide viewport so layout never wraps unexpectedly
  await page.setViewport({ width: 1200, height: 1600 });

  console.log("Loading HTML template...");
  const templateUrl = `file:///${TEMPLATE_PATH.replace(/\\/g, "/")}`;
  await page.goto(templateUrl, { waitUntil: "networkidle0", timeout: 60000 });

  // Wait for Mermaid diagrams to finish rendering
  console.log("Waiting for Mermaid diagrams to render...");
  try {
    await page.waitForFunction("window.__mermaidReady === true", { timeout: 30000 });
    console.log("Mermaid diagrams rendered.");
  } catch {
    console.warn("Mermaid render timeout -- proceeding anyway.");
  }

  // Extra settle time for fonts and layout
  await new Promise((r) => setTimeout(r, 1500));

  console.log("Generating PDF...");
  await page.pdf({
    path: OUTPUT_FILE,
    format: "A4",
    printBackground: true,
    margin: { top: "15mm", right: "14mm", bottom: "15mm", left: "14mm" },
    displayHeaderFooter: false,
    scale: 0.95,
  });

  await browser.close();

  const sizeKB = Math.round(fs.statSync(OUTPUT_FILE).size / 1024);
  console.log(`\nDone! PDF saved to:\n  ${OUTPUT_FILE}\n  Size: ${sizeKB} KB\n`);
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
