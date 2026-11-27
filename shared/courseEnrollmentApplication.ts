import { z } from "zod";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .refine(value => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Enter a valid date.");

const phonePattern = /^\+?[0-9 ()-]{7,20}$/;

export const courseEnrollmentAccountDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(160),
  email: z.string().trim().email("Enter a valid email address.").max(320),
  phone: z.string().trim().regex(phonePattern, "Enter a valid phone number."),
});

export const courseEnrollmentCredentialSchema = z.object({
  title: z.string().trim().min(1).max(200),
  issuer: z.string().trim().min(1).max(200),
  date: dateOnly,
  id: z.string().trim().max(120),
});

export const courseEnrollmentApplicationSchema = z.object({
  ...courseEnrollmentAccountDetailsSchema.shape,
  preferredName: z.string().trim().max(160),
  dob: dateOnly.refine(value => value < new Date().toISOString().slice(0, 10), {
    message: "Date of birth must be in the past.",
  }),
  nationality: z.string().trim().min(1).max(100),
  idNumber: z.string().trim().min(1).max(120),
  altPhone: z
    .string()
    .trim()
    .max(32)
    .refine(value => !value || phonePattern.test(value)),
  city: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(500),
  country: z.string().trim().min(1).max(120),
  postal: z.string().trim().max(32),
  qualification: z.string().trim().min(1).max(160),
  fieldOfStudy: z.string().trim().min(1).max(200),
  institution: z.string().trim().min(1).max(240),
  gradYear: z
    .string()
    .regex(/^(19|20)\d{2}$/)
    .refine(
      value =>
        Number(value) >= 1950 && Number(value) <= new Date().getFullYear()
    ),
  credentials: z.array(courseEnrollmentCredentialSchema).min(1).max(20),
  ecName: z.string().trim().min(1).max(160),
  ecRelation: z.string().trim().min(1).max(120),
  ecPhone: z.string().trim().regex(phonePattern),
  ecEmail: z
    .string()
    .trim()
    .max(320)
    .refine(value => !value || z.string().email().safeParse(value).success),
  declaration: z.literal(true),
  signature: z.string().trim().min(3).max(160),
  signDate: dateOnly.refine(
    value => value <= new Date().toISOString().slice(0, 10),
    {
      message: "Signature date cannot be in the future.",
    }
  ),
});

export type CourseEnrollmentApplication = z.infer<
  typeof courseEnrollmentApplicationSchema
>;
