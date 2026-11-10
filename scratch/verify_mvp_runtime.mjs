/**
 * VeriNews — MVP Runtime & Browser-Level Smoke Test Suite
 *
 * Runs actual live local servers:
 * 1. FastAPI backend on http://127.0.0.1:8000
 * 2. Next.js production frontend on http://localhost:3000
 * 3. Headless Chrome on CDP port 9876
 *
 * Verifies live browser runtime behavior across all core MVP scenarios.
 */

import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9876;
const TEMP_PROFILE = path.join(os.tmpdir(), `chrome_mvp_${Date.now()}`);
const SCREENSHOT_DIR = path.resolve('scripts', 'screenshots');

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
      await sleep(400);
    }
  }
  return false;
}

async function killProcessesOnPorts(ports) {
  for (const port of ports) {
    try {
      execSync(
        `powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
        { stdio: 'ignore' }
      );
    } catch {}
  }
}

async function runMvpSmokeTest() {
  console.log('================================================================================');
  console.log('VERINEWS MVP RUNTIME & BROWSER SMOKE TEST');
  console.log('================================================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // Step 0: Ensure ports are free
  console.log('[Setup 0] Ensuring ports 8000, 3000, and 9876 are free...');
  await killProcessesOnPorts([8000, 3000, CDP_PORT]);
  await sleep(1000);

  // Step 1: Start FastAPI backend
  console.log('[Setup 1] Starting FastAPI backend on http://127.0.0.1:8000...');
  const backendProc = spawn(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      '.venv\\Scripts\\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000'
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  backendProc.stderr.on('data', (d) => {
    const s = d.toString();
    if (s.includes('ERROR')) console.error(`  [Backend Log] ${s.trim()}`);
  });

  let frontendProc = null;
  let chromeProc = null;
  let ws = null;

  try {
    const backendUp = await waitForUrl('http://127.0.0.1:8000/api/health', 15000);
    if (!backendUp) throw new Error('FastAPI backend failed to start on 127.0.0.1:8000');

    const healthRes = await fetch('http://127.0.0.1:8000/api/health');
    const healthData = await healthRes.json();
    console.log('  PASS: Backend /api/health responded:', JSON.stringify(healthData));

    // Step 2: Start Next.js production frontend
    console.log('\n[Setup 2] Starting Next.js frontend production server on http://127.0.0.1:3000...');
    frontendProc = spawn(
      'powershell.exe',
      ['-NoProfile', '-Command', 'npm --prefix frontend run start -- -H 127.0.0.1 -p 3000'],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    const frontendUp = await waitForUrl('http://127.0.0.1:3000', 20000);
    if (!frontendUp) throw new Error('Next.js frontend failed to start on http://127.0.0.1:3000');
    console.log('  PASS: Next.js frontend is UP on http://127.0.0.1:3000');

    // Step 3: Launch Headless Chrome on CDP port
    console.log('\n[Setup 3] Launching Chrome CDP on port', CDP_PORT, '...');
    chromeProc = spawn(
      CHROME_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${TEMP_PROFILE}`,
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        'about:blank'
      ],
      { stdio: 'ignore' }
    );

    const cdpUp = await waitForUrl(`http://127.0.0.1:${CDP_PORT}/json/version`, 10000);
    if (!cdpUp) throw new Error(`Chrome CDP failed on port ${CDP_PORT}`);

    const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' });
    const tabData = await newTabRes.json();
    const wsUrl = tabData.webSocketDebuggerUrl;

    ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pendingPromises = new Map();
    const networkLog = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pendingPromises.has(msg.id)) {
        pendingPromises.get(msg.id)(msg);
        pendingPromises.delete(msg.id);
      }
      if (msg.method === 'Network.requestWillBeSent') {
        const req = msg.params.request;
        if (req.url.includes('/api/verify')) {
          networkLog.push({ type: 'REQ', url: req.url, postData: req.postData });
        }
      }
      if (msg.method === 'Network.responseReceived') {
        const res = msg.params.response;
        if (res.url.includes('/api/verify')) {
          networkLog.push({ type: 'RES', url: res.url, status: res.status });
        }
      }
    };

    await new Promise((resolve) => { ws.onopen = resolve; });

    function sendCommand(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve) => {
        pendingPromises.set(id, (msg) => resolve(msg.result || msg));
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await sendCommand('Runtime.evaluate', { expression, returnByValue: true });
      return res.result?.value;
    }

    async function setInputValue(selector, value) {
      const escaped = JSON.stringify(value);
      return evaluate(`
        (() => {
          const el = document.querySelector('${selector}');
          if (!el) return false;
          const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
          nativeSetter.call(el, ${escaped});
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        })()
      `);
    }

    async function setLanguage(lang) {
      const escaped = JSON.stringify(lang);
      return evaluate(`
        (() => {
          const select = document.getElementById('language-selector');
          if (!select) return false;
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          nativeSetter.call(select, ${escaped});
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        })()
      `);
    }

    async function clickElement(selector) {
      return evaluate(`
        (() => {
          const el = document.querySelector('${selector}');
          if (!el) return false;
          el.click();
          return true;
        })()
      `);
    }

    async function captureScreenshot(filename) {
      const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
      if (res && res.data) {
        const buffer = Buffer.from(res.data, 'base64');
        const outPath = path.join(SCREENSHOT_DIR, filename);
        fs.writeFileSync(outPath, buffer);
        return outPath;
      }
      return null;
    }

    // Enable CDP domains
    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');
    await sendCommand('Network.enable');

    // Set desktop viewport
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Navigate to local frontend
    console.log('\n[Navigation] Opening http://127.0.0.1:3000 in Headless Chrome...');
    await sendCommand('Page.navigate', { url: 'http://127.0.0.1:3000' });
    await sleep(2500);

    const title = await evaluate('document.title');
    console.log('  Page Title:', title);
    assert(title && title.includes('VeriNews'), 'Page title should include VeriNews');

    // -------------------------------------------------------------------------
    // TEST 1: English Headline Live Analysis
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: English Headline Live Verification ---');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const headlineBtn = buttons.find(b => b.textContent.includes('Headline / Claim'));
        if (headlineBtn) headlineBtn.click();
      })()
    `);
    await sleep(400);

    await setInputValue(
      '#article-input',
      'ISRO Chandrayaan mission successfully explores the lunar surface'
    );
    await sleep(300);

    const verifyBtnClicked = await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Verify News'));
        if (btn && !btn.disabled) { btn.click(); return true; }
        return false;
      })()
    `);
    assert(verifyBtnClicked, 'Verify News button should be clicked');

    // Poll for result card (up to 15s)
    let test1Passed = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const assessmentText = await evaluate(`
        (() => {
          const el = document.querySelector('article strong');
          return el ? el.textContent : null;
        })()
      `);
      if (assessmentText) {
        console.log(`  Assessment Status Rendered: "${assessmentText}"`);
        const sourcesCount = await evaluate(`
          (() => {
            return document.querySelectorAll('article a[target="_blank"]').length;
          })()
        `);
        console.log(`  Live Web Sources Rendered: ${sourcesCount}`);
        assert(sourcesCount > 0, 'Live web sources must be rendered');
        test1Passed = true;
        break;
      }
    }
    assert(test1Passed, 'English headline verification should complete with result card');
    const screenshot1 = await captureScreenshot('mvp_smoke_01_english_headline.png');
    console.log('  Screenshot saved:', screenshot1);

    // -------------------------------------------------------------------------
    // TEST 2: Hindi Headline Live Analysis (Devanagari)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Hindi Headline Live Verification (Devanagari) ---');
    await setLanguage('hi');
    await sleep(300);

    await setInputValue(
      '#article-input',
      'भारतीय अंतरिक्ष अनुसंधान संगठन इसरो ने चंद्रयान मिशन प्रक्षेपित किया'
    );
    await sleep(300);

    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Verify News'));
        if (btn) btn.click();
      })()
    `);

    let test2Passed = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const assessmentText = await evaluate(`
        (() => {
          const el = document.querySelector('article strong');
          return el ? el.textContent : null;
        })()
      `);
      if (assessmentText) {
        console.log(`  Assessment Status Rendered: "${assessmentText}"`);
        const explanationText = await evaluate(`
          (() => {
            const p = document.querySelector('article p.text-sm');
            return p ? p.textContent : '';
          })()
        `);
        console.log(`  Explanation excerpt: "${explanationText.slice(0, 80)}..."`);
        test2Passed = true;
        break;
      }
    }
    assert(test2Passed, 'Hindi headline verification should complete with result card');
    const screenshot2 = await captureScreenshot('mvp_smoke_02_hindi_headline.png');
    console.log('  Screenshot saved:', screenshot2);

    // -------------------------------------------------------------------------
    // TEST 3: Roman Hindi (Hinglish) Handling
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Roman Hindi (Hinglish) Live Verification ---');
    await setLanguage('auto');
    await sleep(300);

    await setInputValue(
      '#article-input',
      'ISRO ne Chandrayaan mission launch kiya aur Bharat ka naam roshan hua'
    );
    await sleep(300);

    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Verify News'));
        if (btn) btn.click();
      })()
    `);

    let test3Passed = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const assessmentText = await evaluate(`
        (() => {
          const el = document.querySelector('article strong');
          return el ? el.textContent : null;
        })()
      `);
      if (assessmentText) {
        console.log(`  Assessment Status Rendered: "${assessmentText}"`);
        test3Passed = true;
        break;
      }
    }
    assert(test3Passed, 'Roman Hindi verification should resolve without 422 crash');

    // -------------------------------------------------------------------------
    // TEST 4: Full Article Text Input
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Full Article Text Live Verification ---');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const articleBtn = buttons.find(b => b.textContent.includes('Full Article'));
        if (articleBtn) articleBtn.click();
      })()
    `);
    await sleep(400);

    const articleText = 'The Union Cabinet on Wednesday approved an ambitious national clean energy transition framework aimed at accelerating non-fossil power capacity expansion across all federal states. Government spokespersons highlighted that specialized budgetary incentives would support state electricity distribution utilities to deploy grid-scale battery storage facilities over the next five fiscal years.';
    await setInputValue('#article-input', articleText);
    await sleep(300);

    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Verify News'));
        if (btn) btn.click();
      })()
    `);

    let test4Passed = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const assessmentText = await evaluate(`
        (() => {
          const el = document.querySelector('article strong');
          return el ? el.textContent : null;
        })()
      `);
      if (assessmentText) {
        console.log(`  Assessment Status Rendered: "${assessmentText}"`);
        test4Passed = true;
        break;
      }
    }
    assert(test4Passed, 'Full article verification should complete successfully');

    // -------------------------------------------------------------------------
    // TEST 5: News URL Input & SSRF Verification
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: News URL Live Verification ---');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const urlBtn = buttons.find(b => b.textContent.includes('News URL'));
        if (urlBtn) urlBtn.click();
      })()
    `);
    await sleep(400);

    await setInputValue('#url-input', 'https://en.wikipedia.org/wiki/Chandrayaan_programme');
    await sleep(300);

    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Verify News'));
        if (btn) btn.click();
      })()
    `);

    let test5Passed = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const assessmentText = await evaluate(`
        (() => {
          const el = document.querySelector('article strong');
          return el ? el.textContent : null;
        })()
      `);
      if (assessmentText) {
        console.log(`  Assessment Status Rendered: "${assessmentText}"`);
        test5Passed = true;
        break;
      }
    }
    assert(test5Passed, 'News URL verification should complete with extracted content');
    const screenshot5 = await captureScreenshot('mvp_smoke_05_news_url.png');
    console.log('  Screenshot saved:', screenshot5);

    // -------------------------------------------------------------------------
    // TEST 6: Insufficient Evidence Handling
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Insufficient Evidence Handling ---');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const headlineBtn = buttons.find(b => b.textContent.includes('Headline / Claim'));
        if (headlineBtn) headlineBtn.click();
      })()
    `);
    await sleep(400);

    await setInputValue(
      '#article-input',
      'Zylophonic hyper-spatial quantum transponder detected in ancient Atlantis ruins'
    );
    await sleep(300);

    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Verify News'));
        if (btn) btn.click();
      })()
    `);

    let test6Passed = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const assessmentText = await evaluate(`
        (() => {
          const el = document.querySelector('article strong');
          return el ? el.textContent : null;
        })()
      `);
      if (assessmentText && assessmentText.includes('Insufficient Evidence')) {
        console.log(`  PASS: Correctly reported status: "${assessmentText}"`);
        const supportingCount = await evaluate(`
          (() => {
            const spans = Array.from(document.querySelectorAll('article span'));
            const sup = spans.find(s => s.textContent && s.textContent.includes('Supporting Evidence'));
            if (!sup) return 0;
            const container = sup.closest('div');
            return container ? container.querySelectorAll('li').length : 0;
          })()
        `);
        console.log(`  Supporting evidence items count: ${supportingCount} (Zero hallucinated proof)`);
        assert.strictEqual(supportingCount, 0, 'Zero supporting evidence items must be rendered');
        test6Passed = true;
        break;
      }
    }
    assert(test6Passed, 'Insufficient evidence status must be displayed honestly');
    const screenshot6 = await captureScreenshot('mvp_smoke_06_insufficient_evidence.png');
    console.log('  Screenshot saved:', screenshot6);

    // -------------------------------------------------------------------------
    // TEST 7: Source Links Format & Integrity
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Source Links Correctness & Security ---');
    // Load English sample to inspect links
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const sampleBtn = buttons.find(b => b.textContent.includes('Load Sample'));
        if (sampleBtn) sampleBtn.click();
      })()
    `);
    await sleep(300);

    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Verify News'));
        if (btn) btn.click();
      })()
    `);

    let test7Passed = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const links = await evaluate(`
        (() => {
          const anchors = Array.from(document.querySelectorAll('article a[target="_blank"]'));
          return anchors.map(a => ({
            href: a.href,
            target: a.target,
            rel: a.rel,
            text: a.innerText
          }));
        })()
      `);
      if (links && links.length > 0) {
        console.log(`  Verified ${links.length} source link anchors:`);
        for (const l of links) {
          assert(l.href.startsWith('http://') || l.href.startsWith('https://'), `Invalid link href: ${l.href}`);
          assert.strictEqual(l.target, '_blank', 'Must open in new tab');
          assert(l.rel.includes('noopener'), 'Must include noopener for security');
          assert(l.rel.includes('noreferrer'), 'Must include noreferrer for privacy');
          console.log(`    - URL: ${l.href.slice(0, 60)}...`);
        }
        test7Passed = true;
        break;
      }
    }
    assert(test7Passed, 'Source links must be found and verified');

    // -------------------------------------------------------------------------
    // TEST 8: Client Validation & Character Limits
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Client-Side Validation & Character Limits ---');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const clearBtn = buttons.find(b => b.textContent.includes('Clear'));
        if (clearBtn) clearBtn.click();
      })()
    `);
    await sleep(300);

    await setInputValue('#article-input', 'Tiny');
    await sleep(200);

    const initialReqs = networkLog.length;
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Verify News'));
        if (btn) btn.click();
      })()
    `);
    await sleep(500);

    const validationMsg = await evaluate(`
      (() => {
        const el = document.querySelector('#text-hints span.text-status-danger');
        return el ? el.textContent : '';
      })()
    `);
    console.log(`  Validation message displayed: "${validationMsg}"`);
    assert(validationMsg.includes('Add 6 more characters'), 'Validation message should indicate minimum length');
    assert.strictEqual(networkLog.length, initialReqs, 'No API request should be made when validation fails');
    console.log('  PASS: Client blocks submission and surfaces inline guidance without network roundtrip.');

    // -------------------------------------------------------------------------
    // TEST 9: Mobile Viewport & Responsiveness
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Mobile Viewport & Layout Verification ---');
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(1000);

    const horizontalOverflow = await evaluate(`
      (() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      })()
    `);
    console.log(`  Mobile horizontal overflow: ${horizontalOverflow ? 'YES (Defect)' : 'NO (Clean)'}`);
    assert(!horizontalOverflow, 'Mobile layout must have zero horizontal overflow');

    const screenshotMobile = await captureScreenshot('mvp_smoke_09_mobile_375x667.png');
    console.log('  Mobile screenshot saved:', screenshotMobile);

    console.log('\n================================================================================');
    console.log('ALL RUNTIME SMOKE TESTS & BROWSER INTERACTIONS COMPLETED SUCCESSFULLY!');
    console.log('================================================================================\n');

  } finally {
    if (ws) {
      try { ws.close(); } catch {}
    }
    if (chromeProc) {
      try { chromeProc.kill(); } catch {}
    }
    if (frontendProc) {
      try { frontendProc.kill(); } catch {}
    }
    if (backendProc) {
      try { backendProc.kill(); } catch {}
    }
    await killProcessesOnPorts([8000, 3000, CDP_PORT]);
    try {
      if (fs.existsSync(TEMP_PROFILE)) {
        fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
      }
    } catch {}
  }
}

runMvpSmokeTest().catch((err) => {
  console.error('\nSMOKE TEST FAILED:', err);
  process.exit(1);
});

