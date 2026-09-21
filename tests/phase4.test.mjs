import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('.');
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
test('Phase 4 e-commerce routes exist', () => {
  for (const p of ['app/api/cart/route.ts','app/api/checkout/route.ts','app/api/orders/route.ts','app/cart/page.tsx','app/checkout/page.tsx','app/shop/[slug]/page.tsx','app/account/orders/page.tsx']) assert.ok(fs.existsSync(path.join(root,p)), p);
});
test('Checkout is server authoritative and payment is deferred to Phase 5', () => {
  const s=read('app/api/checkout/route.ts');
  assert.match(s,/findUnique\(\{ where: \{ id: item\.variantId \}/);
  assert.match(s,/stock: \{ gte: item\.quantity \}/);
  assert.match(s,/status: "PENDING_PAYMENT"/);
  assert.doesNotMatch(s,/PaymentProvider/);
});
test('Cart requires authenticated customer session', () => {
  const s=read('app/api/cart/route.ts'); assert.match(s,/getSessionUser\(\)/); assert.match(s,/Please sign in/);
});
test('Product cards link to product detail pages', () => assert.match(read('components/site/product-card.tsx'),/\/shop\/\$\{product\.slug\}/));
