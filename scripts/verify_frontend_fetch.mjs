// VeriNews — Frontend Fetch Simulation Verification Script
// Simulates the exact client-side request logic from frontend/src/App.tsx

import http from 'node:http';

async function testFetchAgainstBackend() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = `${apiBase}/api/predict`;

  console.log(`[Frontend Simulation] API Target: ${url}`);

  const payload = JSON.stringify({
    text: "The city council has approved a new public library for the east side, with construction expected to begin next spring.",
    language_hint: "en",
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
      body: payload,
    });

    console.log(`[Frontend Simulation] Response status: ${response.status} ${response.statusText}`);
    console.log(`[Frontend Simulation] CORS Origin: ${response.headers.get('access-control-allow-origin')}`);

    if (response.ok) {
      console.log('[Frontend Simulation] Unexpected: response was 200 OK while inference is supposed to be disabled.');
      process.exit(1);
    } else {
      const errData = await response.json().catch(() => null);
      const errMsg = errData?.detail || `The analysis service returned status ${response.status}. No prediction was generated.`;
      console.log(`[Frontend Simulation] Extracted Error Detail: "${errMsg}"`);

      // Verify exact expected message
      if (response.status === 503 && errMsg.includes('English model service is not available')) {
        console.log('[Frontend Simulation] PASS: Handled HTTP 503 correctly. Notice rendered to user matches backend detail.');
      } else {
        console.log('[Frontend Simulation] FAIL: Did not match expected 503 message.');
        process.exit(1);
      }
    }
  } catch (err) {
    console.log(`[Frontend Simulation] Fetch failed with error: ${err.message}`);
    // If connection was refused:
    console.log('[Frontend Simulation] Fallback UI Notice: "The machine learning analysis service is not connected yet. No prediction was generated."');
  }
}

testFetchAgainstBackend();

