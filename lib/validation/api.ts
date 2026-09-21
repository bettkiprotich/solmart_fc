import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

export const playerSchema = z.object({
  teamId: z.string().cuid().nullable().optional(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/),
  position: z.enum(["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"]),
  squadNumber: z.number().int().min(1).max(99).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  nationality: z.string().trim().max(80).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const newsSchema = z.object({
  categoryId: z.string().cuid().nullable().optional(),
  authorId: z.string().cuid().nullable().optional(),
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).nullable().optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  isDemoData: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).nullable().optional(),
  category: z.string().trim().min(1).max(80),
  status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(5000),
});
