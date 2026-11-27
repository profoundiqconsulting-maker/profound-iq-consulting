import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findUserByLocalIdentifier,
  getCourseEnrollmentApplication,
  getOrCreateCourseEnrollment,
  getUserProfile,
  listAssessmentRoadmap,
  saveCourseEnrollmentApplication,
  updateUserProfile,
} = vi.hoisted(() => ({
  findUserByLocalIdentifier: vi.fn(),
  getCourseEnrollmentApplication: vi.fn(),
  getOrCreateCourseEnrollment: vi.fn(),
  getUserProfile: vi.fn(),
  listAssessmentRoadmap: vi.fn(),
  saveCourseEnrollmentApplication: vi.fn(),
  updateUserProfile: vi.fn(),
}));

vi.mock("./db", () => ({
  findUserByLocalIdentifier,
  getCourseEnrollmentApplication,
  getOrCreateCourseEnrollment,
  getUserProfile,
  listAssessmentRoadmap,
  saveCourseEnrollmentApplication,
  updateUserProfile,
}));

const { appRouter } = await import("./routers");

function context(openId: string | null) {
  const now = new Date();
  return {
    user: openId
      ? {
          id: 1,
          openId,
          name: "Test User",
          email: "test@example.com",
          loginMethod: "test",
          role: "user",
          createdAt: now,
          updatedAt: now,
          lastSignedIn: now,
        }
      : null,
    req: { protocol: "https", headers: {} } as never,
    res: {} as never,
  };
}

const application = {
  fullName: "Ada Lovelace",
  preferredName: "",
  dob: "1990-01-01",
  nationality: "Kenyan",
  idNumber: "A123456",
  email: "test@example.com",
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
  declaration: true as const,
  signature: "Ada Lovelace",
  signDate: new Date().toISOString().slice(0, 10),
};

describe("course enrollment applications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves the full application and updates the authenticated profile", async () => {
    findUserByLocalIdentifier.mockResolvedValue(null);
    listAssessmentRoadmap.mockResolvedValue({ items: [], count: 0 });
    getOrCreateCourseEnrollment.mockResolvedValue({ id: 42 });
    getUserProfile.mockResolvedValue(null);
    updateUserProfile.mockResolvedValue(undefined);
    saveCourseEnrollmentApplication.mockResolvedValue(undefined);

    const caller = appRouter.createCaller(context("owner-1"));
    const { courses } = await caller.course.catalog();
    const result = await caller.course.enroll({
      courseSlug: courses[0].slug,
      name: application.fullName,
      email: application.email,
      consent: true,
      application,
    });

    expect(result.applicationSubmitted).toBe(true);
    expect(findUserByLocalIdentifier).toHaveBeenCalledWith("254700000000");
    expect(updateUserProfile).toHaveBeenCalledWith(
      "owner-1",
      expect.objectContaining({
        name: application.fullName,
        email: application.email,
        phone: "254700000000",
      })
    );
    expect(saveCourseEnrollmentApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        enrollmentId: 42,
        userOpenId: "owner-1",
        courseSlug: courses[0].slug,
        application: expect.objectContaining({
          idNumber: application.idNumber,
          ecName: application.ecName,
          declaration: true,
        }),
      })
    );
  });

  it("only returns application data to the authenticated owner", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(
      caller.course.enrollmentApplication({ courseSlug: "leadership" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(getCourseEnrollmentApplication).not.toHaveBeenCalled();

    const ownerCaller = appRouter.createCaller(context("owner-1"));
    getCourseEnrollmentApplication.mockResolvedValue({
      enrollmentId: 42,
      courseSlug: "leadership",
      application,
    });
    await ownerCaller.course.enrollmentApplication({
      courseSlug: "leadership",
    });
    expect(getCourseEnrollmentApplication).toHaveBeenCalledWith(
      "owner-1",
      "leadership"
    );
  });
});
