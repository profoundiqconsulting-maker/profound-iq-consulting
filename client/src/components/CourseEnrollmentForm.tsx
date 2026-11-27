"use client";

/* Profound IQ Consulting — Reusable course enrollment form modal.
 * All six prerequisite sections (personal, contact, education, prior coursework,
 * emergency contact, declaration/signature). Used for enrollment in any course.
 */
import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import PaystackInlineModal from "@/components/PaystackInlineModal";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import {
  ArrowRight,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { courseEnrollmentApplicationSchema } from "../../../shared/courseEnrollmentApplication";
import { passwordStrength } from "../../../shared/localAuth";

interface CourseEnrollmentFormProps {
  courseSlug: string;
  className?: string;
}

export function CourseEnrollmentForm({
  courseSlug,
  className,
}: CourseEnrollmentFormProps) {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [accountPassword, setAccountPassword] = useState("");
  const [accountPasswordConfirm, setAccountPasswordConfirm] = useState("");
  const [credentials, setCredentials] = useState<Array<{
    title: string;
    issuer: string;
    date: string;
    id: string;
  }>>([{ title: "", issuer: "", date: "", id: "" }]);

  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [inlineProduct, setInlineProduct] = useState<{
    accessCode: string;
    reference: string;
    amountKes: number;
    productName: string;
    productType: "course_stage";
    enrollmentId: number;
    courseSlug: string;
    stage: number;
  } | null>(null);

  const [form, setForm] = useState<{
    fullName: string;
    preferredName: string;
    dob: string;
    nationality: string;
    idNumber: string;
    email: string;
    phone: string;
    altPhone: string;
    city: string;
    address: string;
    country: string;
    postal: string;
    qualification: string;
    fieldOfStudy: string;
    institution: string;
    gradYear: string;
    ecName: string;
    ecRelation: string;
    ecPhone: string;
    ecEmail: string;
    declaration: boolean;
    signature: string;
    signDate: string;
  }>({
    fullName: user?.name ?? "",
    preferredName: "",
    dob: "",
    nationality: "",
    idNumber: "",
    email: user?.email ?? "",
    phone: "",
    altPhone: "",
    city: "",
    address: "",
    country: "",
    postal: "",
    qualification: "",
    fieldOfStudy: "",
    institution: "",
    gradYear: "",
    ecName: "",
    ecRelation: "",
    ecPhone: "",
    ecEmail: "",
    declaration: false,
    signature: "",
    signDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!user) return;
    setForm(current => ({
      ...current,
      fullName: current.fullName || user.name || "",
      email: user.email || current.email,
      phone: current.phone || user.phone || "",
    }));
  }, [user]);

  const register = trpc.auth.register.useMutation();
  const enroll = trpc.course.enroll.useMutation();
  const checkout = trpc.course.initializeStageInlinePayment.useMutation();
  const verify = trpc.course.verifyStagePayment.useMutation();

  const today = new Date().toISOString().slice(0, 10);
  const currentYear = new Date().getFullYear();
  const signupHref = `/signup?returnTo=${encodeURIComponent(
    `/courses/${courseSlug}?workspace=1`
  )}`;

  const setField = useCallback(
    (key: string, value: string | boolean) => {
      setForm(prev => ({ ...prev, [key]: value }));
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const addCredential = () => {
    setCredentials([
      ...credentials,
      { title: "", issuer: "", date: "", id: "" },
    ]);
  };
  const removeCredential = (index: number) => {
    if (credentials.length === 1) return;
    setCredentials(credentials.filter((_, i) => i !== index));
  };

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const req = (key: string, value: string, msg: string) => {
      if (!value || !value.trim()) errors[key] = msg;
    };
    req("fullName", form.fullName, "Full name is required.");
    req("dob", form.dob, "Date of birth is required.");
    if (form.dob && form.dob > today) errors.dob = "Date of birth must be in the past.";
    req("nationality", form.nationality, "Nationality is required.");
    req("idNumber", form.idNumber, "ID / Passport number is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email address.";
    if (!/^\+?[0-9 ()-]{7,20}$/.test(form.phone)) errors.phone = "Enter a valid phone number.";
    if (form.altPhone && !/^\+?[0-9 ()-]{7,20}$/.test(form.altPhone))
      errors.altPhone = "Enter a valid alternate phone number.";
    if (
      form.ecEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ecEmail)
    )
      errors.ecEmail = "Enter a valid email address.";
    req("city", form.city, "City is required.");
    req("address", form.address, "Address is required.");
    req("country", form.country, "Country is required.");
    req("qualification", form.qualification, "Select your highest qualification.");
    req("fieldOfStudy", form.fieldOfStudy, "Field of study is required.");
    req("institution", form.institution, "Institution is required.");
    if (!/^(19|20)\d{2}$/.test(form.gradYear) || +form.gradYear > currentYear) {
      errors.gradYear = "Enter a valid graduation year.";
    }
    if (credentials.some(c => !c.title || !c.issuer || !c.date)) {
      errors.credentials = "Complete at least one prior coursework/certification row.";
    }
    req("ecName", form.ecName, "Emergency contact name is required.");
    req("ecRelation", form.ecRelation, "Relationship is required.");
    if (!/^\+?[0-9 ()-]{7,20}$/.test(form.ecPhone)) errors.ecPhone = "Enter a valid phone number.";
    if (!form.declaration) errors.declaration = "You must accept the declaration.";
    if (!form.signature || form.signature.trim().length < 3) {
      errors.signature = "Please sign with your full legal name.";
    }
    if (!isAuthenticated) {
      if (passwordStrength(accountPassword) < 3) {
        errors.accountPassword =
          "Use at least 10 characters, including letters and numbers.";
      }
      if (accountPassword !== accountPasswordConfirm) {
        errors.accountPasswordConfirm = "Passwords do not match.";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    form,
    credentials,
    today,
    currentYear,
    isAuthenticated,
    accountPassword,
    accountPasswordConfirm,
  ]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    const applicationResult = courseEnrollmentApplicationSchema.safeParse({
      ...form,
      credentials,
    });
    if (!applicationResult.success) {
      const applicationErrors = Object.fromEntries(
        applicationResult.error.issues.map(issue => [
          issue.path[0] === "credentials" ? "credentials" : String(issue.path[0]),
          issue.message,
        ])
      );
      setFormErrors(current => ({ ...current, ...applicationErrors }));
      return;
    }
    setSubmitting(true);
    try {
      if (!isAuthenticated) {
        await register.mutateAsync({
          name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: accountPassword,
        });
        await utils.auth.me.invalidate();
        const session = await utils.auth.me.fetch();
        if (!session)
          throw new Error(
            "Your account was created, but the sign-in session could not be confirmed. Please sign in and try again."
          );
      }
      const result = await enroll.mutateAsync({
        courseSlug,
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        consent: true,
        application: applicationResult.data,
      });
      if (!result.enrollmentId) {
        toast.error("Enrollment could not be created");
        setSubmitting(false);
        return;
      }
      const payment = await checkout.mutateAsync({
        enrollmentId: result.enrollmentId,
        stage: 1,
      });
      if ("paid" in payment && payment.paid) {
        void utils.course.state.invalidate();
        void utils.profile.get.invalidate();
        toast.success("Enrolled", { description: "Your course access is active." });
        setIsOpen(false);
        setSubmitting(false);
        return;
      }
      setInlineProduct({
        accessCode: payment.accessCode,
        reference: payment.reference,
        amountKes: payment.amountKes,
        productName: payment.productName,
        productType: payment.productType as "course_stage",
        enrollmentId: result.enrollmentId,
        courseSlug: courseSlug,
        stage: payment.stage,
      });
      setIsOpen(false);
      setInlineModalOpen(true);
      setSubmitting(false);
    } catch (error) {
      toast.error("Enrollment could not be completed", {
        description: (error as { message?: string })?.message,
      });
      setSubmitting(false);
    }
  };

  const pending =
    register.isPending ||
    enroll.isPending ||
    checkout.isPending ||
    verify.isPending;

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            navigate(signupHref);
            return;
          }
          setIsOpen(true);
          setFormErrors({});
          setSubmitting(false);
          setInlineProduct(null);
        }}
        disabled={authLoading || pending}
        variant="brand"
        size="default"
        className={cn(
          "mt-6 disabled:cursor-wait disabled:opacity-60",
          className
        )}
      >
        {!isAuthenticated ? (
          <ArrowRight size={14} />
        ) : pending ? (
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight size={14} />
        )}
        {!isAuthenticated ? "Sign up to enroll" : "Enroll in course"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-[#fffdf7] p-4 text-slate-900 shadow-2xl sm:p-6 lg:p-8"
        >
          <DialogHeader className="sticky top-0 z-10 -mx-4 -mt-4 mb-2 flex-row items-start justify-between border-b border-slate-200 bg-[#fffdf7] px-4 py-4 text-left sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[.13em] text-[var(--brand)]">
                Profound IQ Consulting
              </p>
              <DialogTitle className="display mt-1 text-2xl text-[#16243d] sm:text-3xl">
                {isAuthenticated ? "Course enrollment" : "Create account & enroll"}
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Complete your learner application. We’ll prefill your account
                details when available, so they stay consistent across your
                profile and enrollment.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close enrollment form"
                className="ml-3 grid size-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#16243d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
              >
                <X size={18} />
              </button>
            </DialogClose>
          </DialogHeader>
          <div className="mb-1 rounded-xl border border-[var(--brand)]/20 bg-[var(--brand)]/[.08] px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold">Six sections.</span> Your required
            details are marked with an asterisk. You can review everything
            before submitting.
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-5 [&_fieldset]:!rounded-2xl [&_fieldset]:!border-slate-200 [&_fieldset]:!bg-white [&_fieldset]:!p-4 [&_fieldset]:!text-slate-700 [&_input:not(.enrollment-consent)]:!w-full [&_input:not(.enrollment-consent)]:!rounded-lg [&_input:not(.enrollment-consent)]:!border-slate-300 [&_input:not(.enrollment-consent)]:!bg-slate-50 [&_input:not(.enrollment-consent)]:!px-3 [&_input:not(.enrollment-consent)]:!py-3 [&_input:not(.enrollment-consent)]:!text-sm [&_input:not(.enrollment-consent)]:!text-slate-900 [&_input:not(.enrollment-consent):focus]:!border-[var(--brand)] [&_legend]:!px-2 [&_legend]:!text-sm [&_legend]:!font-semibold [&_legend]:!tracking-normal [&_legend]:!text-[var(--brand)] [&_label]:!text-xs [&_label]:!font-medium [&_label]:!normal-case [&_label]:!tracking-normal [&_label]:!text-slate-700 [&_select]:!w-full [&_select]:!rounded-lg [&_select]:!border-slate-300 [&_select]:!bg-slate-50 [&_select]:!px-3 [&_select]:!py-3 [&_select]:!text-sm [&_select]:!text-slate-900 [&_textarea]:!w-full [&_textarea]:!rounded-lg [&_textarea]:!border-slate-300 [&_textarea]:!bg-slate-50 [&_textarea]:!px-3 [&_textarea]:!py-3 [&_textarea]:!text-sm [&_textarea]:!text-slate-900"
          >
                {!isAuthenticated && (
                  <fieldset className="border border-[var(--brand)]/35 rounded-lg p-4 bg-[#131c2e]/50">
                    <legend className="text-xs font-black uppercase tracking-[.12em] text-[var(--brand)]">
                      Learner account
                    </legend>
                    <p className="mt-2 text-xs leading-5 text-[var(--fg-muted)]">
                      Create your account as part of this enrollment. Your name,
                      email, and phone above will also be used for sign-in and
                      your dashboard profile.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)]">
                        Password
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={accountPassword}
                          onChange={event =>
                            setAccountPassword(event.target.value)
                          }
                          className="mt-1 w-full rounded border border-[#2d3a4f] bg-[#05080d] px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-[var(--fg)] outline-none focus:border-[var(--brand)]"
                          required
                        />
                      </label>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)]">
                        Confirm password
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={accountPasswordConfirm}
                          onChange={event =>
                            setAccountPasswordConfirm(event.target.value)
                          }
                          className="mt-1 w-full rounded border border-[#2d3a4f] bg-[#05080d] px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-[var(--fg)] outline-none focus:border-[var(--brand)]"
                          required
                        />
                      </label>
                    </div>
                    {(formErrors.accountPassword ||
                      formErrors.accountPasswordConfirm) && (
                      <p role="alert" className="mt-2 text-xs text-[#e57373]">
                        {formErrors.accountPassword ??
                          formErrors.accountPasswordConfirm}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <a
                        href={`/auth?mode=login&returnTo=${encodeURIComponent(`/courses/${courseSlug}?workspace=1`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--brand)] underline underline-offset-2"
                      >
                        Already have an account? Sign in in another tab
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          await utils.auth.me.invalidate();
                          const session = await utils.auth.me.fetch();
                          if (!session) {
                            setFormErrors(current => ({
                              ...current,
                              account:
                                "Sign in in the other tab, then choose this button to continue.",
                            }));
                            return;
                          }
                          setFormErrors(current => {
                            const next = { ...current };
                            delete next.account;
                            return next;
                          });
                        }}
                        className="text-[var(--fg)] underline underline-offset-2"
                      >
                        I’ve signed in
                      </button>
                    </div>
                    {formErrors.account && (
                      <p role="alert" className="mt-2 text-xs text-[#e57373]">
                        {formErrors.account}
                      </p>
                    )}
                  </fieldset>
                )}
                {/* Section 1: Personal Information */}
                <fieldset className="border border-white/10 rounded-lg p-4 bg-[#131c2e]/50">
                  <legend className="text-xs font-black uppercase tracking-[.12em] text-[var(--brand)]">
                    1 · Applicant Personal Information
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2 mt-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                      Full name <span className="text-[#c0392b]">*</span>
                    </label>
                    <input
                      value={form.fullName}
                      onChange={e => setField("fullName", e.target.value)}
                      className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                      required
                    />
                    {formErrors.fullName && (
                      <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                      Preferred name
                    </label>
                      <input
                        value={form.preferredName}
                        onChange={e => setField("preferredName", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Date of birth <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        type="date"
                        max={today}
                        value={form.dob}
                        onChange={e => setField("dob", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.dob && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.dob}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Nationality <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        value={form.nationality}
                        onChange={e => setField("nationality", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.nationality && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.nationality}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        ID / Passport number <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        value={form.idNumber}
                        onChange={e => setField("idNumber", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.idNumber && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.idNumber}</p>
                      )}
                    </div>
                  </div>
                </fieldset>

                {/* Section 2: Contact Details */}
                <fieldset className="border border-white/10 rounded-lg p-4 bg-[#131c2e]/50">
                  <legend className="text-xs font-black uppercase tracking-[.12em] text-[var(--brand)]">
                    2 · Contact Details
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2 mt-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Email address <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setField("email", e.target.value)}
                        readOnly={isAuthenticated}
                        className={cn(
                          "w-full rounded border border-[#2d3a4f] bg-[#05080d] px-3 py-2.5 text-[var(--fg)] outline-none focus:border-[var(--brand)]",
                          isAuthenticated && "cursor-not-allowed opacity-75"
                        )}
                        required
                      />
                      {formErrors.email && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Primary phone <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setField("phone", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.phone && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Alternate phone
                      </label>
                      <input
                        type="tel"
                        value={form.altPhone}
                        onChange={e => setField("altPhone", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                      />
                      {formErrors.altPhone && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.altPhone}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        City <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        value={form.city}
                        onChange={e => setField("city", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.city && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.city}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Postal address <span className="text-[#c0392b]">*</span>
                      </label>
                      <textarea
                        value={form.address}
                        onChange={e => setField("address", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.address && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.address}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Country <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        value={form.country}
                        onChange={e => setField("country", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.country && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.country}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Postal code
                      </label>
                      <input
                        value={form.postal}
                        onChange={e => setField("postal", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Section 3: Educational History */}
                <fieldset className="border border-white/10 rounded-lg p-4 bg-[#131c2e]/50">
                  <legend className="text-xs font-black uppercase tracking-[.12em] text-[var(--brand)]">
                    3 · Educational History
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2 mt-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Highest qualification <span className="text-[#c0392b]">*</span>
                      </label>
                      <select
                        value={form.qualification}
                        onChange={e => setField("qualification", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      >
                        <option value="">Select…</option>
                        <option>Secondary / High school</option>
                        <option>Diploma</option>
                        <option>Bachelor's degree</option>
                        <option>Master's degree</option>
                        <option>Doctorate</option>
                        <option>Other</option>
                      </select>
                      {formErrors.qualification && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.qualification}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Field of study <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        value={form.fieldOfStudy}
                        onChange={e => setField("fieldOfStudy", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.fieldOfStudy && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.fieldOfStudy}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Institution <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        value={form.institution}
                        onChange={e => setField("institution", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.institution && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.institution}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Graduation year <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        type="number"
                        min="1950"
                        max={currentYear}
                        value={form.gradYear}
                        onChange={e => setField("gradYear", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.gradYear && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.gradYear}</p>
                      )}
                    </div>
                  </div>
                </fieldset>

                {/* Section 4: Prior Coursework / Certifications */}
                <fieldset className="border border-white/10 rounded-lg p-4 bg-[#131c2e]/50">
                  <legend className="text-xs font-black uppercase tracking-[.12em] text-[var(--brand)]">
                    4 · Prior Coursework or Certifications
                  </legend>
                  <p className="text-[10px] leading-5 text-[var(--fg-muted)] mb-3">
                    List credentials used to verify prerequisites. At least one row is required.
                  </p>
                  <div className="space-y-2 mt-2">
                    {credentials.map((cred, i) => (
                      <div
                        key={i}
                        className="border border-[#2d3a4f] rounded p-3 bg-[#0a0e16]"
                      >
                        <div className="grid gap-2 sm:grid-cols-4 mb-2">
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-[.08em] text-[var(--fg-muted)] block mb-1">
                              Title <span className="text-[#c0392b]">*</span>
                            </label>
                            <input
                              value={cred.title}
                              onChange={e => {
                                const next = [...credentials];
                                next[i].title = e.target.value;
                                setCredentials(next);
                              }}
                              className="w-full px-2 py-2 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] text-xs focus:border-[var(--brand)] outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-[.08em] text-[var(--fg-muted)] block mb-1">
                              Issuing institution <span className="text-[#c0392b]">*</span>
                            </label>
                            <input
                              value={cred.issuer}
                              onChange={e => {
                                const next = [...credentials];
                                next[i].issuer = e.target.value;
                                setCredentials(next);
                              }}
                              className="w-full px-2 py-2 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] text-xs focus:border-[var(--brand)] outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-[.08em] text-[var(--fg-muted)] block mb-1">
                              Completion date <span className="text-[#c0392b]">*</span>
                            </label>
                            <input
                              type="date"
                              max={today}
                              value={cred.date}
                              onChange={e => {
                                const next = [...credentials];
                                next[i].date = e.target.value;
                                setCredentials(next);
                              }}
                              className="w-full px-2 py-2 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] text-xs focus:border-[var(--brand)] outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-[.08em] text-[var(--fg-muted)] block mb-1">
                              Credential ID
                            </label>
                            <input
                              value={cred.id}
                              onChange={e => {
                                const next = [...credentials];
                                next[i].id = e.target.value;
                                setCredentials(next);
                              }}
                              className="w-full px-2 py-2 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] text-xs focus:border-[var(--brand)] outline-none"
                            />
                          </div>
                        </div>
                        {formErrors.credentials && i === 0 && (
                          <p className="text-[10px] text-[#c0392b]">{formErrors.credentials}</p>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCredential}
                      className="text-[10px] font-bold text-[var(--brand)] hover:text-[var(--fg)] flex items-center gap-1 mt-1"
                    >
                      <span>+</span> Add another credential
                    </button>
                    {credentials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCredential(credentials.length - 1)}
                        className="text-[10px] font-bold text-[#c0392b] hover:text-[var(--fg)] flex items-center gap-1 mt-1"
                      >
                        <span>–</span> Remove last credential
                      </button>
                    )}
                  </div>
                </fieldset>

                {/* Section 5: Emergency Contact */}
                <fieldset className="border border-white/10 rounded-lg p-4 bg-[#131c2e]/50">
                  <legend className="text-xs font-black uppercase tracking-[.12em] text-[var(--brand)]">
                    5 · Emergency Contact
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2 mt-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Full name <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        value={form.ecName}
                        onChange={e => setField("ecName", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.ecName && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.ecName}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Relationship <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        value={form.ecRelation}
                        onChange={e => setField("ecRelation", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.ecRelation && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.ecRelation}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Phone <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.ecPhone}
                        onChange={e => setField("ecPhone", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.ecPhone && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.ecPhone}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.ecEmail}
                        onChange={e => setField("ecEmail", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                      />
                      {formErrors.ecEmail && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.ecEmail}</p>
                      )}
                    </div>
                  </div>
                </fieldset>

                {/* Section 6: Declaration & Signature */}
                <fieldset className="border border-white/10 rounded-lg p-4 bg-[#131c2e]/50">
                  <legend className="text-xs font-black uppercase tracking-[.12em] text-[var(--brand)]">
                    6 · Declaration &amp; Signature
                  </legend>
                  <div className="flex gap-3 mb-3 text-[12px] leading-5 text-[var(--fg)]">
                    <input
                      id="declaration"
                      type="checkbox"
                      checked={form.declaration}
                      onChange={e => setField("declaration", e.target.checked)}
                      className="enrollment-consent mt-0.5 accent-[var(--brand)]"
                      required
                    />
                    <label htmlFor="declaration" className="cursor-pointer">
                      I declare that the information provided is accurate and complete, and I
                      consent to its use for enrollment and course administration.
                      <span className="text-[#c0392b] font-bold">*</span>
                    </label>
                  </div>
                  {formErrors.declaration && (
                    <p className="text-[10px] text-[#c0392b] mb-3">{formErrors.declaration}</p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Signature (type full legal name) <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        value={form.signature}
                        onChange={e => setField("signature", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                      {formErrors.signature && (
                        <p className="text-[10px] text-[#c0392b] mt-1">{formErrors.signature}</p>
                      )}
                      <p className="text-[10px] text-[#5d6b84] mt-1">
                        Typing your name constitutes an electronic signature.
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fg-muted)] block mb-1">
                        Date <span className="text-[#c0392b]">*</span>
                      </label>
                      <input
                        type="date"
                        max={today}
                        value={form.signDate}
                        onChange={e => setField("signDate", e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#2d3a4f] bg-[#05080d] text-[var(--fg)] focus:border-[var(--brand)] outline-none"
                        required
                      />
                    </div>
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16243d] px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#243c60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:cursor-wait disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Check size={14} />
                  )}
                  {submitting
                    ? isAuthenticated
                      ? "Processing enrollment…"
                      : "Creating account and enrolling…"
                    : isAuthenticated
                      ? "Submit enrollment"
                      : "Create account & submit enrollment"}
                </button>
              </form>
        </DialogContent>
      </Dialog>

      <PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail={form.email}
        onClose={() => {
          setInlineModalOpen(false);
          setInlineProduct(null);
        }}
        onSuccess={reference => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          verify.mutate(
            { reference },
            {
              onSuccess: () => {
                void utils.course.state.invalidate();
                void utils.profile.get.invalidate();
                setInlineModalOpen(false);
                toast.success("Payment verified", {
                  description: "Your course access is updated.",
                });
              },
              onError: error => {
                toast.error("Payment verification needs attention", {
                  description: error.message,
                });
              },
            }
          );
        }}
        onError={message => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          toast.error("Payment failed", { description: message });
        }}
      />
    </>
  );
}
