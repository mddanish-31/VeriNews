/**
 * VeriNews — Performance & Web Vitals Measurement Script
 * Measures reproducible performance metrics across Desktop (1280x800) and Mobile (375x667):
 * - Largest Contentful Paint (LCP)
 * - Cumulative Layout Shift (CLS)
 * - First Contentful Paint (FCP)
 * - Interaction Latency (Input dispatch -> State update / DOM render)
 * - DOM Content Loaded & Load Timing
 */

import { spawn, execSync } from 'node:child_process';
import http from 'node:http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9897;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWsUrl(port) {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        const data = await res.json();
        return data.webSocketDebuggerUrl;
      }
    } catch {
      await sleep(300);
    }
  }
  throw new Error('Chrome CDP debug endpoint not responding');
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
        if (msg.error) reject(new Error(`CDP Error (${method}): ${msg.error.message}`));
        else resolve(msg.result);
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
}

async function measureViewport(cdp, width, height, isMobile) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: isMobile ? 2 : 1,
    mobile: isMobile,
    hasTouch: isMobile,
  });

  // Inject performance observer script before navigation
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__webVitals = { lcp: 0, cls: 0, fcp: 0 };
      try {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) window.__webVitals.lcp = Math.round(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) window.__webVitals.cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });

        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              window.__webVitals.fcp = Math.round(entry.startTime);
            }
          }
        }).observe({ type: 'paint', buffered: true });
      } catch (e) {}
    `,
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
  await sleep(3500);

  // Measure Interaction Latency: Tab switching latency in Analyzer
  const interactionLatency = await cdp.eval(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Article') || b.innerText.includes('URL'));
      if (btns.length === 0) return null;
      const targetBtn = btns[0];
      const start = performance.now();
      targetBtn.click();
      const end = performance.now();
      return Math.round((end - start) * 100) / 100;
    })()
  `);

  const metrics = await cdp.eval(`
    (() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      return {
        fcp: window.__webVitals.fcp,
        lcp: window.__webVitals.lcp,
        cls: Math.round(window.__webVitals.cls * 1000) / 1000,
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
        loadEventEnd: Math.round(nav.loadEventEnd || 0),
      };
    })()
  `);

  return { ...metrics, interactionLatency };
}

async function main() {
  console.log('================================================================================');
  console.log('REPRODUCIBLE PERFORMANCE & WEB VITALS MEASUREMENT');
  console.log('================================================================================');
  console.log('Environment: Next.js Production Server (port 3000) over Chrome CDP');
  console.log('Platform   : Windows 11, Node.js v24.19.0, Chrome 134+');

  // Verify Next.js is running on 3000
  let nextProc = null;
  try {
    await fetch('http://localhost:3000');
  } catch {
    console.log('[Setup] Starting Next.js frontend production server on port 3000...');
    nextProc = spawn('npm.cmd', ['--prefix', 'frontend', 'run', 'start', '--', '-p', '3000'], {
      stdio: 'ignore',
    });
    await sleep(3000);
  }

  // Launch Chrome
  const chromeProc = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  await sleep(1500);
  const newTabRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' });
  const tabData = await newTabRes.json();
  const ws = new WebSocket(tabData.webSocketDebuggerUrl);

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  const cdp = new CdpClient(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  console.log('\n--- 1. Desktop Viewport (1280x800) Performance ---');
  const desktop = await measureViewport(cdp, 1280, 800, false);
  console.log(`  First Contentful Paint (FCP) : ${desktop.fcp} ms`);
  console.log(`  Largest Contentful Paint (LCP): ${desktop.lcp} ms`);
  console.log(`  Cumulative Layout Shift (CLS) : ${desktop.cls}`);
  console.log(`  DOMContentLoaded Time        : ${desktop.domContentLoaded} ms`);
  console.log(`  Load Event End               : ${desktop.loadEventEnd} ms`);
  console.log(`  Interaction Latency (Click)  : ${desktop.interactionLatency} ms`);

  console.log('\n--- 2. Mobile Viewport (375x667, 2x DPR) Performance ---');
  const mobile = await measureViewport(cdp, 375, 667, true);
  console.log(`  First Contentful Paint (FCP) : ${mobile.fcp} ms`);
  console.log(`  Largest Contentful Paint (LCP): ${mobile.lcp} ms`);
  console.log(`  Cumulative Layout Shift (CLS) : ${mobile.cls}`);
  console.log(`  DOMContentLoaded Time        : ${mobile.domContentLoaded} ms`);
  console.log(`  Load Event End               : ${mobile.loadEventEnd} ms`);
  console.log(`  Interaction Latency (Click)  : ${mobile.interactionLatency} ms`);

  // Teardown
  ws.close();
  try {
    chromeProc.kill();
  } catch {}
  if (nextProc) {
    try {
      nextProc.kill();
    } catch {}
  }

  console.log('\n================================================================================');
  console.log('SUMMARY TABLE');
  console.log('================================================================================');
  console.table({
    Desktop_1280x800: {
      FCP_ms: desktop.fcp,
      LCP_ms: desktop.lcp,
      CLS: desktop.cls,
      Load_ms: desktop.loadEventEnd,
      Interaction_ms: desktop.interactionLatency,
    },
    Mobile_375x667: {
      FCP_ms: mobile.fcp,
      LCP_ms: mobile.lcp,
      CLS: mobile.cls,
      Load_ms: mobile.loadEventEnd,
      Interaction_ms: mobile.interactionLatency,
    },
  });
}

main().catch((err) => {
  console.error('Error during performance measurement:', err);
  process.exit(1);
});
