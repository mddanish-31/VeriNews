import fs from "fs";
import crypto from "crypto";
import { execSync } from "child_process";

console.log("=== B-06 Evidence Correction Comprehensive Verification ===");

let allPassed = true;
function assert(cond, msg) {
  if (!cond) {
    console.error(`[FAIL] ${msg}`);
    allPassed = false;
  } else {
    console.log(`[PASS] ${msg}`);
  }
}

// 1. Verify Investigation Report
const b06ReportPath = "docs/research/P01_B06_BUZZFEED_POLITICAL_SOURCE_IDENTITY_INVESTIGATION_REPORT.md";
assert(fs.existsSync(b06ReportPath), "B-06 Investigation Report exists");
const b06Report = fs.readFileSync(b06ReportPath, "utf8");

assert(b06Report.includes("PARTIALLY RESOLVED — CANDIDATE SOURCE IDENTIFIED; FULL RECORD-LEVEL PROVENANCE NOT VERIFIED"),
  "B-06 report contains required PARTIALLY RESOLVED status");
assert(!b06Report.includes("CLOSED — VERIFIED SOURCE IDENTITY (WITH DOCUMENTED RECORD-LEVEL AUDIT LIMITATIONS)"),
  "B-06 report does NOT contain previous CLOSED status");
assert(b06Report.includes("101") && b06Report.includes("91") && b06Report.includes("10"),
  "B-06 report discusses 101 vs 91 records and the 10-record difference");
assert(b06Report.includes("72,134") && b06Report.includes("72,033"),
  "B-06 report contains remainder calculation numbers");
assert(b06Report.includes("arithmetic only") || b06Report.includes("arithmetic calculation only"),
  "B-06 report qualifies remainder subtraction as arithmetic only");
assert(b06Report.includes("duplicate ingestion") || b06Report.includes("cross-source duplicates"),
  "B-06 report notes duplicate ingestion risk from B-04");
assert(b06Report.includes("Exact full-record matches | 0") || b06Report.includes("Exact full-record matches | **0**") || b06Report.includes("| 0 |") || b06Report.includes("0 exact"),
  "B-06 report documents 0 exact matches");
assert(b06Report.includes("101 untested") || b06Report.includes("Records not tested | 101") || b06Report.includes("Records not tested | **101**"),
  "B-06 report documents 101 records untested at row level");
assert(b06Report.includes("Horne & Adali") && b06Report.includes("Craig Silverman"),
  "B-06 report documents candidate provenance sources");

// 2. Verify 5 Canonical Documents
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
  
  // Ensure no stale 6 CLOSED count
  assert(!content.includes("6 CLOSED"), `${docPath} does not have stale 6 CLOSED count`);
  
  // Ensure B-06 is not marked CLOSED as source identity verified
  assert(!content.includes("| B-06 | WELFake BuzzFeed Political source identity (H-05) | WELFake | CLOSED"),
    `${docPath} does not mark B-06 as CLOSED in canonical table`);
    
  // Check P01 open and WELFake ON HOLD
  assert(content.includes("ON HOLD"), `${docPath} marks WELFake ON HOLD`);
}

// Check specific summary in first 4 docs
for (const docPath of canonicalDocs.slice(0, 4)) {
  const content = fs.readFileSync(docPath, "utf8");
  assert(content.includes("5 CLOSED") && content.includes("1 PARTIALLY RESOLVED") && content.includes("6 UNRESOLVED"),
    `${docPath} contains exact blocker summary: 5 CLOSED, 1 PARTIALLY RESOLVED, 6 UNRESOLVED`);
}

// 3. Raw CSV File Checksum & Size
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
  assert(digest === expectedHash, `Raw CSV SHA-256 matches ${expectedHash} (actual: ${digest})`);

  // 4. Git State Checks
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

