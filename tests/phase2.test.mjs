import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const schema = fs.readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");

const requiredModels = ["User", "Session", "Team", "Player", "Fixture", "MatchEvent", "Competition", "LeagueTable", "NewsArticle", "NewsCategory", "Gallery", "GalleryImage", "Video", "Product", "ProductVariant", "ProductImage", "Cart", "CartItem", "Order", "OrderItem", "Payment", "CustomerAddress", "Sponsor", "SiteSetting", "ContactMessage"];
const requiredRoutes = [
  "app/api/auth/register/route.ts",
  "app/api/auth/login/route.ts",
  "app/api/auth/logout/route.ts",
  "app/api/auth/me/route.ts",
  "app/api/players/route.ts",
  "app/api/matches/route.ts",
  "app/api/news/route.ts",
  "app/api/products/route.ts",
  "app/api/contact/route.ts",
  "app/api/admin/overview/route.ts",
];

test("Phase 2 schema contains all required domain models", () => {
  for (const model of requiredModels) assert.match(schema, new RegExp(`model\\s+${model}\\s*\\{`));
  assert.match(schema, /enum UserRole/);
  assert.match(schema, /enum OrderStatus/);
  assert.match(schema, /enum PaymentStatus/);
});

test("Phase 2 migration and seed exist", () => {
  assert.ok(fs.existsSync(path.join(root, "prisma/migrations/20260902210000_phase2_init/migration.sql")));
  assert.ok(fs.existsSync(path.join(root, "prisma/seed.ts")));
});

test("Phase 2 API surface exists", () => {
  for (const route of requiredRoutes) assert.ok(fs.existsSync(path.join(root, route)), route);
});

test("Demo data is explicitly marked", () => {
  const seed = fs.readFileSync(path.join(root, "prisma/seed.ts"), "utf8");
  assert.match(seed, /isDemoData: true/);
  assert.match(seed, /Competition TBD/);
  assert.match(seed, /demo@solmartfc\.local/);
});
