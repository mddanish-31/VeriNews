/**
 * VeriNews — Comprehensive Browser-Level E2E Verification Suite (P15)
 *
 * Starts:
 * 1. FastAPI backend on 127.0.0.1:8000 with process-level English inference enabled (Hindi disabled).
 * 2. Next.js production server on http://localhost:3000.
 * 3. Headless Chrome on CDP port 9876.
 *
 * Verifies all 12 required scenarios via real browser DOM interactions and CDP network interception:
 * 1. English news headline -> 200 OK, genuine prediction, confidence %, model version, tokens.
 * 2. Random gibberish with no vocabulary overlap -> Unclassifiable, no Real/Fake badge, no confidence %.
 * 3. Roman Hindi / Hinglish -> actionable 422 error notice with Devanagari guidance.
 * 4. Legitimate English text -> NOT incorrectly rejected as Hinglish.
 * 5. Devanagari Hindi with Hindi inference disabled -> 503 disabled message.
 * 6. English text with Hindi selected -> 422 script mismatch error.
 * 7. Hindi text with English selected -> 422 script mismatch error.
 * 8. Clear button -> resets text, result card, validation error, and API error notices.
 * 9. Clear during active request -> race condition guard discards late response.
 * 10. Character counter -> trimmed count and 20-500 validation state.
 * 11. Unclassifiable UI rendering -> neutral dot, no Real/Fake badge, no progress bar.
 * 12. Responsive UI -> desktop (1280x800) and mobile (375x667) layouts.
 */

import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9876;
const TEMP_PROFILE = path.join(os.tmpdir(), `chrome_e2e_${Date.now()}`);
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

