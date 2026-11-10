# VeriNews — Frontend API Integration Plan (Phase P13 Specification)

**Status:** Documented / Planned Implementation for Phase P13  
**Components Involved:** `frontend/src/components/Analyzer.tsx`, `frontend/src/components/AnalysisResult.tsx`, `backend/app/main.py`

---

## 1. Architectural Strategy

In Phase P13, the Next.js frontend will bridge from the preview mock handler to the live FastAPI backend via standard REST calls over `fetch()`.

To preserve local developer ergonomics and production deployment flexibility:
1. **Environment Configuration**:
   The frontend will read `NEXT_PUBLIC_API_URL` (defaulting to `http://localhost:8000/api` in local development).
2. **Graceful Degraded State**:
   If the FastAPI backend is offline or returns an error, the frontend will catch the network exception and render a clear, non-crashing banner:
   *"Unable to connect to the VeriNews analysis service. Please check your backend connection."*
3. **No Fabricated Outputs**:
   If the backend returns HTTP 503 (`ModelUnavailableException`), the UI renders the exact server error detail rather than falling back to simulated percentages.

---

## 2. API Contract Mapping

| Frontend UI Action | HTTP Request | Backend Route | UI State Transition |
|---|---|---|---|
| Page Load / Initial Mount | `GET` | `/api/health` | Check `models_loaded.english` and `models_loaded.hindi`. Display language badge status. |
| Click "Load Sample" | `GET` | `/api/samples` | Populates textarea with verified sample text excerpts. |
| Click "Analyze Article →" | `POST` | `/api/predict` | Transitions button to `Analyzing...` with loading spinner; on success renders `AnalysisResult.tsx`; on 503 or error renders honest notification banner. |

---

## 3. Client Implementation Blueprint (`api-client.ts`)

```typescript
// Proposed frontend client utility for Phase P13
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface AnalysisPayload {
  text: string;
  language_hint?: 'auto' | 'en' | 'hi';
}

export async function requestPrediction(payload: AnalysisPayload): Promise<AnalysisResultData> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Analysis request failed (HTTP ${response.status})`);
  }

  return response.json();
}
```

---

## 4. Error Handling & User Experience Rules

1. **Client-Side Pre-Validation**:
   The textarea continues enforcing the 100 to 5,000 character limits before any network request is sent, preventing unnecessary round trips.
2. **Script Mismatch Handling (HTTP 422)**:
   If the user submits unsupported characters (e.g. Cyrillic or non-Latin/non-Devanagari text), the 422 error detail is displayed inline:
   *"Unsupported script detected. VeriNews currently supports English and Hindi (Devanagari) only."*
3. **Privacy Assurance**:
   Client requests are transmitted directly over HTTPS in production. No client cookies, tracking identifiers, or auth headers are attached to analysis requests.

