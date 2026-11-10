---
trigger: always_on
description: Automatically maintain and consult the VeriNews Graphify developer knowledge graph under Ponytail Workflow and project governance boundaries.
---

## Graphify Developer Knowledge Graph Rules

Graphify provides a developer-analysis knowledge graph for VeriNews. It is a local developer tool, not a runtime dependency. Existing VeriNews `AGENTS.md` and the Ponytail Workflow remain authoritative; Graphify never overrides project approval gates, phase boundaries, or safety rules.

### 1. Before Every Development Task
- If `graphify-out/graph.json` exists, consult the graph when it is useful for understanding affected architecture (via `graphify query`, `graphify path`, or `graphify explain`).
- Prefer targeted file searches (`read_file`, `grep`) when graph queries provide no additional value (following the Ponytail ladder).
- Never assume graph information is more authoritative than actual source code.

### 2. After Every Completed Development Task
- Identify the files actually changed during the task.
- Run `graphify update .` after code or architecture changes.
- Verify that the update completed successfully.
- Report whether the graph was updated, skipped, or failed in the task summary.
- Do not report success unless the command actually succeeds.
- Avoid unnecessary repeated updates within the same task.

### 3. First-Time Graph Generation & Exclusions
- If `graphify-out/graph.json` does not exist, perform initial graph generation using the documented Graphify workflow.
- Strictly respect exclusions to prevent scanning sensitive, non-code, or massive assets:
  - Datasets: `data/`, `data/raw/`, `data/processed/`, `data/interim/`
  - Model weights: `models/`
  - Secrets & environment: `.env`, `.env.*` (except `.env.example`)
  - Virtual environments & dependencies: `.venv/`, `venv/`, `node_modules/`
  - Build outputs & caches: `.next/`, `out/`, `__pycache__/`, `.pytest_cache/`, `*.tsbuildinfo`
  - Internal project tracker logs: `project-tracker/execution-history/`, `project-tracker/activity-log.json`
- Do not silently begin expensive semantic extraction if external API usage or additional configuration is required. Report the requirement first.

### 4. Strict Boundaries & Governance
- Graphify may update only its own generated knowledge graph outputs in `graphify-out/`.
- Never modify application source code, tests, or models through Graphify.
- Never automatically modify `AGENTS.md`, Ponytail instructions, project documentation, phase trackers, or blocker statuses.
- Never stage, commit, reset, or switch Git branches.
- Never approve datasets or advance project phases.
- Preserve all existing staged and unstaged Git changes.
- Do not allow Graphify failures or uninstalled tool prerequisites to block otherwise valid development work.
