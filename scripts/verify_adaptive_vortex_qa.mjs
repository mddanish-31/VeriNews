import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9930;
const FRONTEND_PORT = 3010;
const TEMP_PROFILE = path.join(os.tmpdir(), `chrome_adaptive_vortex_qa_${Date.now()}`);
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
  console.log('=== STARTING ADAPTIVE NEURAL VORTEX QA SUITE ===');
  await killProcessesOnPorts([CDP_PORT, FRONTEND_PORT]);
  await sleep(1000);

  console.log(`[1/8] Spawning Next.js production server on port ${FRONTEND_PORT}...`);
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

  console.log('[2/8] Launching Headless Chrome via CDP...');
  fs.mkdirSync(TEMP_PROFILE, { recursive: true });
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${TEMP_PROFILE}`,
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

    console.log(`[3/8] Navigating to http://localhost:${FRONTEND_PORT}...`);
    await cdp.send('Page.navigate', { url: `http://localhost:${FRONTEND_PORT}` });
    await sleep(2500);

    // Verify initial dark mode
    const initialTheme = await cdp.eval(`document.documentElement.classList.contains('dark')`);
    console.log(`✓ Initial dark theme state: ${initialTheme ? 'DARK' : 'LIGHT'}`);

    // Verify WebGL Canvas
    const canvasStatus = await cdp.eval(`
      (() => {
        const c = document.getElementById('neuro');
        if (!c) return { exists: false };
        const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        return {
          exists: true,
          width: c.width,
          height: c.height,
          hasGl: !!gl,
          contextLost: gl ? gl.isContextLost() : true
        };
      })()
    `);
    console.log('✓ WebGL Canvas Audit:', JSON.stringify(canvasStatus));
    if (!canvasStatus.exists) throw new Error('Neural Vortex canvas #neuro not found!');
    if (canvasStatus.contextLost) throw new Error('WebGL context is lost!');

    // Simulate mouse interaction across hero
    console.log('[4/8] Simulating pointer interaction across WebGL canvas...');
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 400, y: 300 });
    await sleep(200);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 720, y: 450 });
    await sleep(400);

    // Capture Dark Mode desktop screenshot
    console.log('[5/8] Capturing Dark Mode desktop screenshot (1440x960)...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'adaptive_vortex_01_dark_1440.png'));

    // Toggle theme to Light Mode via Cinematic Theme Switcher
    console.log('[6/8] Toggling to Light Mode via CinematicThemeSwitcher...');
    await cdp.eval(`
      (() => {
        const switcher = document.querySelector('#desktop-theme-switcher') || document.querySelector('button[role="switch"]');
        if (switcher) switcher.click();
      })()
    `);
    await sleep(1000); // Wait for smooth 700ms transition

    const isLightNow = await cdp.eval(`!document.documentElement.classList.contains('dark')`);
    console.log(`✓ Switched to Light Mode: ${isLightNow}`);
    if (!isLightNow) throw new Error('Failed to toggle theme to light mode!');

    // Audit Light Mode styling
    const lightAudit = await cdp.eval(`
      (() => {
        const h1 = document.querySelector('#hero-title');
        const cards = Array.from(document.querySelectorAll('#home .grid > div'));
        const isDarkClass = document.documentElement.classList.contains('dark');
        const h1Color = window.getComputedStyle(h1.firstElementChild).color;
        const cardBg = window.getComputedStyle(cards[0]).backgroundColor;
        return {
          isDarkClass,
          h1Color,
          cardBg,
          cardCount: cards.length
        };
      })()
    `);
    console.log('✓ Light Mode Audit:', JSON.stringify(lightAudit));

    console.log('[7/8] Capturing Light Mode desktop screenshot (1440x960)...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'adaptive_vortex_02_light_1440.png'));

    // Mobile testing at 375x667
    console.log('[8/8] Capturing Mobile screenshots (375x667)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });
    await sleep(600);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'adaptive_vortex_03_light_mobile_375.png'));

    // Toggle back to Dark Mode on mobile
    await cdp.eval(`
      (() => {
        const switcher = document.querySelector('#desktop-theme-switcher') || document.querySelector('button[role="switch"]');
        if (switcher) switcher.click();
      })()
    `);
    await sleep(800);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'adaptive_vortex_04_dark_mobile_375.png'));

    console.log('\n=== ADAPTIVE NEURAL VORTEX QA COMPLETED SUCCESSFULLY ===');
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

