import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);

test("phase 1 foundation remains present", () => {
  for (const file of ["app/layout.tsx", "app/globals.css", "components/layout/header.tsx", "lib/db/prisma.ts", "lib/auth/config.ts", "prisma/schema.prisma"]) {
    assert.ok(fs.existsSync(path.join(root, file)), file);
  }
  assert.ok(fs.existsSync(path.join(root, "public/images/solmart-fc-logo.png")));
});
