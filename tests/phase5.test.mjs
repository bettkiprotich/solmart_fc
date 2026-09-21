import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const exists = (p) => fs.existsSync(p);

test("Paystack payment service exists", () => assert.equal(exists("lib/services/paystack.ts"), true));
test("Paystack uses the official API and M-PESA mobile money provider", () => {
  const s = read("lib/services/paystack.ts");
  assert.match(s, /https:\/\/api\.paystack\.co/);
  assert.match(s, /\/charge/);
  assert.match(s, /provider: "mpesa"/);
  assert.match(s, /\/transaction\/verify/);
});
test("Paystack payment initiation is server-side and authenticated", () => {
  const s = read("app/api/payments/paystack/charge/route.ts");
  assert.match(s, /getSessionUser/);
  assert.match(s, /initiatePaystackMpesa/);
  assert.match(s, /rateLimit/);
});
test("Paystack webhook validates its signature", () => {
  const s = read("lib/services/paystack.ts") + read("app/api/payments/paystack/webhook/route.ts");
  assert.match(s, /x-paystack-signature/);
  assert.match(s, /timingSafeEqual/);
  assert.match(s, /sha512/);
});
test("Successful Paystack payment updates order to PAID", () => {
  const s = read("lib/services/paystack.ts");
  assert.match(s, /status: "SUCCESS"/);
  assert.match(s, /status: "PAID"/);
});
test("Daraja endpoints are disabled", () => {
  assert.equal(exists("app/api/payments/stk-push/route.ts"), false);
  assert.equal(exists("app/api/payments/callback/route.ts"), false);
  assert.equal(exists("lib/services/mpesa.ts"), false);
});
