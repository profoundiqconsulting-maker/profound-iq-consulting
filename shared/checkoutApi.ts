import { z } from "zod";

export const checkoutProductTypeSchema = z.enum([
  "assessment",
  "careerpath",
  "psychometric",
  "course",
  "course_stage",
]);

export const checkoutInitializeInputSchema = z
  .object({
    productType: checkoutProductTypeSchema,
    productSlug: z.string().trim().min(1).max(120).optional(),
    productName: z.string().trim().min(1).max(200),
    amountKes: z.number().finite().positive(),
    customerName: z.string().trim().min(1).max(160),
    customerEmail: z.string().trim().email().max(320),
    customerCountry: z.string().trim().length(2).optional(),
    upsellIds: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
    answers: z
      .array(
        z.object({
          questionId: z.string().trim().min(1).max(120),
          value: z.number().int().min(1).max(5),
        })
      )
      .max(250)
      .optional(),
    returnUrl: z.string().max(2048).optional(),
    enrollmentId: z.number().int().positive().optional(),
    stage: z.number().int().min(1).max(4).optional(),
  })
  .superRefine((input, context) => {
    if (
      (input.productType === "psychometric" ||
        input.productType === "course_stage") &&
      !input.productSlug
    ) {
      context.addIssue({
        code: "custom",
        message: "A product slug is required for this checkout type.",
        path: ["productSlug"],
      });
    }
    if (
      (input.productType === "assessment" ||
        input.productType === "careerpath" ||
        input.productType === "psychometric") &&
      !input.answers?.length
    ) {
      context.addIssue({
        code: "custom",
        message: "Answers are required before initializing this checkout.",
        path: ["answers"],
      });
    }
  });

export const checkoutInitializeResultSchema = z.object({
  accessCode: z.string().min(1),
  reference: z.string().min(1),
  amountKes: z.number().finite().positive(),
  amountLocal: z.number().finite().nonnegative(),
  currency: z.string().trim().min(1).max(10),
  provider: z.enum(["paystack", "stripe", "flutterwave", "manual"]),
  authorizationUrl: z.string().url().optional(),
  productName: z.string().min(1),
  productType: checkoutProductTypeSchema,
  testSlug: z.string().optional(),
  enrollmentId: z.number().int().positive().optional(),
  stage: z.number().int().min(1).max(4).optional(),
});

export type CheckoutInitializeInput = z.input<
  typeof checkoutInitializeInputSchema
>;
export type CheckoutInitializeResult = z.infer<
  typeof checkoutInitializeResultSchema
>;
