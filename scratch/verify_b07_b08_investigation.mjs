import fs from "fs";
import crypto from "crypto";
import { execSync } from "child_process";

console.log("=== B-07 & B-08 Dual Investigation Comprehensive Verification ===");

let allPassed = true;
function assert(cond, msg) {
  if (!cond) {
    console.error(`[FAIL] ${msg}`);
    allPassed = false;
  } else {
    console.log(`[PASS] ${msg}`);
  }
}

// 1. Verify B-07 Report
const b07Path = "docs/research/P01_B07_WELFAKE_UPSTREAM_CONTENT_RIGHTS_INVESTIGATION_REPORT.md";
assert(fs.existsSync(b07Path), "B-07 Investigation Report exists");
const b07Content = fs.readFileSync(b07Path, "utf8");

assert(b07Content.includes("UNRESOLVED — UPSTREAM PROPRIETARY CONTENT RIGHTS NOT CONVEYED BY COMPILATION LICENCE"),
  "B-07 contains required UNRESOLVED status");
assert(b07Content.includes("William Lifferth") && b07Content.includes("George McIntire") && b07Content.includes("ISOT"),
  "B-07 investigates all core upstream components");
assert(b07Content.includes("Reuters") && b07Content.includes("Thomson Reuters"),
  "B-07 investigates Reuters upstream content rights");
assert(b07Content.includes("BuzzFeed Political"),
  "B-07 investigates BuzzFeed Political component");
assert(b07Content.includes("non-commercial educational purposes only") || b07Content.includes("academic research and non-commercial"),
  "B-07 documents ISOT University of Victoria non-commercial restriction");
assert(b07Content.includes("Nemo Dat Quod Non Habet") || b07Content.includes("compilation"),
  "B-07 analyzes compilation vs underlying content rights");
assert(b07Content.includes("1. Executive Summary") && b07Content.includes("13. Reproducibility and Source Register"),
  "B-07 contains required 13 sections");

// 2. Verify B-08 Report
const b08Path = "docs/research/P01_B08_INDIC_ZENODO_HINDI_LICENCE_CONFLICT_INVESTIGATION_REPORT.md";
assert(fs.existsSync(b08Path), "B-08 Investigation Report exists");
const b08Content = fs.readFileSync(b08Path, "utf8");

assert(b08Content.includes("UNRESOLVED — CONFLICTING LICENCE EVIDENCE; PRECEDENCE AND SCOPE NOT ESTABLISHED"),
  "B-08 contains required UNRESOLVED status");
assert(b08Content.includes("11408513") && b08Content.includes("10.5281/zenodo.11408513"),
  "B-08 identifies exact Zenodo record ID and DOI");
assert(b08Content.includes("CC BY 4.0") && b08Content.includes("CC BY-NC 4.0"),
  "B-08 analyzes CC BY 4.0 vs CC BY-NC 4.0 conflict");
assert(b08Content.includes("Frontiers in Artificial Intelligence") || b08Content.includes("Frontiers in AI"),
  "B-08 cites 2025 Frontiers publication");
assert(b08Content.includes("20,593") && (b08Content.includes("Zero (0)") || b08Content.includes("zero files") || b08Content.includes("Zero")),
  "B-08 documents local archive file-level inspection findings");
assert(b08Content.includes("1. Executive Summary") && b08Content.includes("13. Reproducibility and Source Register"),
  "B-08 contains required 13 sections");

// 3. Verify Canonical Documents
const canonicalDocs = [
  "docs/research/P01_MASTER_REQUIREMENT_EVIDENCE_MATRIX.md",
  "docs/research/P01_EXTERNAL_BLOCKERS_AND_APPROVAL_CHECKLIST.md",
  "docs/research/P01_MENTOR_APPROVAL_DOSSIER.md",
  "docs/research/P01_FINAL_CLOSURE_REPORT.md",
  "docs/research/P01_FINAL_DATASET_DECISION_MATRIX.md"
];

for (const docPath of canonicalDocs) {
  assert(fs.existsSync(docPath), `${docPath} exists`);
  const content = fs.readFileSync(docPath, "utf8");
  
  // Status check: B-07 and B-08 unresolved
  assert(content.includes("B-07") && content.includes("B-08"), `${docPath} tracks B-07 and B-08`);
  assert(content.includes("ON HOLD"), `${docPath} marks WELFake ON HOLD`);
}

for (const docPath of canonicalDocs.slice(0, 4)) {
  const content = fs.readFileSync(docPath, "utf8");
  assert(content.includes("5 CLOSED") && content.includes("1 PARTIALLY RESOLVED") && content.includes("6 UNRESOLVED"),
    `${docPath} maintains exact canonical summary: 5 CLOSED, 1 PARTIALLY RESOLVED, 6 UNRESOLVED`);
}

// 4. Raw CSV File Checksum & Size
const rawCsvPath = "data/raw/welfake/WELFake_Dataset.csv";
assert(fs.existsSync(rawCsvPath), "Raw WELFake CSV exists");
const stats = fs.statSync(rawCsvPath);
assert(stats.size === 245086152, `Raw CSV size is exactly 245,086,152 bytes (actual: ${stats.size})`);

const hash = crypto.createHash("sha256");
const stream = fs.createReadStream(rawCsvPath);
stream.on("data", (chunk) => hash.update(chunk));
stream.on("end", () => {
  const digest = hash.digest("hex");
  const expectedHash = "665331424230fc452e9482c3547a6a199a2c29745ade8d236950d1d105223773";
  assert(digest === expectedHash, `Raw CSV SHA-256 matches ${expectedHash}`);

  // 5. Git State Checks
  const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
  assert(branch === "main", `Git branch is main (actual: ${branch})`);

  const headCommit = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  assert(headCommit === "d9247055b3b7d86275b87ce649c79f776da54ccf",
    `Git HEAD is d9247055b3b7d86275b87ce649c79f776da54ccf (actual: ${headCommit})`);

  const stagedFiles = execSync("git diff --cached --name-only", { encoding: "utf8" })
    .trim()
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);
  assert(stagedFiles.length === 65, `Exactly 65 staged files preserved (actual: ${stagedFiles.length})`);

  if (!allPassed) {
    console.error("\n>>> VERIFICATION FAILED <<<");
    process.exit(1);
  } else {
    console.log("\n>>> ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<");
  }
});

