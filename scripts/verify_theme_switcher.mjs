import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9914;
const FRONTEND_PORT = 3000;
const TEMP_PROFILE = path.join(os.tmpdir(), `chrome_theme_qa_${Date.now()}`);
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
  console.log('=== STARTING CINEMATIC THEME SWITCHER QA ===');
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

    // Initial check: Dark Mode
    const initialCheck = await cdp.eval(`
      (() => {
        const switcher = document.querySelector('#desktop-theme-switcher');
        const isDark = document.documentElement.classList.contains('dark');
        const storedTheme = localStorage.getItem('verinews-theme');
        const canvas = document.querySelector('canvas#neuro');
        return {
          switcherFound: !!switcher,
          isDark,
          storedTheme,
          canvasFound: !!canvas,
          ariaChecked: switcher?.getAttribute('aria-checked'),
          role: switcher?.getAttribute('role')
        };
      })()
    `);
    console.log('✓ Initial State Check:', JSON.stringify(initialCheck));
    if (!initialCheck.switcherFound) throw new Error('#desktop-theme-switcher not found in navbar!');
    if (!initialCheck.canvasFound) throw new Error('Interactive Neural Vortex canvas#neuro not found!');

    console.log('[4/7] Capturing Desktop Dark Theme screenshot...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'theme_01_desktop_dark.png'));

    // Toggle to Light Mode
    console.log('[5/7] Clicking Cinematic Theme Switcher to toggle to Light Mode...');
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#desktop-theme-switcher');
        if (btn) btn.click();
      })()
    `);
    await sleep(800);

    const lightCheck = await cdp.eval(`
      (() => {
        const switcher = document.querySelector('#desktop-theme-switcher');
        const isDark = document.documentElement.classList.contains('dark');
        const storedTheme = localStorage.getItem('verinews-theme');
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const navBg = window.getComputedStyle(document.querySelector('header') || document.body).backgroundColor;
        return {
          isDark,
          storedTheme,
          bodyBg,
          navBg,
          ariaChecked: switcher?.getAttribute('aria-checked')
        };
      })()
    `);
    console.log('✓ Light Mode State Check:', JSON.stringify(lightCheck));
    if (lightCheck.isDark !== false) throw new Error('Expected light mode, but .dark class is still on <html>!');
    if (lightCheck.storedTheme !== 'light') throw new Error(`Expected storedTheme === 'light', got ${lightCheck.storedTheme}`);

    console.log('✓ Capturing Desktop Light Theme screenshot...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'theme_02_desktop_light.png'));

    // Verify Neural Vortex is still intact and animating in Light Mode
    const vortexAlive = await cdp.eval(`
      (() => {
        const canvas = document.querySelector('canvas#neuro');
        const gl = canvas ? (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) : null;
        return {
          canvasExists: !!canvas,
          glActive: !!gl,
          pointerEvents: window.getComputedStyle(canvas).pointerEvents
        };
      })()
    `);
    console.log('✓ Neural Vortex Intact Check:', JSON.stringify(vortexAlive));
    if (!vortexAlive.canvasExists || !vortexAlive.glActive) {
      throw new Error('Interactive Neural Vortex canvas was disturbed!');
    }

    // Toggle back to Dark Mode
    console.log('[6/7] Clicking Cinematic Theme Switcher to restore Dark Mode...');
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#desktop-theme-switcher');
        if (btn) btn.click();
      })()
    `);
    await sleep(800);

    const darkRestoredCheck = await cdp.eval(`
      (() => {
        const isDark = document.documentElement.classList.contains('dark');
        const storedTheme = localStorage.getItem('verinews-theme');
        return { isDark, storedTheme };
      })()
    `);
    console.log('✓ Dark Mode Restored Check:', JSON.stringify(darkRestoredCheck));
    if (darkRestoredCheck.isDark !== true) throw new Error('Expected dark mode restored!');

    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'theme_03_desktop_dark_restored.png'));

    // Test Refresh / Persistence across navigation
    console.log('✓ Testing persistence across page refresh...');
    await cdp.send('Page.reload');
    await sleep(2500);

    const persistedCheck = await cdp.eval(`
      (() => {
        const isDark = document.documentElement.classList.contains('dark');
        const storedTheme = localStorage.getItem('verinews-theme');
        return { isDark, storedTheme };
      })()
    `);
    console.log('✓ Persisted Theme Check after Reload:', JSON.stringify(persistedCheck));
    if (persistedCheck.isDark !== true || persistedCheck.storedTheme !== 'dark') {
      throw new Error('Theme was not persisted across reload!');
    }

    // Test Mobile Viewport (375x667)
    console.log('[7/7] Testing Mobile Layout (375x667)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });
    await sleep(800);

    const mobileCheck = await cdp.eval(`
      (() => {
        const switcher = document.querySelector('#mobile-theme-switcher');
        const rect = switcher ? switcher.getBoundingClientRect() : null;
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
          switcherVisible: !!switcher && rect.width > 0 && rect.height > 0,
          rect,
          hasOverflow: scrollWidth > innerWidth
        };
      })()
    `);
    console.log('✓ Mobile Switcher Check:', JSON.stringify(mobileCheck));
    if (!mobileCheck.switcherVisible) throw new Error('Switcher not visible on mobile!');
    if (mobileCheck.hasOverflow) throw new Error('Mobile viewport has horizontal overflow!');

    // Toggle on mobile
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('#mobile-theme-switcher');
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'theme_04_mobile_switcher.png'));

    console.log('\n=== ALL CINEMATIC THEME SWITCHER CHECKS PASSED ===');
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
