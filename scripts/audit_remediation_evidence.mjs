import fs from 'node:fs';
import path from 'node:path';

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 24) return null;
  // PNG Magic: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

console.log('================================================================================');
console.log('TASK 4 — VISUAL SCREENSHOT INVENTORY (PHASE 4 & PHASE 5)');
console.log('================================================================================');

const screenshotDir = path.resolve('scripts', 'screenshots');
const screenshots = [
  'phase4_qa_01_mobile_drawer_focus.png',
  'phase4_qa_02_methodology_modal.png',
  'phase4_qa_03_limitations_modal.png',
  'phase4_qa_04_privacy_modal.png',
  'phase4_qa_05_project_tracker_desktop.png',
  'phase4_qa_06_project_tracker_mobile.png',
  'phase5_qa_01_homepage_desktop_dark.png',
  'phase5_qa_02_homepage_tablet.png',
  'phase5_qa_03_homepage_mobile.png',
  'phase5_qa_04_homepage_desktop_light.png',
  'phase5_qa_05_webgl_context_loss_recovered.png',
];

const inventory = [];

for (const name of screenshots) {
  const fullPath = path.join(screenshotDir, name);
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING: ${name}`);
    continue;
  }
  const stat = fs.statSync(fullPath);
  const dims = getPngDimensions(fullPath);
  const info = {
    name,
    fullPath,
    sizeKb: (stat.size / 1024).toFixed(1),
    width: dims ? dims.width : 'N/A',
    height: dims ? dims.height : 'N/A',
  };
  inventory.push(info);
  console.log(`- ${name}`);
  console.log(`  Path: ${fullPath}`);
  console.log(`  Dimensions: ${info.width} x ${info.height} px | Size: ${info.sizeKb} KB`);
}

console.log('\n================================================================================');
console.log('TASK 3 — JAVASCRIPT BUNDLE SIZE AUDIT');
console.log('================================================================================');

const manifestPath = path.resolve('frontend', '.next', 'build-manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log('Manifest Pages:');
  for (const [route, files] of Object.entries(manifest.pages)) {
    let size = 0;
    for (const f of files) {
      const p = path.resolve('frontend', '.next', f);
      if (fs.existsSync(p)) size += fs.statSync(p).size;
    }
    console.log(`  Route ${route.padEnd(20)} : ${(size / 1024).toFixed(1)} KB across ${files.length} chunks`);
  }
}

const chunksDir = path.resolve('frontend', '.next', 'static', 'chunks');
if (fs.existsSync(chunksDir)) {
  const files = fs.readdirSync(chunksDir, { recursive: true }).filter((f) => f.endsWith('.js'));
  let totalBytes = 0;
  const list = [];
  for (const f of files) {
    const full = path.join(chunksDir, f);
    const sz = fs.statSync(full).size;
    totalBytes += sz;
    list.push({ file: f, kb: (sz / 1024).toFixed(1), rawBytes: sz });
  }
  list.sort((a, b) => b.rawBytes - a.rawBytes);
  console.log(`\nTotal static chunks directory on disk: ${(totalBytes / 1024).toFixed(1)} KB across ${files.length} chunk files`);
  console.log('Top 8 largest static chunks:');
  for (const c of list.slice(0, 8)) {
    console.log(`  ${c.file.padEnd(45)} : ${c.kb} KB`);
  }
}

