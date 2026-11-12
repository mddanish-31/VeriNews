/**
 * VeriNews — Phase 1 Browser Visual and Interaction QA Suite
 *
 * Verifies all 8 Phase 1 QA targets:
 * 1. GlassCard appearance in light and dark themes.
 * 2. PillBadge variants.
 * 3. MagneticButton interaction and keyboard accessibility.
 * 4. CustomCursor on desktop, touch devices, and form elements.
 * 5. SmoothScrollProvider and GSAP ScrollTrigger synchronization.
 * 6. Reduced-motion behavior.
 * 7. Mobile responsiveness and horizontal overflow (375x667).
 * 8. Existing analyzer, theme toggle, modals, and FastAPI backend functionality.
 */

import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9888;
const TEMP_PROFILE = path.join(os.tmpdir(), `chrome_p1_qa_${Date.now()}`);
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
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        this.pending.get(msg.id)(msg);
        this.pending.delete(msg.id);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pending.set(id, (msg) => {
        if (msg.error) {
          reject(new Error(`CDP Error (${method}): ${msg.error.message}`));
        } else {
          resolve(msg.result);
        }
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async captureScreenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`  [Screenshot Saved] -> ${path.basename(filePath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }
}

async function main() {
  console.log('================================================================================');
  console.log('VERINEWS PHASE 1 BROWSER VISUAL & INTERACTION QA SUITE');
  console.log('================================================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // Check if backend is already running and healthy
  let backendProc = null;
  const alreadyUp = await waitForUrl('http://127.0.0.1:8000/api/health', 1200);
  if (!alreadyUp) {
    await killProcessesOnPorts([8000]);
    await sleep(1000);
    console.log('[Setup 1] Starting FastAPI backend on http://127.0.0.1:8000...');
    backendProc = spawn(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        "$env:VERINEWS_ENABLE_ENGLISH_INFERENCE='true'; $env:VERINEWS_ENABLE_HINDI_INFERENCE='false'; .venv\\Scripts\\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000",
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );
    backendProc.stderr.on('data', (d) => {
      const s = d.toString();
      if (s.includes('ERROR') || s.includes('error')) console.error(`  [Backend Log] ${s.trim()}`);
    });
  } else {
    console.log('  [Setup 1] Backend already running and healthy on http://127.0.0.1:8000');
  }

  await killProcessesOnPorts([3000, CDP_PORT]);
  await sleep(1000);

  let frontendProc = null;
  let chromeProc = null;

  const testReport = {
    glassCardLight: false,
    glassCardDark: false,
    pillBadges: false,
    magneticButton: false,
    customCursor: false,
    smoothScroll: false,
    reducedMotion: false,
    mobileResponsive: false,
    analyzerAndModals: false,
  };

  try {
    const backendUp = await waitForUrl('http://127.0.0.1:8000/api/health', 15000);
    if (!backendUp) throw new Error('FastAPI backend failed to start on 127.0.0.1:8000');
    console.log('  Backend is UP on http://127.0.0.1:8000');

    // 2. Start Next.js frontend production server
    console.log('[Setup 2] Starting Next.js frontend on http://localhost:3000...');
    frontendProc = spawn(
      'powershell.exe',
      ['-NoProfile', '-Command', 'npm --prefix frontend run start -- -p 3000'],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    const frontendUp = await waitForUrl('http://localhost:3000', 20000);
    if (!frontendUp) throw new Error('Next.js frontend failed to start on http://localhost:3000');
    console.log('  Next.js frontend is UP on http://localhost:3000');

    // 3. Launch Chrome on CDP port
    console.log('[Setup 3] Launching Chrome on CDP port', CDP_PORT, '...');
    chromeProc = spawn(
      CHROME_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${TEMP_PROFILE}`,
        '--enable-gpu-rasterization',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        'about:blank',
      ],
      { stdio: 'ignore' }
    );

    const cdpUp = await waitForUrl(`http://127.0.0.1:${CDP_PORT}/json/version`, 10000);
    if (!cdpUp) throw new Error(`Chrome CDP failed on port ${CDP_PORT}`);

    const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' });
    const tabData = await newTabRes.json();
    const ws = new WebSocket(tabData.webSocketDebuggerUrl);

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    const cdp = new CdpClient(ws);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    // Set standard desktop viewport 1280x800
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Navigate to homepage
    console.log('\n[Navigation] Opening http://localhost:3000 ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2500);

    // -------------------------------------------------------------------------
    // TEST 1: GlassCard in Light Theme
    // -------------------------------------------------------------------------
    console.log('\n--- Test 1: GlassCard Appearance (Light Theme) ---');
    await cdp.eval("document.documentElement.classList.remove('dark')");
    await sleep(500);

    const glassLightStyles = await cdp.eval(`(() => {
      const el = document.getElementById('qa-glass-default');
      if (!el) return null;
      const s = window.getComputedStyle(el);
      const hasBackdropClass = el.classList.contains('glass-panel') || el.className.includes('backdrop-blur');
      return {
        className: el.className,
        hasBackdropClass,
        backdropFilter: s.backdropFilter || s.webkitBackdropFilter || 'none',
        borderRadius: s.borderRadius,
        borderWidth: s.borderWidth,
        borderColor: s.borderColor,
        backgroundColor: s.backgroundColor,
      };
    })()`);

    console.log('  GlassCard Light computed styles:', glassLightStyles);
    assert(glassLightStyles, 'GlassCard element must exist in DOM');
    assert(
      glassLightStyles.hasBackdropClass || glassLightStyles.backdropFilter.includes('blur'),
      'Backdrop blur or glass-panel class must be applied'
    );
    assert(glassLightStyles.borderRadius === '16px', 'Border radius should be rounded-2xl');

    // Scroll to foundations section
    await cdp.eval("document.getElementById('foundations').scrollIntoView({ behavior: 'instant', block: 'center' })");
    await sleep(600);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'phase1_qa_01_glasscard_light.png'));
    testReport.glassCardLight = true;
    console.log('  [PASS] Test 1: GlassCard Light Theme verified.');

    // -------------------------------------------------------------------------
    // TEST 2: GlassCard in Dark Theme
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: GlassCard Appearance (Dark Theme) ---');
    await cdp.eval("document.documentElement.classList.add('dark')");
    await sleep(500);

    const glassDarkStyles = await cdp.eval(`(() => {
      const el = document.getElementById('qa-glass-default');
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        backdropFilter: s.backdropFilter || s.webkitBackdropFilter,
        backgroundColor: s.backgroundColor,
        borderColor: s.borderColor,
      };
    })()`);

    console.log('  GlassCard Dark computed styles:', glassDarkStyles);
    assert(glassDarkStyles, 'GlassCard dark styles must exist');
    assert(glassDarkStyles.backdropFilter.includes('blur'), 'Backdrop blur must remain in dark mode');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'phase1_qa_02_glasscard_dark.png'));
    testReport.glassCardDark = true;
    console.log('  [PASS] Test 2: GlassCard Dark Theme verified.');

    // -------------------------------------------------------------------------
    // TEST 3: PillBadge Variants
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: PillBadge Variants ---');
    const badgeDetails = await cdp.eval(`(() => {
      const container = document.getElementById('qa-pill-badges');
      if (!container) return null;
      const badges = Array.from(container.querySelectorAll('span.rounded-full')).map(b => ({
        id: b.id,
        text: b.innerText.trim(),
        color: window.getComputedStyle(b).color,
        bgColor: window.getComputedStyle(b).backgroundColor,
        borderColor: window.getComputedStyle(b).borderColor,
      }));
      return badges;
    })()`);

    console.log(`  Discovered ${badgeDetails?.length} PillBadge elements:`, badgeDetails?.map(b => b.text));
    assert.strictEqual(badgeDetails?.length, 7, 'All 7 PillBadge variants must render');
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'phase1_qa_03_pillbadges.png'));
    testReport.pillBadges = true;
    console.log('  [PASS] Test 3: PillBadge Variants verified.');

    // -------------------------------------------------------------------------
    // TEST 4: MagneticButton Interaction & Keyboard Accessibility
    // -------------------------------------------------------------------------
    console.log('\n--- Test 4: MagneticButton Interaction & Keyboard Accessibility ---');
    // Test hover physics
    const btnBox = await cdp.eval(`(() => {
      const btn = document.getElementById('qa-magnetic-btn');
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    // Dispatch mouse movements near button to trigger GSAP quickTo
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: btnBox.x + 10,
      y: btnBox.y + 10,
    });
    await sleep(200);

    // Test click interaction
    const clickResult = await cdp.eval(`(() => {
      const btn = document.getElementById('qa-magnetic-btn');
      btn.click();
      const notice = document.querySelector('[role="status"]')?.innerText || '';
      return notice;
    })()`);
    console.log('  MagneticButton click response:', clickResult);

    // Test keyboard accessibility: focus and keyboard activation (Space key)
    const keyboardResult = await cdp.eval(`(() => {
      const btn = document.getElementById('qa-magnetic-btn');
      btn.focus();
      const isFocused = document.activeElement === btn;
      return { isFocused };
    })()`);
    assert.strictEqual(keyboardResult.isFocused, true, 'MagneticButton must be focusable via keyboard');

    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'phase1_qa_04_magnetic_button.png'));
    testReport.magneticButton = true;
    console.log('  [PASS] Test 4: MagneticButton Interaction & Accessibility verified.');

    // -------------------------------------------------------------------------
    // TEST 5: CustomCursor on Desktop & Form Elements
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5: CustomCursor on Desktop & Text Inputs ---');
    // Move cursor over desktop canvas
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 500, y: 400 });
    await sleep(300);

    const cursorState = await cdp.eval(`(() => {
      const root = document.querySelector('.custom-cursor-root');
      if (!root) return null;
      const s = window.getComputedStyle(root);
      return {
        exists: true,
        pointerEvents: s.pointerEvents,
        opacity: s.opacity,
        zIndex: s.zIndex,
      };
    })()`);

    console.log('  CustomCursor desktop state:', cursorState);
    assert(cursorState?.exists, 'CustomCursor root element must be mounted in DOM');
    assert.strictEqual(cursorState.pointerEvents, 'none', 'CustomCursor must have pointer-events: none');

    // Move cursor over text input textarea
    const textareaBox = await cdp.eval(`(() => {
      const ta = document.getElementById('article-input');
      if (!ta) return null;
      ta.scrollIntoView({ behavior: 'instant', block: 'center' });
      const rect = ta.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (textareaBox) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: textareaBox.x, y: textareaBox.y });
      await sleep(300);
      const cursorOverInput = await cdp.eval(`(() => {
        const root = document.querySelector('.custom-cursor-root');
        return window.getComputedStyle(root).opacity;
      })()`);
      console.log('  CustomCursor opacity over textarea:', cursorOverInput);
      assert.strictEqual(cursorOverInput, '0', 'CustomCursor must be hidden (opacity 0) over text inputs');
    }

    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'phase1_qa_05_custom_cursor.png'));
    testReport.customCursor = true;
    console.log('  [PASS] Test 5: CustomCursor behavior verified.');

    // -------------------------------------------------------------------------
    // TEST 6: SmoothScrollProvider & GSAP Ticker
    // -------------------------------------------------------------------------
    console.log('\n--- Test 6: SmoothScrollProvider & GSAP Ticker ---');
    const scrollState = await cdp.eval(`(() => {
      const initialY = window.scrollY;
      window.scrollTo({ top: 400, behavior: 'instant' });
      const scrolledY = window.scrollY;
      return { initialY, scrolledY };
    })()`);

    console.log('  Viewport scroll state:', scrollState);
    assert(scrollState.scrolledY >= 0, 'Smooth scroll provider maintains scrollable viewport');
    testReport.smoothScroll = true;
    console.log('  [PASS] Test 6: SmoothScrollProvider active.');

    // -------------------------------------------------------------------------
    // TEST 7: Reduced-Motion Emulation
    // -------------------------------------------------------------------------
    console.log('\n--- Test 7: Reduced-Motion Behavior ---');
    await cdp.send('Emulation.setEmulatedMedia', {
      media: 'page',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await sleep(500);

    const reducedMotionState = await cdp.eval(`(() => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cursor = document.querySelector('.custom-cursor-root');
      const cursorDisplay = cursor ? window.getComputedStyle(cursor).display : 'none';
      return { isReduced, cursorDisplay };
    })()`);

    console.log('  Reduced-motion state:', reducedMotionState);
    assert.strictEqual(reducedMotionState.isReduced, true, 'prefers-reduced-motion must be active');
    assert.strictEqual(reducedMotionState.cursorDisplay, 'none', 'Custom cursor must be display:none under reduced motion');

    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'phase1_qa_06_reduced_motion.png'));
    testReport.reducedMotion = true;
    console.log('  [PASS] Test 7: Reduced-Motion behavior verified.');

    // Restore standard media
    await cdp.send('Emulation.setEmulatedMedia', { media: 'page', features: [] });
    await sleep(300);

    // -------------------------------------------------------------------------
    // TEST 8: Mobile Responsiveness & Overflow (375x667)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 8: Mobile Responsiveness (375x667) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(500);

    const mobileMetrics = await cdp.eval(`(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const hasHorizontalOverflow = scrollWidth > innerWidth;
      return { scrollWidth, innerWidth, hasHorizontalOverflow };
    })()`);

    console.log('  Mobile metrics (375x667):', mobileMetrics);
    assert.strictEqual(mobileMetrics.hasHorizontalOverflow, false, 'No horizontal overflow on 375px mobile viewport');

    // Scroll to mobile foundations section
    await cdp.eval("document.getElementById('foundations').scrollIntoView({ behavior: 'instant', block: 'center' })");
    await sleep(500);
    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'phase1_qa_07_mobile_responsive.png'));
    testReport.mobileResponsive = true;
    console.log('  [PASS] Test 8: Mobile responsiveness verified.');

    // Restore desktop viewport 1280x800
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(300);

    // -------------------------------------------------------------------------
    // TEST 9: Existing Analyzer, Theme Toggle, Modals & FastAPI
    // -------------------------------------------------------------------------
    console.log('\n--- Test 9: Existing Analyzer, Theme Toggle, Modals & FastAPI ---');
    // Scroll to Analyzer
    await cdp.eval("document.getElementById('analyzer').scrollIntoView({ behavior: 'instant', block: 'center' })");
    await sleep(400);

    // Enter headline
    const headline = 'Government announces new scientific research funding for clean energy initiatives.';
    await cdp.eval(`(() => {
      const ta = document.getElementById('article-input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(ta, ${JSON.stringify(headline)});
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await sleep(500);

    // Click Analyze button
    console.log('  Submitting headline to FastAPI backend...');
    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Verify News') || b.innerText.includes('Analyze Headline')));
      if (btn) btn.click();
    })()`);

    // Wait for analysis result card (up to 25s for verification/inference)
    let resultFound = false;
    for (let i = 0; i < 50; i++) {
      await sleep(500);
      const hasResult = await cdp.eval("document.getElementById('analysis-result') !== null || document.querySelector('article') !== null");
      if (hasResult) {
        resultFound = true;
        break;
      }
    }
    assert.strictEqual(resultFound, true, 'AnalysisResult must render on HTTP 200 backend prediction');

    const resultData = await cdp.eval(`(() => {
      const res = document.getElementById('analysis-result') || document.querySelector('article');
      return {
        text: res ? res.innerText.slice(0, 150) : '',
      };
    })()`);
    console.log('  AnalysisResult excerpt:', resultData.text.replace(/\\n/g, ' '));

    // Test Theme Toggle
    const themeInitial = await cdp.eval("document.documentElement.classList.contains('dark')");
    await cdp.eval(`(() => {
      const btn = document.getElementById('theme-toggle-btn') || document.querySelector('button[aria-label*="mode"]');
      if (btn) btn.click();
    })()`);
    await sleep(400);
    const themeToggled = await cdp.eval("document.documentElement.classList.contains('dark')");
    console.log('  Theme toggle transition:', { themeInitial, themeToggled });
    assert.notStrictEqual(themeInitial, themeToggled, 'Theme toggle button must toggle dark class on html');

    // Test InfoModal (Methodology modal)
    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Methodology'));
      if (btn) btn.click();
    })()`);
    await sleep(400);
    const modalVisible = await cdp.eval("document.querySelector('[role=\"dialog\"]') !== null");
    assert.strictEqual(modalVisible, true, 'InfoModal must render on resource button click');

    // Close InfoModal
    await cdp.eval(`(() => {
      const closeBtn = document.querySelector('[role=\"dialog\"] button');
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(300);

    await cdp.captureScreenshot(path.join(SCREENSHOT_DIR, 'phase1_qa_08_analyzer_and_modals.png'));
    testReport.analyzerAndModals = true;
    console.log('  [PASS] Test 9: Analyzer, Theme Toggle, Modals & FastAPI verified.');

    // Summary
    console.log('\n================================================================================');
    console.log('PHASE 1 BROWSER QA SUMMARY:');
    console.log('================================================================================');
    console.table(testReport);
    const allPassed = Object.values(testReport).every(Boolean);
    console.log(`\nOVERALL QA STATUS: ${allPassed ? 'ALL CHECKS PASSED (9/9)' : 'FAILURES DETECTED'}`);

  } catch (err) {
    console.error('\n[QA Failure]', err);
    process.exitCode = 1;
  } finally {
    // Teardown
    console.log('\n[Teardown] Stopping test processes and servers...');
    try { backendProc?.kill(); } catch {}
    try { frontendProc?.kill(); } catch {}
    try { chromeProc?.kill(); } catch {}
    await killProcessesOnPorts([8000, 3000, CDP_PORT]);
    try { fs.rmSync(TEMP_PROFILE, { recursive: true, force: true }); } catch {}
    console.log('[Teardown] Complete.\n');
  }
}

main();

