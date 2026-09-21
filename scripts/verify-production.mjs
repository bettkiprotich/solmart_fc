const required = ["NEXT_PUBLIC_APP_URL", "DATABASE_URL", "AUTH_SECRET"];
const missing = required.filter((key) => !process.env[key] || process.env[key].startsWith("replace-with-") || process.env[key].includes("postgres:postgres@localhost"));
if (process.env.NODE_ENV !== "production") {
  console.log("Production verification skipped: NODE_ENV is not production.");
  process.exit(0);
}
if (missing.length) {
  console.error(`Missing or unsafe production environment values: ${missing.join(", ")}`);
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_APP_URL.startsWith("https://")) {
  console.error("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
  process.exit(1);
}
if (!process.env.PAYSTACK_SECRET_KEY || !process.env.PAYSTACK_WEBHOOK_URL || !process.env.PAYSTACK_WEBHOOK_URL.startsWith("https://")) {
  console.error("Paystack production configuration is incomplete: PAYSTACK_SECRET_KEY and HTTPS PAYSTACK_WEBHOOK_URL are required.");
  process.exit(1);
}

if (process.env.STORAGE_PROVIDER === "local") {
  console.warn("WARNING: STORAGE_PROVIDER=local. Use durable object/cloud storage before production deployment.");
}
console.log("Production environment checks passed.");
