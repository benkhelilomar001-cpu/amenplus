import { z } from "zod";
import { CONTACT_METHODS, CUSTOMER_TYPES, LOCALES } from "./constants";

// Shared by the browser form and the API route, so both validate the same way.
// Messages are error codes; the UI translates them (see messages/*.json → quote.errors).

export type FieldErrorCode = "required" | "invalid" | "tooShort" | "tooLong" | "contactRequired" | "consent";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { message: "tooLong" })
    .optional()
    .transform((v) => (v ? v : undefined));

export const quoteItemSchema = z.object({
  productId: z.string().min(1).max(40),
  quantity: z.coerce.number().int().min(1).max(999),
  note: z.string().trim().max(300).optional(),
});

export const quoteSchema = z
  .object({
    kind: z.enum(["QUOTE", "CONTACT"]),
    locale: z.enum(LOCALES),
    customerType: z.enum(CUSTOMER_TYPES, { message: "required" }),
    name: z.string().trim().min(2, { message: "required" }).max(120, { message: "tooLong" }),
    company: optionalText(160),
    email: optionalText(160),
    phone: optionalText(40),
    preferredContact: z.enum(CONTACT_METHODS).optional(),
    region: optionalText(40),
    city: optionalText(120),
    categorySlug: optionalText(80),
    description: z.string().trim().min(10, { message: "tooShort" }).max(4000, { message: "tooLong" }),
    dimensions: optionalText(300),
    finish: optionalText(300),
    budget: optionalText(120),
    desiredDate: optionalText(120),
    items: z.array(quoteItemSchema).max(30),
    consent: z.literal(true, { message: "consent" }),
  })
  .superRefine((data, ctx) => {
    for (const [path, message] of Object.entries(crossFieldErrors(data))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    }
  });

/**
 * Checks that involve several fields. Zod skips refinements while other fields are invalid,
 * so the form also calls this directly to show every error at once.
 */
export function crossFieldErrors(d: { kind?: string; email?: string; phone?: string; region?: string }): Record<string, FieldErrorCode> {
  const out: Record<string, FieldErrorCode> = {};
  const email = d.email?.trim();
  const phone = d.phone?.trim();
  if (!email && !phone) out.email = "contactRequired";
  else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) out.email = "invalid";
  if (phone && !/^[+0-9 ().-]{6,20}$/.test(phone)) out.phone = "invalid";
  if (d.kind === "QUOTE" && !d.region?.trim()) out.region = "required";
  return out;
}

export type QuoteInput = z.infer<typeof quoteSchema>;

export function fieldErrors(error: z.ZodError): Record<string, FieldErrorCode> {
  const out: Record<string, FieldErrorCode> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = (issue.message as FieldErrorCode) || "invalid";
  }
  return out;
}
