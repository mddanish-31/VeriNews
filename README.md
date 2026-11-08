# VeriNews

VeriNews is an educational and portfolio-grade multilingual news credibility analysis platform designed for solo development and execution on consumer CPU hardware. It explores news-style patterns in English and Hindi with context, not certainty.

## 1. Project Overview

The frontend is built with Next.js 16 App Router, React, TypeScript, and Tailwind CSS, following the existing VeriNews visual design with Light and Dark mode support. A repository-backed project control center is available at `/project-tracker`.

## 2. Development Approach

AI tools were used as development assistance for planning, implementation support, debugging, and documentation. All project decisions, code review, testing, verification, and final responsibility remain with the developer. AI assistance did not replace human judgment, and not all code was independently written.

## 3. Features

- Next.js 16 App Router frontend with React, TypeScript, and Tailwind CSS
- Light/Dark theme toggle with CSS variable theming
- Responsive layout (desktop and mobile)
- Project Control Center dashboard at `/project-tracker` showing roadmap status, task counts, filters, and task details from available tracker information
- Detailed activity logs and execution history are local-only and excluded from the public repository
- Read-only tracker dashboard with phase/status/priority filters
- Repository-backed P00–P15 roadmap and task records in `project-tracker/`

## 4. Current Development Status

**Implemented (frontend only):**
- Next.js frontend foundation (P00–P04)
- Project Control Center dashboard with roadmap and task tracking
- Light/Dark theme system

**Not implemented or not integrated:**
- Backend API (no FastAPI backend connected)
- Database (no database or persistence layer)
- ML/model inference (no model trained or integrated; no dataset approved)
- GitHub synchronization (no remote configured)

## 5. Repository Contents

- `frontend/` — Next.js frontend application
- `docs/` — Project scope, research, architecture, and requirements documentation
- `project-tracker/` — Public project control center, roadmap, and progress information. Internal activity logs and detailed execution history are intentionally local-only and excluded from Git.
- `scripts/` — Tracker validation, update, and lifecycle helper scripts
- `AGENTS.md` — OpenCode project instructions

## 6. Local Setup

From the repository root:

```powershell
cd frontend
npm install
```

Available scripts (run from `frontend/`):

| Script | Command | Purpose |
|--------|---------|---------|
| dev | `npm run dev` | Start the Next.js development server |
| build | `npm run build` | Production build |
| start | `npm run start` | Start the production server |
| lint | `npm run lint` | Run ESLint |
| typecheck | `npm run typecheck` | Run TypeScript type checking |

## 7. Verification

Run from the `frontend/` directory:

```powershell
npm run typecheck
npm run lint
npm run build
```

Run tracker validation from the repository root:

```powershell
node scripts/validate_project_tracker.mjs
```
