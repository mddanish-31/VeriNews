import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9920;
const FRONTEND_PORT = 3008;
const TEMP_PROFILE = path.join(os.tmpdir(), `chrome_refinement_qa_${Date.now()}`);
const SCREENSHOT_DIR = path.resolve('scripts', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForUrl(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return true;
    } catch {
      await sleep(300);
    }
  }
  return false;
}

async function killProcessesOnPorts(ports) {
  for (const port of ports) {
    try {
      execSync(
        `powershell.exe -NoProfile -Command "$conns = Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue; if ($conns) { $conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }"`,
        { stdio: 'ignore' }
      );
    } catch {}
  }
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.msgId = 1;
    this.pending = new Map();

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      } catch {}
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${res.exceptionDetails.text || JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png', quality: 90 });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`[Screenshot Saved] ${path.basename(filePath)} (${fs.statSync(filePath).size} bytes)`);
  }
}

async function runQa() {
  console.log('=== STARTING NAVBAR SEGMENTED CONTROL + HERO SPACING REFINEMENT QA ===');
  await killProcessesOnPorts([CDP_PORT, FRONTEND_PORT]);
  await sleep(1000);

  console.log(`[1/9] Spawning Next.js production server on port ${FRONTEND_PORT}...`);
  const nextServer = spawn(
    'powershell.exe',
    ['-NoProfile', '-Command', `npm --prefix frontend run start -- -p ${FRONTEND_PORT}`],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  const serverReady = await waitForUrl(`http://localhost:${FRONTEND_PORT}`);
  if (!serverReady) {
    throw new Error('Next.js production server failed to start within 25 seconds');
  }
  console.log(`✓ Next.js server ready on port ${FRONTEND_PORT}`);

  console.log('[2/9] Launching Headless Chrome via CDP...');
  fs.mkdirSync(TEMP_PROFILE, { recursive: true });
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${TEMP_PROFILE}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,960',
  ]);

  const cdpReady = await waitForUrl(`http://127.0.0.1:${CDP_PORT}/json/list`, 15000);
  if (!cdpReady) {
    throw new Error('Chrome CDP failed to initialize');
  }

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((resolve) => (ws.onopen = resolve));
  const cdp = new CdpClient(ws);

  try {
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log(`[3/9] Navigating to http://localhost:${FRONTEND_PORT}...`);
    await cdp.send('Page.navigate', { url: `http://localhost:${FRONTEND_PORT}` });
    await sleep(2500);

    // 1. Audit Navbar SegmentedControl
    console.log('[4/9] Auditing Navbar SegmentedControl and Options...');
    const navAudit = await cdp.eval(`
      (() => {
        const brand = document.querySelector('header a[aria-label="VeriNews Home"]');
        const segmentedControl = document.querySelector('header nav div[role="radiogroup"]');
        const options = Array.from(segmentedControl?.querySelectorAll('[role="radio"]') || []).map(el => ({
          label: el.innerText.trim(),
          checked: el.getAttribute('aria-checked'),
          href: el.getAttribute('href')
        }));
        const themeSwitcher = document.querySelector('#desktop-theme-switcher');
        const ctaBtn = document.querySelector('#nav-analyzer-cta');

        return {
          brandFound: !!brand,
          segmentedControlFound: !!segmentedControl,
          optionCount: options.length,
          options,
          themeSwitcherFound: !!themeSwitcher,
          ctaBtnFound: !!ctaBtn
        };
      })()
    `);
    console.log('✓ Navbar Audit:', JSON.stringify(navAudit));
    if (!navAudit.segmentedControlFound) throw new Error('SegmentedControl missing in navbar center!');
    if (navAudit.optionCount !== 5) throw new Error(`Expected 5 options in SegmentedControl, found ${navAudit.optionCount}`);
    const expectedLabels = ['Home', 'Why VeriNews?', 'Analyze', 'Transparency', 'About'];
    expectedLabels.forEach((label, idx) => {
      if (navAudit.options[idx]?.label !== label) {
        throw new Error(`Option ${idx} expected '${label}', got '${navAudit.options[idx]?.label}'`);
      }
    });
    if (navAudit.options[0]?.checked !== 'true') {
      throw new Error('Home option should be selected by default (aria-checked="true")');
    }

    // 2. Audit Eyebrow Removal & Reduced Hero Spacing
    console.log('[5/9] Auditing Eyebrow Removal & Refined Hero Spacing...');
    const heroSpacingAudit = await cdp.eval(`
      (() => {
        const allText = document.querySelector('#home')?.innerText || '';
        const hasEyebrow = allText.includes('AI-POWERED NEWS INTELLIGENCE');
        const header = document.querySelector('header');
        const headerRect = header ? header.getBoundingClientRect() : null;
        const h1 = document.querySelector('#hero-title');
        const h1Rect = h1 ? h1.getBoundingClientRect() : null;
        const heroContainer = document.querySelector('#home .animate-seq');
        const firstChild = heroContainer?.firstElementChild;

        const gapFromNav = h1Rect && headerRect ? (h1Rect.top - headerRect.bottom) : null;

        return {
          hasEyebrow,
          isH1FirstChild: firstChild?.id === 'hero-title',
          headerBottom: headerRect?.bottom,
          h1Top: h1Rect?.top,
          gapFromNav,
          h1Text: h1?.innerText.trim()
        };
      })()
    `);
    console.log('✓ Hero Spacing & Eyebrow Audit:', JSON.stringify(heroSpacingAudit));
    if (heroSpacingAudit.hasEyebrow) {
      throw new Error('Eyebrow badge "AI-POWERED NEWS INTELLIGENCE" was not removed!');
    }
    if (!heroSpacingAudit.isH1FirstChild) {
      throw new Error('H1 heading must be the first element of the hero content!');
    }
    console.log(`✓ Clean gap from navbar bottom to headline: ${Math.round(heroSpacingAudit.gapFromNav)}px`);

    // 3. Desktop Viewport (1440x960)
    console.log('[6/9] Capturing Desktop 1440px Screenshot...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'refinement_01_hero_desktop_1440.png'));

    // 4. Large Desktop Viewport (1680x1050)
    console.log('[7/9] Testing Desktop 1680x1050 Viewport...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1680,
      height: 1050,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(600);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'refinement_02_desktop_1680.png'));

    // 5. Laptop Viewport (1366x768)
    console.log('[8/9] Testing Laptop 1366x768 Viewport...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(600);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'refinement_03_laptop_1366.png'));

    // 6. Tablet (768x1024) and Mobile (375x667)
    console.log('[9/9] Testing Tablet (768x1024) and Mobile (375x667)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });
    await sleep(600);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'refinement_04_tablet_768.png'));

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });
    await sleep(600);

    const mobileCheck = await cdp.eval(`
      (() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const cards = Array.from(document.querySelectorAll('#home .grid > div'));
        return {
          scrollWidth,
          innerWidth,
          hasOverflow: scrollWidth > innerWidth,
          cardCount: cards.length
        };
      })()
    `);
    console.log('✓ Mobile Audit:', JSON.stringify(mobileCheck));
    if (mobileCheck.hasOverflow) {
      throw new Error(`Mobile has horizontal overflow: ${mobileCheck.scrollWidth} > ${mobileCheck.innerWidth}`);
    }
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'refinement_05_mobile_375.png'));

    console.log('\n=== ALL REFINEMENT CHECKS PASSED SUCCESSFULLY ===');
  } finally {
    try {
      ws.close();
    } catch {}
    chromeProc.kill();
    nextServer.kill();
    await killProcessesOnPorts([CDP_PORT, FRONTEND_PORT]);
    try {
      fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
    } catch {}
  }
}

runQa().catch((err) => {
  console.error('QA FAILED:', err);
  process.exit(1);
});
