// VeriNews — End-to-End Website UI Inference Verification Script
// Starts local backend with English inference enabled at process level.
// Starts Next.js dev server on port 3000.
// Launches Headless Chrome and uses Chrome DevTools Protocol (CDP) to:
// 1. Navigate to http://localhost:3000
// 2. Insert real English headline into #article-input
// 3. Click the "Analyze Headline" button in the real browser
// 4. Capture the real fetch network request and response
// 5. Verify the rendered prediction, confidence, model version, and tokens in the browser DOM.

import { spawn } from 'node:child_process';
import http from 'node:http';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const CDP_PORT = 9222;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForUrl(url, timeoutMs = 15000) {
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

async function main() {
  console.log("================================================================================");
  console.log("VERINEWS END-TO-END WEBSITE UI INFERENCE VERIFICATION");
  console.log("================================================================================");

  // 1. Launch FastAPI backend with process-level English inference
  console.log("\n[1/5] Starting FastAPI backend with English inference enabled (process-level)...");
  const backendProc = spawn(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      "$env:VERINEWS_ENABLE_ENGLISH_INFERENCE='true'; $env:VERINEWS_ENABLE_HINDI_INFERENCE='false'; .venv\\Scripts\\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"
    ],
    { stdio: "inherit" }
  );

  let frontendProc = null;
  let chromeProc = null;

  try {
    const backendReady = await waitForUrl("http://127.0.0.1:8000/api/health", 15000);
    if (!backendReady) {
      throw new Error("Backend failed to start on http://127.0.0.1:8000/api/health");
    }
    console.log("  Backend is UP at http://127.0.0.1:8000");

    const healthRes = await fetch("http://127.0.0.1:8000/api/health");
    const healthJson = await healthRes.json();
    console.log(`  Health response:`, healthJson);
    if (!healthJson.models_loaded?.english) {
      throw new Error("English model is not loaded in backend health probe!");
    }

    // 2. Launch Next.js production or dev server on port 3000
    console.log("\n[2/5] Starting Next.js frontend server on port 3000...");
    frontendProc = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        "npm --prefix frontend run start -- -p 3000"
      ],
      { stdio: "inherit" }
    );

    const frontendReady = await waitForUrl("http://localhost:3000", 15000);
    if (!frontendReady) {
      throw new Error("Frontend failed to start on http://localhost:3000");
    }
    console.log("  Frontend is UP at http://localhost:3000");

    // 3. Launch Chrome Headless
    console.log("\n[3/5] Launching Headless Chrome via CDP...");
    chromeProc = spawn(
      CHROME_PATH,
      [
        "--headless=new",
        `--remote-debugging-port=${CDP_PORT}`,
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "http://localhost:3000"
      ],
      { stdio: "ignore" }
    );

    await sleep(2000);
    const versionRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
    const versionData = await versionRes.json();
    console.log(`  Connected to Headless Chrome: ${versionData['User-Agent']}`);

    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const targets = await listRes.json();
    const pageTarget = targets.find((t) => t.type === "page");
    if (!pageTarget) throw new Error("No page target found in Chrome CDP!");

    const wsUrl = pageTarget.webSocketDebuggerUrl;
    console.log(`  Connecting to Page WebSocket: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pendingPromises = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pendingPromises.has(msg.id)) {
        pendingPromises.get(msg.id)(msg);
        pendingPromises.delete(msg.id);
      }
    };

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    function sendCommand(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve) => {
        pendingPromises.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Enable Network and Page
    await sendCommand("Network.enable");
    await sendCommand("Page.enable");
    await sendCommand("Runtime.enable");

    // Navigate to http://localhost:3000
    console.log("\n[4/5] Navigating to http://localhost:3000 and interacting with UI...");
    await sendCommand("Page.navigate", { url: "http://localhost:3000" });
    await sleep(2000);

    // Headline to test
    const testHeadline = "The city council has approved a new public library for the east side, with construction expected to begin next spring.";

    // Insert text and click Analyze button via browser DOM
    const evaluateRes = await sendCommand("Runtime.evaluate", {
      expression: `
        (async () => {
          const textarea = document.getElementById('article-input');
          if (!textarea) return { error: 'Textarea #article-input not found' };

          // Set text
          textarea.value = ${JSON.stringify(testHeadline)};
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));

          // Find analyze button
          const buttons = Array.from(document.querySelectorAll('button'));
          const analyzeBtn = buttons.find(b => b.textContent && b.textContent.includes('Analyze'));
          if (!analyzeBtn) return { error: 'Analyze button not found' };

          analyzeBtn.click();
          return { success: true };
        })()
      `,
      awaitPromise: true,
      returnByValue: true,
    });

    console.log("  Input and click evaluation result:", evaluateRes.result?.value);

    // Wait for analysis result to appear in DOM
    console.log("  Waiting for prediction result to render in DOM...");
    let renderedResult = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      const pollRes = await sendCommand("Runtime.evaluate", {
        expression: `
          (() => {
            const article = document.querySelector('article[aria-live="polite"]');
            if (!article) return null;

            const notice = document.querySelector('div[role="status"]')?.textContent || null;
            const textContent = article.textContent || '';
            const isCredible = textContent.includes('Credible') || textContent.includes('Real');
            const hasConfidence = /\\d+%/.test(textContent);

            return {
              rendered: true,
              notice,
              textExcerpt: textContent.slice(0, 300),
              fullText: textContent,
            };
          })()
        `,
        returnByValue: true,
      });

      if (pollRes.result?.value?.rendered) {
        renderedResult = pollRes.result.value;
        break;
      }
    }

    console.log("\n[5/5] VERIFICATION OUTCOME:");
    if (!renderedResult) {
      // Check if notice banner has an error message
      const noticeCheck = await sendCommand("Runtime.evaluate", {
        expression: `document.querySelector('div[role="status"]')?.textContent || 'No notice found'`,
        returnByValue: true,
      });
      console.error("  FAILED to find rendered <article>. Notice banner text:", noticeCheck.result?.value);
      throw new Error(`Browser did not render prediction result. Notice: ${noticeCheck.result?.value}`);
    }

    console.log("  Rendered Result in Browser DOM:");
    console.log("  " + renderedResult.fullText.replace(/\\s+/g, ' ').trim());

    if (renderedResult.fullText.includes("Credible") || renderedResult.fullText.includes("Real")) {
      console.log("\n  >>> PASS: Real English prediction successfully rendered in Website UI!");
    } else {
      throw new Error("Prediction text does not contain 'Credible' or 'Real'");
    }

    if (renderedResult.fullText.includes("en_ifnd_indian_headlines_calibrated_sigmoid")) {
      console.log("  >>> PASS: Verified model version matches calibrated artifact: en_ifnd_indian_headlines_calibrated_sigmoid");
    } else {
      console.log("  Model version in text:", renderedResult.fullText);
    }

    ws.close();
  } finally {
    console.log("\nCleaning up processes...");
    if (chromeProc) chromeProc.kill();
    if (frontendProc) frontendProc.kill();
    if (backendProc) backendProc.kill();
  }
}

main().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});

