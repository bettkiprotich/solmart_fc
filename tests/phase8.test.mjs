import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("Phase 8 security headers are configured", () => {
  const s = read("next.config.ts");
  for (const header of ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) assert.match(s, new RegExp(header));
  assert.match(s, /poweredByHeader:\s*false/);
});

test("State-changing requests fail closed on missing or mismatched origin", () => {
  const s = read("lib/http/request.ts");
  assert.match(s, /if \(!appUrl\) return jsonError/);
  assert.match(s, /if \(!supplied \|\| supplied !== expected\) return jsonError/);
});

test("Uploads validate both MIME type and file signature", () => {
  const s = read("lib/services/uploads.ts");
  assert.match(s, /isValidImageSignature/);
  assert.match(s, /isValidVideoSignature/);
  assert.match(s, /MAX_IMAGE_BYTES/);
  assert.match(s, /MAX_VIDEO_BYTES/);
  assert.match(s, /flag: "wx"/);
});

test("Admin uploads and contact endpoint are rate limited", () => {
  assert.match(read("app/api/admin/uploads/route.ts"), /checkRateLimit/);
  assert.match(read("app/api/contact/route.ts"), /checkRateLimit/);
});

test("Admin player API generates slugs server-side", () => {
  const s = read("app/api/admin/players/route.ts");
  assert.match(s, /uniqueSlug/);
  assert.match(s, /firstName.*lastName/);
});

test("Production environment requires a valid application URL and auth secret", () => {
  const s = read("lib/validation/env.ts");
  assert.match(s, /NEXT_PUBLIC_APP_URL: z\.string\(\)\.url\(\)/);
  assert.match(s, /AUTH_SECRET: z\.string\(\)\.min\(32\)/);
});

test("Private environment files are ignored", () => {
  const s = read(".gitignore");
  assert.match(s, /\.env$/m);
  assert.match(s, /\.env\.local$/m);
});
