import { describe, expect, it } from "vitest";
import {
  courseEnrollmentAccountDetailsSchema,
  courseEnrollmentApplicationSchema,
} from "./courseEnrollmentApplication";

const validApplication = {
  fullName: "Ada Lovelace",
  preferredName: "",
  dob: "1990-01-01",
  nationality: "Kenyan",
  idNumber: "A123456",
  email: "ada@example.com",
  phone: "+254 700 000 000",
  altPhone: "",
  city: "Nairobi",
  address: "1 Example Street",
  country: "Kenya",
  postal: "",
  qualification: "Bachelor's degree",
  fieldOfStudy: "Computer science",
  institution: "Example University",
  gradYear: "2012",
  credentials: [
    {
      title: "Certificate",
      issuer: "Example Institute",
      date: "2015-01-01",
      id: "",
    },
  ],
  ecName: "Grace Lovelace",
  ecRelation: "Parent",
  ecPhone: "+254 700 000 001",
  ecEmail: "",
  declaration: true,
  signature: "Ada Lovelace",
  signDate: new Date().toISOString().slice(0, 10),
};

describe("course enrollment application validation", () => {
  it("requires the same name, email, and phone details used for account signup", () => {
    expect(
      courseEnrollmentAccountDetailsSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+254 700 000 000",
      }).success
    ).toBe(true);
    expect(
      courseEnrollmentAccountDetailsSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: "",
      }).success
    ).toBe(false);
  });

  it("accepts and normalizes a complete consented application", () => {
    const result = courseEnrollmentApplicationSchema.safeParse({
      ...validApplication,
      fullName: " Ada Lovelace ",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.fullName).toBe("Ada Lovelace");
  });

  it("rejects impossible dates and missing declaration consent", () => {
    const result = courseEnrollmentApplicationSchema.safeParse({
      ...validApplication,
      dob: "1990-02-30",
      declaration: false,
    });

    expect(result.success).toBe(false);
  });
});
