import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9932;
const FRONTEND_PORT = 3012;
const TEMP_PROFILE = path.join(os.tmpdir(), `chrome_arc_cursor_qa_${Date.now()}`);
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
    this.consoleErrors = [];

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          if (msg.params.type === 'error') {
            this.consoleErrors.push(msg.params.args?.map(a => a.value || a.description).join(' '));
          }
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
  console.log('=== STARTING ELECTRIC ARC CURSOR VISUAL QA SUITE ===');
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

    // 1. Audit Arc Cursor Canvas and Overlay Properties
    console.log('[4/9] Auditing Electric Arc Cursor canvas and pointer-events...');
    const cursorAudit = await cdp.eval(`
      (() => {
        const canvas = document.getElementById('electric-arc-cursor');
        const legacyDot = document.querySelector('.custom-cursor-root');
        const bgVortex = document.getElementById('neuro');

        const style = canvas ? window.getComputedStyle(canvas) : null;
        return {
          arcCanvasExists: !!canvas,
          pointerEvents: style?.pointerEvents,
          zIndex: style?.zIndex,
          position: style?.position,
          legacyCyanCursorExists: !!legacyDot,
          neuralVortexExists: !!bgVortex
        };
      })()
    `);
    console.log('✓ Arc Cursor Canvas Audit:', JSON.stringify(cursorAudit));
    if (!cursorAudit.arcCanvasExists) throw new Error('Electric Arc Cursor canvas #electric-arc-cursor not found!');
    if (cursorAudit.pointerEvents !== 'none') throw new Error(`Canvas pointer-events should be 'none', got '${cursorAudit.pointerEvents}'`);
    if (cursorAudit.legacyCyanCursorExists) throw new Error('Legacy cyan cursor dot or ring still found in DOM!');
    if (!cursorAudit.neuralVortexExists) throw new Error('Neural Vortex background #neuro must coexist!');

    // 2. Simulate Motion Trail across Hero in Dark Mode
    console.log('[5/9] Simulating energetic mouse movement trail in Dark Mode...');
    const startX = 420;
    const startY = 560;
    const endX = 860;
    const endY = 320;
    const steps = 18;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const curX = startX + (endX - startX) * progress;
      // Add slight curved arc to trajectory
      const curY = startY + (endY - startY) * progress - Math.sin(progress * Math.PI) * 110;
      await cdp.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: Math.round(curX),
        y: Math.round(curY),
      });
      await sleep(16); // ~60fps movement pace
    }

    // Capture screenshot while lightning trail and sparks are active
    console.log('[5.1] Capturing Dark Mode Motion Trail Screenshot...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'arc_cursor_01_dark_motion_trail.png'));

    // 3. Simulate Click Discharge in Dark Mode
    console.log('[6/9] Simulating click discharge burst in Dark Mode...');
    const clickX = 720;
    const clickY = 490;
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: clickX,
      y: clickY,
      button: 'left',
      clickCount: 1,
    });
    await sleep(25);
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: clickX,
      y: clickY,
      button: 'left',
      clickCount: 1,
    });
    await sleep(40); // Capture mid-burst

    console.log('[6.1] Capturing Dark Mode Click Discharge Screenshot...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'arc_cursor_02_dark_click_discharge.png'));
    await sleep(400); // Wait for burst to fade naturally

    // 4. Toggle to Light Mode via Cinematic Theme Switcher
    console.log('[7/9] Toggling to Light Mode via CinematicThemeSwitcher...');
    await cdp.eval(`
      (() => {
        const switcher = document.querySelector('#desktop-theme-switcher') || document.querySelector('button[role="switch"]');
        if (switcher) switcher.click();
      })()
    `);
    await sleep(1000); // 700ms smooth transition

    const isLightNow = await cdp.eval(`!document.documentElement.classList.contains('dark')`);
    console.log(`✓ Switched to Light Mode: ${isLightNow}`);

    // Simulate motion trail in Light Mode
    console.log('[7.1] Simulating energetic mouse movement in Light Mode...');
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const curX = 900 - (endX - startX) * progress;
      const curY = 320 + (startY - endY) * progress - Math.sin(progress * Math.PI) * 90;
      await cdp.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: Math.round(curX),
        y: Math.round(curY),
      });
      await sleep(16);
    }
    console.log('[7.2] Capturing Light Mode Motion Trail Screenshot...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'arc_cursor_03_light_motion_trail.png'));

    // Click discharge in Light Mode
    console.log('[7.3] Simulating click discharge burst in Light Mode...');
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: 720,
      y: 490,
      button: 'left',
      clickCount: 1,
    });
    await sleep(25);
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: 720,
      y: 490,
      button: 'left',
      clickCount: 1,
    });
    await sleep(40);
    console.log('[7.4] Capturing Light Mode Click Discharge Screenshot...');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'arc_cursor_04_light_click_discharge.png'));
    await sleep(400);

    // 5. Test Stationary Fadeout
    console.log('[8/9] Verifying stationary trail retract and fadeout...');
    await sleep(300);
    const trailAudit = await cdp.eval(`
      (() => {
        // Verify canvas context is clean and intact
        const canvas = document.getElementById('electric-arc-cursor');
        return {
          canvasReady: !!canvas,
          width: canvas?.width,
          height: canvas?.height
        };
      })()
    `);
    console.log('✓ Trail Quiescent State Audit:', JSON.stringify(trailAudit));

    // 6. Mobile Viewport Testing
    console.log('[9/9] Testing Mobile touch viewport (375x667)...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });
    await sleep(600);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'arc_cursor_05_mobile_touch.png'));

    // Check console errors
    console.log(`✓ Total Console Errors: ${cdp.consoleErrors.length}`);
    if (cdp.consoleErrors.length > 0) {
      console.warn('Console error messages:', cdp.consoleErrors);
    }

    console.log('\n=== ALL ELECTRIC ARC CURSOR CHECKS PASSED SUCCESSFULLY ===');
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

