import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9912;
const FRONTEND_PORT = 3000;
const TEMP_PROFILE = path.join(os.tmpdir(), `chrome_vortex_qa_${Date.now()}`);
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

  async captureScreenshot(filePath, clip = null) {
    const params = { format: 'png', quality: 90 };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`[Screenshot Saved] ${path.basename(filePath)} (${fs.statSync(filePath).size} bytes)`);
  }
}

async function runQa() {
  console.log('=== STARTING INTERACTIVE NEURAL VORTEX QA ===');
  await killProcessesOnPorts([CDP_PORT, FRONTEND_PORT]);
  await sleep(1000);

  console.log('[1/7] Spawning Next.js production server on port 3000...');
  const nextServer = spawn(
    'powershell.exe',
    ['-NoProfile', '-Command', `npm --prefix frontend run start -- -p ${FRONTEND_PORT}`],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  const serverReady = await waitForUrl(`http://localhost:${FRONTEND_PORT}`, 20000);
  if (!serverReady) {
    throw new Error('Next.js server failed to respond within 20s');
  }
  console.log('✓ Next.js production server ready.');

  console.log('[2/7] Launching Google Chrome with remote debugging on port ' + CDP_PORT + '...');
  const chromeProc = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${TEMP_PROFILE}`,
      '--headless=new',
      '--enable-gpu-rasterization',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280,800',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  const cdpReady = await waitForUrl(`http://127.0.0.1:${CDP_PORT}/json/version`, 15000);
  if (!cdpReady) {
    throw new Error('Chrome CDP failed to respond');
  }

  const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' });
  const tabData = await newTabRes.json();
  const wsUrl = tabData.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  const cdp = new CdpClient(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  try {
    console.log('[3/7] Navigating to http://localhost:3000...');
    await cdp.send('Page.navigate', { url: `http://localhost:${FRONTEND_PORT}` });
    await sleep(3000);

    // Verify Canvas & WebGL Context
    const canvasInfo = await cdp.eval(`
      (() => {
        const canvas = document.querySelector('canvas#neuro');
        if (!canvas) return { error: 'canvas#neuro not found' };
        const rect = canvas.getBoundingClientRect();
        const hasWebGl = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        return {
          exists: true,
          id: canvas.id,
          width: canvas.width,
          height: canvas.height,
          clientWidth: rect.width,
          clientHeight: rect.height,
          hasWebGl,
          className: canvas.className,
          pointerEvents: window.getComputedStyle(canvas).pointerEvents,
          position: window.getComputedStyle(canvas).position,
        };
      })()
    `);
    console.log('✓ Canvas & WebGL Check:', JSON.stringify(canvasInfo));
    if (!canvasInfo.exists || !canvasInfo.hasWebGl) {
      throw new Error('Canvas or WebGL context is missing!');
    }
    if (canvasInfo.pointerEvents !== 'none') {
      throw new Error(`Expected canvas pointer-events: none, got ${canvasInfo.pointerEvents}`);
    }

    // Verify Outlined Content Panel
    const cardInfo = await cdp.eval(`
      (() => {
        const card = document.querySelector('.outline-style');
        if (!card) return { error: '.outline-style card not found' };
        const h1 = card.querySelector('h1');
        const p = card.querySelector('p');
        const eyebrow = card.querySelector('span');
        const links = Array.from(card.querySelectorAll('a')).map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href')
        }));
        const style = window.getComputedStyle(card);
        return {
          exists: true,
          headline: h1?.innerText?.trim(),
          description: p?.textContent?.trim(),
          eyebrow: eyebrow?.textContent?.trim(),
          links,
          borderRadius: style.borderRadius,
          borderWidth: style.borderWidth,
          borderStyle: style.borderStyle,
          borderColor: style.borderColor,
          backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
        };
      })()
    `);
    console.log('✓ Outlined Content Panel Check:', JSON.stringify(cardInfo));
    if (!cardInfo.exists) throw new Error('Outlined content panel not found!');
    if (!cardInfo.headline?.includes('Verify News') || !cardInfo.headline?.includes('Read Smarter')) {
      throw new Error(`Unexpected headline: ${cardInfo.headline}`);
    }
    if (!cardInfo.description?.includes('Understand information')) {
      throw new Error(`Unexpected description: ${cardInfo.description}`);
    }

    // Capture Initial Vortex Screenshot
    console.log('[4/7] Capturing Initial Vortex State screenshot...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'vortex_01_initial_hero.png'));

    // Test Mouse Movement Interaction
    console.log('[5/7] Simulating Mouse Movement to test pointer influence on neural vortex...');
    await cdp.eval(`
      (() => {
        window.dispatchEvent(new PointerEvent('pointermove', {
          clientX: window.innerWidth * 0.75,
          clientY: window.innerHeight * 0.35,
          bubbles: true
        }));
      })()
    `);
    await sleep(600);
    await cdp.eval(`
      (() => {
        window.dispatchEvent(new PointerEvent('pointermove', {
          clientX: window.innerWidth * 0.35,
          clientY: window.innerHeight * 0.65,
          bubbles: true
        }));
      })()
    `);
    await sleep(800);

    // Capture Post-Interaction Screenshot
    console.log('✓ Capturing Post-Mouse-Movement Screenshot...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'vortex_02_mouse_interaction.png'));

    // Close-up on the card
    const cardRect = await cdp.eval(`
      (() => {
        const card = document.querySelector('.outline-style');
        const r = card.getBoundingClientRect();
        return { x: Math.max(0, r.x - 20), y: Math.max(0, r.y - 20), width: r.width + 40, height: r.height + 40, scale: 1 };
      })()
    `);
    console.log('[6/7] Capturing close-up of transparent outlined card...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'vortex_03_content_panel.png'), cardRect);

    // Test CTA interaction: click "Start Analyzing"
    console.log('✓ Testing "Start Analyzing" CTA smooth scroll...');
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('a[href="#analyzer"]');
        if (btn) btn.click();
      })()
    `);
    await sleep(1200);

    const scrollY = await cdp.eval('window.pageYOffset || window.scrollY');
    console.log(`✓ Scrolled Y position after clicking CTA: ${scrollY}px`);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'vortex_04_scrolled_to_analyzer.png'));

    // Test Mobile Responsiveness (375x667)
    console.log('[7/7] Testing Mobile Responsiveness (375x667)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await cdp.send('Page.navigate', { url: `http://localhost:${FRONTEND_PORT}` });
    await sleep(2500);

    const mobileOverflow = await cdp.eval(`
      (() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
          scrollWidth,
          innerWidth,
          hasOverflow: scrollWidth > innerWidth
        };
      })()
    `);
    console.log('✓ Mobile Overflow Check:', JSON.stringify(mobileOverflow));
    if (mobileOverflow.hasOverflow) {
      throw new Error(`Mobile has horizontal overflow: ${mobileOverflow.scrollWidth} > ${mobileOverflow.innerWidth}`);
    }

    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'vortex_05_mobile_vortex.png'));

    console.log('\n=== ALL INTERACTIVE NEURAL VORTEX CHECKS PASSED ===');
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
