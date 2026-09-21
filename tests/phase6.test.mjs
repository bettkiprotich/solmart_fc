import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "app/admin/page.tsx",
  "app/admin/login/page.tsx",
  "components/admin/admin-dashboard.tsx",
  "components/admin/admin-login.tsx",
  "app/api/admin/orders/route.ts",
  "app/api/admin/products/route.ts",
  "app/api/admin/players/route.ts",
  "app/api/admin/matches/route.ts",
  "app/api/admin/news/route.ts",
  "app/api/admin/media/route.ts",
  "app/api/admin/sponsors/route.ts",
  "app/api/admin/settings/route.ts",
  "app/api/admin/users/route.ts",
];

test("Phase 6 admin surfaces exist", () => {
  required.forEach(file => assert.ok(fs.existsSync(path.join(root,file)), file));
});
test("Admin APIs enforce authorization", () => {
  for (const file of required.filter(f => f.includes("api/admin"))) {
    const s = fs.readFileSync(path.join(root,file),"utf8");
    assert.match(s,/requireRole\("ADMIN"\)/,file);
    assert.match(s,/assertSameOrigin/,file);
  }
});
test("Sensitive user role changes require SUPER_ADMIN", () => {
  const s=fs.readFileSync(path.join(root,"app/api/admin/users/route.ts"),"utf8");
  assert.match(s,/requireRole\("SUPER_ADMIN"\)/);
});
test("Order status management includes payment and fulfilment states",()=>{
 const s=fs.readFileSync(path.join(root,"app/api/admin/orders/route.ts"),"utf8");
 for(const status of ["PENDING_PAYMENT","PAID","PROCESSING","READY_FOR_DISPATCH","SHIPPED","DELIVERED","CANCELLED","REFUNDED"]) assert.match(s,new RegExp(status));
});
test("Admin dashboard has all core management sections",()=>{
 const s=fs.readFileSync(path.join(root,"components/admin/admin-dashboard.tsx"),"utf8");
 for(const label of ["Orders","Products","Players","Matches","News","Media","Sponsors","Settings","Messages","Users"]) assert.match(s,new RegExp(label));
});

test("Phase 6 media and upload management exists", () => {
  assert.ok(fs.existsSync(path.join(root, "app/api/admin/uploads/route.ts")));
  assert.ok(fs.existsSync(path.join(root, "app/api/admin/product-images/route.ts")));
  assert.ok(fs.existsSync(path.join(root, "app/api/admin/gallery-images/route.ts")));
  const dash = fs.readFileSync(path.join(root, "components/admin/admin-dashboard.tsx"), "utf8");
  assert.match(dash, /Player photograph/);
  assert.match(dash, /Product photo/);
  assert.match(dash, /Create fixture/);
  assert.match(dash, /Upload photo/);
  assert.match(dash, /gallery-images/);
});
