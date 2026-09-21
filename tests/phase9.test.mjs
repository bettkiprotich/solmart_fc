import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const exists = (p) => fs.existsSync(p);

test("phase 9 health endpoint exists", () => assert.equal(exists("app/api/health/route.ts"), true));
test("phase 9 legal pages exist", () => {
  assert.equal(exists("app/privacy/page.tsx"), true);
  assert.equal(exists("app/terms/page.tsx"), true);
  assert.equal(exists("app/refund/page.tsx"), true);
});
test("production verification script exists", () => assert.equal(exists("scripts/verify-production.mjs"), true));
test("production verification is an npm script", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(pkg.scripts["verify:production"], "node scripts/verify-production.mjs");
});
test("phase 9 production checklist exists", () => assert.equal(exists("PHASE9_PRODUCTION.md"), true));
test("Paystack production verification is present", () => {
  const s = fs.readFileSync("scripts/verify-production.mjs", "utf8");
  assert.match(s, /PAYSTACK_SECRET_KEY/);
  assert.match(s, /PAYSTACK_WEBHOOK_URL/);
});