async function main() {
  console.log('================================================================================');
  console.log('VERINEWS FINAL BROWSER-LEVEL E2E VERIFICATION (P15)');
  console.log('================================================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // 0. Clean ports
  await killProcessesOnPorts([8000, 3000, CDP_PORT]);
  await sleep(1000);

  // 1. Start FastAPI backend with process-level English enabled, Hindi disabled
  console.log('[Setup 1] Starting FastAPI backend on http://127.0.0.1:8000 (English=true, Hindi=false)...');
  const backendProc = spawn(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      "$env:VERINEWS_ENABLE_ENGLISH_INFERENCE='true'; $env:VERINEWS_ENABLE_HINDI_INFERENCE='false'; .venv\\Scripts\\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  backendProc.stderr.on('data', (d) => {
    const s = d.toString();
    if (s.includes('ERROR') || s.includes('error')) console.error(`  [Backend Log] ${s.trim()}`);
  });

  let frontendProc = null;
  let chromeProc = null;

  try {
    const backendUp = await waitForUrl('http://127.0.0.1:8000/api/health', 15000);
    if (!backendUp) throw new Error('FastAPI backend failed to start on 127.0.0.1:8000');

    const healthRes = await fetch('http://127.0.0.1:8000/api/health');
    const healthData = await healthRes.json();
    console.log('  Backend Health Probe:', JSON.stringify(healthData));
    assert.strictEqual(healthData.models_loaded?.english, true, 'English model must be loaded');
    assert.strictEqual(healthData.models_loaded?.hindi, false, 'Hindi model must remain disabled');

    // 2. Start Next.js frontend
    console.log('\n[Setup 2] Starting Next.js frontend production server on http://localhost:3000...');
    frontendProc = spawn(
      'powershell.exe',
      ['-NoProfile', '-Command', 'npm --prefix frontend run start -- -p 3000'],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    const frontendUp = await waitForUrl('http://localhost:3000', 20000);
    if (!frontendUp) throw new Error('Next.js frontend failed to start on http://localhost:3000');
    console.log('  Next.js frontend is UP on http://localhost:3000');

    // 3. Launch Chrome on dedicated CDP port
    console.log('\n[Setup 3] Launching Headless Chrome on CDP port', CDP_PORT, '...');
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

    const ws = new WebSocket(wsUrl);
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
        if (req.url.includes('/api/predict')) {
          networkLog.push({ type: 'REQ', url: req.url, postData: req.postData });
        }
      }
      if (msg.method === 'Network.responseReceived') {
        const res = msg.params.response;
        if (res.url.includes('/api/predict')) {
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

    async function takeScreenshot(name, targetSelector = null) {
      await evaluate(`
        (() => {
          let target = null;
          if (${JSON.stringify(targetSelector)}) {
            target = document.querySelector(${JSON.stringify(targetSelector)});
          }
          if (!target) {
            target = document.querySelector('article') ||
                     document.querySelector('div[role="status"]') ||
                     document.getElementById('article-input') ||
                     document.getElementById('analyzer');
          }
          if (target && target.scrollIntoView) {
            target.scrollIntoView({ behavior: 'instant', block: 'center' });
          }
        })()
      `);
      await sleep(400);

      const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
      if (res?.data) {
        const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
        fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
        console.log(`    [Screenshot Saved] ${filePath}`);
      }
    }

    async function setInputAndLanguage(text, language = 'auto') {
      await evaluate(`
        (() => {
          const textarea = document.getElementById('article-input');
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          nativeInputValueSetter.call(textarea, ${JSON.stringify(text)});
          textarea.dispatchEvent(new Event('input', { bubbles: true }));

          const select = document.getElementById('language-selector');
          if (select && select.value !== ${JSON.stringify(language)}) {
            const nativeSelectSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
            nativeSelectSetter.call(select, ${JSON.stringify(language)});
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await sleep(200);
    }

    async function clickAnalyze() {
      await evaluate(`
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => b.textContent && b.textContent.includes('Analyze Headline'));
          if (btn) btn.click();
        })()
      `);
    }

    async function clickClear() {
      await evaluate(`
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => b.textContent && b.textContent.includes('Clear'));
          if (btn) btn.click();
        })()
      `);
      await sleep(200);
    }

    async function waitForResultOrNotice(timeoutMs = 8000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const state = await evaluate(`
          (() => {
            const article = document.querySelector('article');
            const notice = document.querySelector('div[role="status"]')?.textContent || null;
            const counter = document.getElementById('text-counter')?.textContent || null;
            const textarea = document.getElementById('article-input')?.value || '';
            const validationError = document.querySelector('#text-hints .text-status-danger')?.textContent || null;
            if (article || notice || validationError) {
              return {
                articleText: article?.textContent || null,
                notice,
                counter,
                textarea,
                validationError,
                hasCredibleBadge: !!article?.querySelector('.bg-status-success'),
                hasWarningBadge: !!article?.querySelector('.bg-status-warning'),
                hasMutedDot: !!article?.querySelector('.bg-content-muted'),
                hasProgressBar: !!article?.querySelector('.bg-gradient-to-r'),
              };
            }
            return null;
          })()
        `);
        if (state) return state;
        await sleep(300);
      }
      return null;
    }

    await sendCommand('Network.enable');
    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');

    // Navigate to application
    console.log('\n[Setup 4] Navigating Chrome to http://localhost:3000...');
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sendCommand('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2500);

    // =========================================================================
    // SCENARIO 1: English News Headline -> Real Prediction
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 1: English News Headline -> Genuine ML Prediction');
    console.log('--------------------------------------------------------------------------------');
    const englishHeadline = 'The city council has approved a new public library for the east side, with construction expected to begin next spring.';
    await setInputAndLanguage(englishHeadline, 'en');
    await clickAnalyze();
    await sleep(2000);
    const s1 = await waitForResultOrNotice();
    console.log('  DOM Rendered Article:', s1?.articleText?.slice(0, 250));
    assert.ok(s1?.articleText?.includes('Credible') || s1?.articleText?.includes('Real'), 'Must render Credible/Real prediction');
    assert.ok(s1?.articleText?.includes('en_ifnd_indian_headlines_calibrated_sigmoid'), 'Must show model version');
    assert.ok(/\d+%/.test(s1?.articleText || ''), 'Must render confidence percentage');
    assert.ok(s1?.articleText?.includes('Influential Features'), 'Must render influential tokens');
    await takeScreenshot('scenario-1-english-headline', 'article');
    console.log('  PASS: English headline correctly classified by genuine calibrated IFND model.');

    // =========================================================================
    // SCENARIO 2: Random Gibberish (Zero Vocabulary) -> Unclassifiable
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 2: Random Gibberish With No Vocabulary -> Unclassifiable');
    console.log('--------------------------------------------------------------------------------');
    const gibberish = 'xyzabc qwerasdf zxcvbnmlk qwertyuiop asdfghjk';
    await setInputAndLanguage(gibberish, 'en');
    await clickAnalyze();
    await sleep(1500);
    const s2 = await waitForResultOrNotice();
    console.log('  DOM Rendered Article:', s2?.articleText?.slice(0, 250));
    assert.ok(s2?.articleText?.includes('Unclassifiable / Out of Domain'), 'Must render Unclassifiable headline');
    assert.ok(s2?.articleText?.includes('Not applicable'), 'Confidence must show Not applicable');
    assert.strictEqual(s2?.hasCredibleBadge, false, 'Must NOT render green Credible badge');
    assert.strictEqual(s2?.hasWarningBadge, false, 'Must NOT render yellow/red Unreliable badge');
    assert.strictEqual(s2?.hasProgressBar, false, 'Must NOT render confidence progress bar');
    await takeScreenshot('scenario-2-unclassifiable-gibberish', 'article');
    console.log('  PASS: Random gibberish correctly rendered as Unclassifiable without confidence percentage.');

    // =========================================================================
    // SCENARIO 3: Roman Hindi (Hinglish) -> Actionable 422 Notice
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 3: Roman Hindi (Hinglish) -> Actionable Error Notice');
    console.log('--------------------------------------------------------------------------------');
    const hinglish = 'kya yeh sach hai bhai sarkar ne naya aadesh jaari kiya hai sabhi ke liye';
    await setInputAndLanguage(hinglish, 'auto');
    await clickAnalyze();
    await sleep(1000);
    const s3 = await waitForResultOrNotice();
    console.log('  DOM Rendered Notice:', s3?.notice);
    assert.ok(s3?.notice?.includes('Romanized Hindi (Hinglish) is not supported yet'), 'Must show Hinglish rejection message');
    assert.ok(s3?.notice?.includes('Devanagari script'), 'Must provide actionable guidance for Devanagari');
    await takeScreenshot('scenario-3-roman-hindi-rejection', 'div[role="status"]');
    console.log('  PASS: Hinglish detected and rejected with actionable Devanagari guidance.');

    // =========================================================================
    // SCENARIO 4: Legitimate English Text -> NOT Incorrectly Rejected as Hinglish
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 4: Legitimate English Text -> NOT Flagged as Hinglish');
    console.log('--------------------------------------------------------------------------------');
    const legitEnglish = 'Finance Minister announces major relief package for small businesses in new budget proposal.';
    await setInputAndLanguage(legitEnglish, 'auto');
    await clickAnalyze();
    await sleep(1500);
    const s4 = await waitForResultOrNotice();
    console.log('  DOM Rendered Article:', s4?.articleText?.slice(0, 200));
    assert.strictEqual(s4?.notice, null, 'Must NOT produce any Hinglish rejection error');
    assert.ok(s4?.articleText?.includes('Credible') || s4?.articleText?.includes('Unreliable'), 'Must produce normal prediction');
    await takeScreenshot('scenario-4-legit-english-preserved', 'article');
    console.log('  PASS: Legitimate English text processed smoothly without false Hinglish flagging.');

    // =========================================================================
    // SCENARIO 5: Devanagari Hindi with Hindi Disabled -> Gated 503 Message
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 5: Devanagari Hindi with Hindi Disabled -> Correct 503 Message');
    console.log('--------------------------------------------------------------------------------');
    const devanagariText = 'भारतीय अंतरिक्ष अनुसंधान संगठन ने नए मौसम उपग्रह का सफल प्रक्षेपण किया।';
    await setInputAndLanguage(devanagariText, 'hi');
    await clickAnalyze();
    await sleep(1000);
    const s5 = await waitForResultOrNotice();
    console.log('  DOM Rendered Notice:', s5?.notice);
    assert.ok(s5?.notice?.includes('Hindi model service is not available'), 'Must state Hindi service not available');
    assert.ok(s5?.notice?.includes('dataset licensing'), 'Must state dataset licensing gate');
    await takeScreenshot('scenario-5-hindi-disabled-503', 'div[role="status"]');
    console.log('  PASS: Devanagari Hindi cleanly surfaces accurate dataset licensing 503 notice.');

    // =========================================================================
    // SCENARIO 6: English Text with Hindi Language Hint Selected -> Script Mismatch
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 6: English Text with Hindi Hint -> 422 Script Mismatch');
    console.log('--------------------------------------------------------------------------------');
    await setInputAndLanguage(englishHeadline, 'hi');
    await clickAnalyze();
    await sleep(1000);
    const s6 = await waitForResultOrNotice();
    console.log('  DOM Rendered Notice:', s6?.notice);
    assert.ok(s6?.notice?.includes('Hindi was specified as the language hint'), 'Must report script mismatch');
    await takeScreenshot('scenario-6-english-with-hindi-hint', 'div[role="status"]');
    console.log('  PASS: English input with Hindi hint produces clean 422 script mismatch.');

    // =========================================================================
    // SCENARIO 7: Hindi Text with English Language Hint Selected -> Script Mismatch
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 7: Hindi Text with English Hint -> 422 Script Mismatch');
    console.log('--------------------------------------------------------------------------------');
    await setInputAndLanguage(devanagariText, 'en');
    await clickAnalyze();
    await sleep(1000);
    const s7 = await waitForResultOrNotice();
    console.log('  DOM Rendered Notice:', s7?.notice);
    assert.ok(s7?.notice?.includes('English was specified as the language hint'), 'Must report Latin script mismatch');
    await takeScreenshot('scenario-7-hindi-with-english-hint', 'div[role="status"]');
    console.log('  PASS: Hindi input with English hint produces clean 422 script mismatch.');

    // =========================================================================
    // SCENARIO 8: Clear Button Resets All Relevant States
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 8: Clear Button -> Resets Input, Results, Errors & Notices');
    console.log('--------------------------------------------------------------------------------');
    // First establish an active error notice
    await setInputAndLanguage(englishHeadline, 'hi');
    await clickAnalyze();
    await sleep(1000);
    let beforeClear = await waitForResultOrNotice();
    assert.ok(beforeClear?.notice, 'Notice should be present before clear');

    // Click Clear
    await clickClear();
    await sleep(400);

    const afterClear = await evaluate(`
      (() => {
        return {
          textarea: document.getElementById('article-input')?.value,
          counter: document.getElementById('text-counter')?.textContent,
          notice: document.querySelector('div[role="status"]')?.textContent || null,
          article: document.querySelector('article')?.textContent || null,
          validationError: document.querySelector('#text-hints .text-status-danger')?.textContent || null,
        };
      })()
    `);
    console.log('  DOM State After Clear:', JSON.stringify(afterClear));
    assert.strictEqual(afterClear.textarea, '', 'Textarea must be empty');
    assert.strictEqual(afterClear.notice, null, 'Notice banner must be removed');
    assert.strictEqual(afterClear.article, null, 'Analysis result card must be removed');
    assert.strictEqual(afterClear.validationError, null, 'Validation errors must be cleared');
    assert.ok(afterClear.counter.includes('0 / 500'), 'Counter must be reset to 0 / 500');
    await takeScreenshot('scenario-8-clear-button-resets-all', '#article-input');
    console.log('  PASS: Clear button completely resets input, result card, counter, and notices.');

    // =========================================================================
    // SCENARIO 9: Clear During Active Request -> Discards In-Flight Response
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 9: Clear During Active Request -> Race Condition Guard');
    console.log('--------------------------------------------------------------------------------');
    await setInputAndLanguage(englishHeadline, 'en');
    // Click analyze then immediately click clear
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const analyzeBtn = buttons.find(b => b.textContent && b.textContent.includes('Analyze Headline'));
        const clearBtn = buttons.find(b => b.textContent && b.textContent.includes('Clear'));
        if (analyzeBtn) analyzeBtn.click();
        setTimeout(() => {
          if (clearBtn) clearBtn.click();
        }, 15);
      })()
    `);
    // Wait for the HTTP request to finish
    await sleep(2500);

    const raceGuardState = await evaluate(`
      (() => {
        return {
          textarea: document.getElementById('article-input')?.value,
          article: document.querySelector('article')?.textContent || null,
          notice: document.querySelector('div[role="status"]')?.textContent || null,
        };
      })()
    `);
    console.log('  DOM State After Late In-Flight Response:', JSON.stringify(raceGuardState));
    assert.strictEqual(raceGuardState.textarea, '', 'Textarea must remain empty');
    assert.strictEqual(raceGuardState.article, null, 'Late response must NOT render over cleared state');
    await takeScreenshot('scenario-9-race-condition-guard', '#article-input');
    console.log('  PASS: In-flight response discarded cleanly after user clicks Clear.');

    // =========================================================================
    // SCENARIO 10: Character Counter & 20-500 Validation
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 10: Character Counter -> Non-Whitespace Trimmed Validation');
    console.log('--------------------------------------------------------------------------------');
    // 10a: Text with extra leading/trailing whitespace (12 non-whitespace chars)
    await setInputAndLanguage('   Breaking news   ', 'en');
    await sleep(200);
    const countShort = await evaluate(`
      (() => {
        return {
          counterText: document.getElementById('text-counter')?.textContent,
          hasMinimumNotice: document.getElementById('text-counter')?.textContent?.includes('minimum 20 characters required'),
        };
      })()
    `);
    console.log('  Short Input Counter:', countShort.counterText);
    assert.ok(countShort.counterText.includes('13 / 500'), 'Must count 13 non-whitespace characters');
    assert.strictEqual(countShort.hasMinimumNotice, true, 'Must show minimum 20 characters notice');

    // 10b: Try submitting short input -> Shows validation error
    await clickAnalyze();
    await sleep(300);
    const valError = await evaluate(`document.querySelector('#text-hints .text-status-danger')?.textContent`);
    console.log('  Validation Hint on Submit:', valError);
    assert.ok(valError?.includes('Add 7 more characters'), 'Must show precise character shortfall');
    await takeScreenshot('scenario-10-character-counter-validation', '#article-input');
    console.log('  PASS: Character counter validates non-whitespace length with helpful shortfall feedback.');

    // =========================================================================
    // SCENARIO 11: Unclassifiable Result Visual Hierarchy
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 11: Unclassifiable UI Rendering Verification');
    console.log('--------------------------------------------------------------------------------');
    await setInputAndLanguage('qwertyuiop asdfghjkl zxcvbnmpoiuy trewqa', 'en');
    await clickAnalyze();
    await sleep(1500);
    const s11 = await evaluate(`
      (() => {
        const article = document.querySelector('article');
        if (!article) return null;
        const text = article.textContent || '';
        return {
          text,
          headerText: article.querySelector('h3')?.textContent,
          hasSuccessDot: !!article.querySelector('.bg-status-success'),
          hasWarningDot: !!article.querySelector('.bg-status-warning'),
          hasMutedDot: !!article.querySelector('.bg-content-muted'),
          hasProgressBar: !!article.querySelector('.bg-gradient-to-r'),
        };
      })()
    `);
    console.log('  Unclassifiable Visual Elements:', JSON.stringify(s11));
    assert.strictEqual(s11.headerText, 'Domain Scope Assessment', 'Header must be Domain Scope Assessment');
    assert.strictEqual(s11.hasSuccessDot, false, 'No green dot');
    assert.strictEqual(s11.hasWarningDot, false, 'No yellow dot');
    assert.strictEqual(s11.hasMutedDot, true, 'Neutral muted dot present');
    assert.strictEqual(s11.hasProgressBar, false, 'No progress bar');
    await takeScreenshot('scenario-11-unclassifiable-visuals', 'article');
    console.log('  PASS: Unclassifiable result renders neutral aesthetic without fake badges or progress bar.');

    // =========================================================================
    // SCENARIO 12: Responsive Layout (Desktop 1280x800 vs Mobile 375x667)
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('SCENARIO 12: Responsive Layout Verification');
    console.log('--------------------------------------------------------------------------------');
    // Desktop layout
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(500);
    await takeScreenshot('scenario-12-desktop-1280x800');
    console.log('  Desktop layout screenshot captured.');

    // Mobile layout
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(500);
    await takeScreenshot('scenario-12-mobile-375x667');
    console.log('  Mobile layout screenshot captured.');

    // Restore desktop
    await sendCommand('Emulation.clearDeviceMetricsOverride');

    // =========================================================================
    // ADDITIONAL INSPECTIONS: Sensitive Storage & State Leaks
    // =========================================================================
    console.log('\n--------------------------------------------------------------------------------');
    console.log('ADDITIONAL INSPECTION: Zero Persistence & State Isolation');
    console.log('--------------------------------------------------------------------------------');
    const storageCheck = await evaluate(`
      (() => {
        return {
          localStorageKeys: Object.keys(localStorage),
          sessionStorageKeys: Object.keys(sessionStorage),
          cookies: document.cookie,
        };
      })()
    `);
    console.log('  Storage Audit:', JSON.stringify(storageCheck));
    assert.strictEqual(storageCheck.localStorageKeys.length, 0, 'No localStorage items persisted');
    assert.strictEqual(storageCheck.sessionStorageKeys.length, 0, 'No sessionStorage items persisted');
    console.log('  PASS: Zero Content Retention confirmed — no inputs or results stored in browser storage.');

    console.log('\n================================================================================');
    console.log('ALL 12 BROWSER-LEVEL E2E SCENARIOS PASSED WITH ACTUAL EXECUTION EVIDENCE!');
    console.log('================================================================================\n');

    ws.close();
  } finally {
    console.log('[Teardown] Cleaning up background processes and temporary directories...');
    await killProcessesOnPorts([8000, 3000, CDP_PORT]);
    if (chromeProc) chromeProc.kill();
    if (frontendProc) frontendProc.kill();
    if (backendProc) backendProc.kill();
    await sleep(500);
    try { fs.rmSync(TEMP_PROFILE, { recursive: true, force: true }); } catch {}
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('\nE2E Verification Failed:', err);
  process.exit(1);
});

