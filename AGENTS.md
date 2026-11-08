# VeriNews OpenCode Project Instructions

Before any development work, read `project-tracker/README.md`, `project-tracker/progress.json`, `project-tracker/roadmap.json`, recent entries in `project-tracker/activity-log.json`, and relevant files under `project-tracker/execution-history/`. Follow the required execution workflow in the tracker README for every OpenCode development prompt.

In particular:

- Identify existing task IDs before implementation and record In Progress at start.
- Record actual changed files, exact commands/results, errors, blockers, evidence, timestamps, next recommendation and execution history. Never fabricate a completion date, test result or Git reference.
- Mark Completed only after implementation, required checks and evidence are successful. Otherwise keep the truthful In Progress, Blocked, or Failed state.
- Preserve append-only activity and execution history. Use `scripts/update_project_tracker.mjs`; validate with `node scripts/validate_project_tracker.mjs`.
- Never approve a dataset, begin training/preprocessing, start P05 or another phase, or switch to Maintenance/release mode without explicit mentor/owner approval.
- Do not push, change Git remotes, add credentials, or store secrets in tracker files.
- Stop after the requested task and wait for mentor review.
