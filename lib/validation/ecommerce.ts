import { z } from "zod";

export const cartAddSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1).max(20),
});

export const cartUpdateSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.number().int().min(0).max(20),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().toLowerCase().email(),
  customerPhone: z.string().trim().min(7).max(30),
  deliveryAddress: z.string().trim().min(5).max(300),
  deliveryCity: z.string().trim().min(2).max(100),
  deliveryCounty: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const mpesaPaymentSchema = z.object({
  orderId: z.string().cuid(),
  phone: z.string().trim().min(9).max(16),
});
