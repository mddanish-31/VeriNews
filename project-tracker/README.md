# VeriNews Project Control Center

The Next.js dashboard is available at **`/project-tracker`**. Its UI is read-only; canonical records are tracked in this directory and updated locally through the OpenCode workflow below. No database, credentials, authentication, public write endpoint, Git push, or remote-setting change is used.

## Canonical records

- `roadmap.json` — ordered canonical P00–P15 titles and phase states.
- `progress.json` — project/lifecycle state, one detailed task per phase, latest verification results and Git fallback snapshot.
- `activity-log.json` — append-only recorded activity.
- `execution-history/*.json` — append-only OpenCode execution reports (a started record is completed in place; a new session gets a new record).
- `archives/` — immutable copies of development records made only when an explicitly approved release activates Maintenance mode.

`node scripts/validate_project_tracker.mjs` validates schema essentials, canonical order, status consistency and duplicate IDs. `node scripts/test_project_tracker.mjs` exercises task counts/filter inputs, isolated start/finish updates, malformed/missing records, and the release archive gate using disposable temporary copies. The dashboard also validates records server-side and renders a safe unavailable state on missing/malformed files. Its loader reads only these JSON records and the `execution-history` folder.

## Seeded state and provenance

The initial P00–P15 states were entered from the owner's explicit tracker brief on **2026-11-08**. Older documents, including `docs/phase-1-summary.md`, contain phase statements that conflict with this supplied baseline. The tracker does not silently rewrite those documents. P01 remains open and dataset approval remains unresolved; no dataset is approved for training or preprocessing. P02 is design-locked. P03–P04 are implemented, with final browser QA pending. P05–P15 are not started.

The prior frontend QA report recorded `npm run typecheck`, `npm run lint`, and `npm run build` as passing. Their exact execution timestamp was not present in the repository, so `executedAt` is null and the report is explicitly marked imported. Real-browser tests remain pending; none are claimed. Historical completion timestamps and commit references were not supplied and remain null.

## OpenCode execution workflow (required)

For **every future development prompt**:

1. Read this file, `progress.json`, `roadmap.json`, recent `activity-log.json` entries, and applicable `execution-history` records before changing code.
2. Identify the existing task ID(s). Do not invent a new phase, alter the canonical roadmap, or map unrelated work onto a phase just to make tracking fit. Ask for mentor direction if there is no suitable task.
3. When work starts, create an execution record and mark the task In Progress:

   ```powershell
   node scripts/update_project_tracker.mjs start --task P03 --note "Started the authorized P03 task"
   ```

   Save the printed `EXEC-...` ID for the finish command. Start creates a history record, updates task/phase timestamps and appends activity.

4. Record only actual changed paths, commands and observed output. Do not infer files from intent. Use one `--file` per changed file and one `--check` per actual command/result. Example:

   ```powershell
   node scripts/update_project_tracker.mjs finish `
     --task P03 --execution EXEC-ID --status "Completed" `
     --note "Responsive frontend QA completed; report prepared for mentor review" `
     --next-task P01 `
     --recommendation "Resolve the outstanding P01 evidence and dataset-approval gate; wait for mentor direction." `
     --file frontend/src/app/globals.css `
     --check "npm run typecheck | PASS | tsc --noEmit exited 0" `
     --check "npm run lint | PASS | eslint . exited 0" `
     --evidence "project-tracker/execution-history/<actual-report>.json"
   ```

   The example task, results, paths, and next task are illustrative only; replace them with the actual task and observed outcomes. `Completed` is rejected unless at least one check passed, every supplied check passed, and evidence is included. `Blocked`, `Failed`, or `In Progress` must be used when appropriate; a Blocked record requires `--blocker`.

5. If a verified Git commit exists, optionally pass `--commit <ref>`; the updater checks that Git can resolve it. Never invent one. This workspace currently has no Git repository, remote, or GitHub Actions workflow, so leave commit refs empty and report GitHub status as unavailable. Never push or alter remotes without explicit authorization.
6. Finish updates the task and roadmap status, timestamps, evidence, files, execution report, recent activity, verification results, and the next task/recommendation. Execution history and activity are preserved. Records are written through same-directory temporary files plus rename, serialized by an exclusive lock. If interrupted, run the validator and inspect files before retrying; do not delete logs or stale locks blindly.
7. Include the tracker record in the final report and stop for mentor review. Do not automatically start another phase.

The updater does not accept secrets as fields and does not expose status mutation through the dashboard. Do not place tokens, environment-variable values, private URLs, or credentials in any tracker record.

## GitHub status and setup limits

At initialization, both the project root and its parent failed `git rev-parse`; no `.git`, remote, `.github/workflows`, or GitHub credentials were present. Therefore the displayed state is **Unavailable**, with no fabricated commit or workflow check. Local tracking and QA records remain usable without GitHub.

To enable future *read-only* synchronization, the owner must first authorize/establish the intended Git repository and remote, and add an appropriate GitHub Actions workflow. Workflow run/check links can then be recorded from actual authorized GitHub evidence. Do not add tokens to tracker JSON, change remote configuration, push, or grant permissions as part of this tracker implementation.

## Development and Maintenance lifecycle

- Initial mode is **Development**. Completing tasks never declares a release.
- Maintenance mode may be entered only after explicit release approval is supplied by the owner/mentor and recorded with the approver, actual approval timestamp, evidence reference, and version.
- A local transition helper requires *all P00–P15 tasks complete* **and** explicit approval values; completion alone never switches the mode:

  ```powershell
  node scripts/activate_maintenance_mode.mjs --version v1.0.0 --approved-by "actual approver" --approval-at "actual ISO approval timestamp" --approval-evidence "actual approval record reference" --release-notes "approved release notes"
  ```

  Run only after actual mentor/owner approval. The helper copies (does not move or delete) `progress.json`, `roadmap.json`, `activity-log.json`, and execution history into a uniquely named `archives/development-pre-<version>-<timestamp>/` directory before the transition. Do not supply invented approval details. This local CLI is not authentication; it must not be exposed as a public control.
- Record later releases in `lifecycle.releases` with `version`, `status`, `releasedAt`, `releaseNotes`, `approvalRef`, and nullable `commitRef`; deployments in `lifecycle.deployments` with `environment`, `status`, nullable `deployedAt`, `releaseVersion`, nullable `runUrl` and `commitRef`; and maintenance work in `lifecycle.maintenanceItems` with unique `id`, `kind` (`Bug`, `Enhancement`, `Feature Request`), `title`, `description`, task status, priority, timestamps, related version and nullable execution report reference. Validate after any local record update; preserve archive and activity history. The dashboard is read-only.
- No approval has been supplied. Current version is null; releases and deployments are empty; Maintenance is not activated.
- No approval has been supplied. Current version is null; releases and deployments are empty; Maintenance is not activated.

## Current recommendation

Perform real-browser viewport and interaction QA for the existing P03–P04 frontend when a browser runner is available, record actual results, and stop for mentor review. Do not begin P05 or any later product phase from this recommendation alone.
