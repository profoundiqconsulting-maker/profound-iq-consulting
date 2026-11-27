import { describe, expect, it } from "vitest";
import {
  checkoutInitializeInputSchema,
  checkoutInitializeResultSchema,
} from "./checkoutApi";
import {
  calculateCheckoutAmountKes,
  checkoutAmountFromMetadata,
} from "./paymentInit";

describe("checkout API contract", () => {
  it("normalizes optional upsells and accepts valid checkout input", () => {
    const input = checkoutInitializeInputSchema.parse({
      productType: "course_stage",
      productSlug: "leadership",
      productName: "Leadership",
      amountKes: 2500,
      customerName: "  Ada Lovelace  ",
      customerEmail: "ada@example.com",
    });

    expect(input.customerName).toBe("Ada Lovelace");
    expect(input.upsellIds).toEqual([]);
  });

  it("rejects malformed or incomplete checkout requests", () => {
    expect(() =>
      checkoutInitializeInputSchema.parse({
        productType: "course_stage",
        productName: "Leadership",
        amountKes: 2500,
        customerName: "Ada Lovelace",
        customerEmail: "not-an-email",
      })
    ).toThrow();
  });

  it("requires completed answers and calculates server-approved checkout totals", () => {
    const checkout = checkoutInitializeInputSchema.parse({
      productType: "psychometric",
      productSlug: "career-personality-profile",
      productName: "Career profile",
      amountKes: 699,
      customerName: "Ada Lovelace",
      customerEmail: "ada@example.com",
      answers: [{ questionId: "question-1", value: 4 }],
    });

    expect(checkout.answers).toEqual([{ questionId: "question-1", value: 4 }]);
    expect(() =>
      checkoutInitializeInputSchema.parse({
        productType: "careerpath",
        productName: "CareerPath",
        amountKes: 399,
        customerName: "Ada Lovelace",
        customerEmail: "ada@example.com",
      })
    ).toThrow();

    expect(calculateCheckoutAmountKes("careerpath", ["coaching"])).toBe(5399);
    expect(calculateCheckoutAmountKes("careerpath", ["unapproved"])).toBeNull();
    expect(
      checkoutAmountFromMetadata("psychometric", {
        upsell_ids: "careerpath,coaching",
      })
    ).toBe(20699);
    expect(
      checkoutAmountFromMetadata("psychometric", '{"upsell_ids":"unknown"}')
    ).toBeNull();
  });

  it("validates the payment response before it reaches the UI", () => {
    const result = checkoutInitializeResultSchema.parse({
      accessCode: "access-code",
      reference: "piq-test-reference",
      amountKes: 2500,
      amountLocal: 250000,
      currency: "KES",
      provider: "paystack",
      authorizationUrl: "https://checkout.paystack.com/example",
      productName: "Leadership",
      productType: "course_stage",
      testSlug: "leadership",
    });

    expect(result.provider).toBe("paystack");
    expect(() =>
      checkoutInitializeResultSchema.parse({
        ...result,
        amountKes: "2500",
      })
    ).toThrow();
  });
});
