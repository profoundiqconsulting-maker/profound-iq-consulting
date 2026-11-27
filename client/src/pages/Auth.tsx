import { useEffect, useState } from "react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { SiteNavigation } from "@/components/SiteNavigation";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { passwordStrength } from "../../../shared/localAuth";
import { authCopy } from "../../../shared/authLocalization";
import { courseEnrollmentAccountDetailsSchema } from "@shared/courseEnrollmentApplication";

type Mode = "login" | "register" | "forgot" | "reset";

export default function Auth() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();

  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      const role = user.role?.toLowerCase();
      if (role === "admin") {
        navigate("/admin/overview", { replace: true });
      } else if (role === "staff") {
        navigate("/staff", { replace: true });
      } else {
        navigate("/dashboard/overview", { replace: true });
      }
    }
  }, [loading, user, navigate]);

  const [mode, setMode] = useState<Mode>(() => {
    const requested = new URLSearchParams(window.location.search).get("mode");
    return requested === "register" ||
      requested === "forgot" ||
      requested === "reset"
      ? requested
      : "login";
  });
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [mathA, setMathA] = useState(0);
  const [mathB, setMathB] = useState(0);
  const [mathUserAnswer, setMathUserAnswer] = useState("");
  const [inviteToken] = useState(
    () => new URLSearchParams(window.location.search).get("invite") ?? ""
  );
  const [returnTo] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get(
      "returnTo"
    );
    return requested &&
      requested.startsWith("/") &&
      !requested.startsWith("//") &&
      !requested.includes("\\")
      ? requested
      : "/dashboard";
  });
  const [securityQuestion1, setSecurityQuestion1] = useState("");
  const [securityAnswer1, setSecurityAnswer1] = useState("");
  const [securityQuestion2, setSecurityQuestion2] = useState("");
  const [securityAnswer2, setSecurityAnswer2] = useState("");
  const [showRecoveryQuestions, setShowRecoveryQuestions] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [securityQuestions, setSecurityQuestions] = useState<{
    question1: string | null;
    question2: string | null;
  } | null>(null);

  const SECURITY_QUESTIONS = [
    "What is the name of your first school?",
    "What is your favorite color?",
    "What is the name of your childhood pet?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was the name of your first employer?",
    "What is the model of your first car?",
    "What is your favorite food?",
    "What is the name of your best friend in high school?",
    "What is your favorite movie?",
    "What is the name of the street you grew up on?",
    "What is your favorite book?",
  ];

  const login = trpc.auth.login.useMutation({
    onSuccess: async data => {
      utils.auth.me.setData(undefined, data.user as any);
      await utils.auth.me.refetch();
      navigate(returnTo);
    },
    onError: error => toast.error(error.message),
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: async data => {
      utils.auth.me.setData(undefined, data.user as any);
      await utils.auth.me.refetch();
      navigate(returnTo);
    },
    onError: error => toast.error(error.message),
  });
  const reset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: result => toast.success(result.message),
    onError: error => toast.error(error.message),
  });
  const getSecurityQuestionsQuery = trpc.auth.getSecurityQuestions.useQuery(
    { email: resetEmail.trim() },
    { enabled: false, retry: false }
  );
  const verifySecurityQuestions = trpc.auth.verifySecurityQuestions.useMutation(
    {
      onSuccess: async () => {
        toast.success("Password reset successfully. Please sign in.");
        setMode("login");
        setPassword("");
        setSecurityQuestions(null);
        setResetEmail("");
        setSecurityAnswer1("");
        setSecurityAnswer2("");
      },
      onError: error => toast.error(error.message),
    }
  );

  useEffect(() => {
    if (getSecurityQuestionsQuery.data && mode === "forgot") {
      if (getSecurityQuestionsQuery.data.hasQuestions) {
        setSecurityQuestions({
          question1: getSecurityQuestionsQuery.data.question1,
          question2: getSecurityQuestionsQuery.data.question2,
        });
        setMode("reset");
      } else {
        reset.mutate({
          email: resetEmail.trim(),
          origin: PUBLISHED_SITE_ORIGIN,
        });
      }
    }
    if (getSecurityQuestionsQuery.isError && mode === "forgot") {
      toast.error("Unable to check security questions. Please try again.");
    }
  }, [getSecurityQuestionsQuery.data, getSecurityQuestionsQuery.isError, mode]);

  const generateMath = () => {
    setMathA(Math.floor(Math.random() * 20) + 1);
    setMathB(Math.floor(Math.random() * 20) + 1);
    setMathUserAnswer("");
  };
  useEffect(() => {
    if (mode === "login") generateMath();
  }, [mode]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (mode === "login") {
      if (!identifier.trim() || !password)
        return setFormError(
          "Enter your email, phone, or username and password to continue."
        );
      const answer = parseInt(mathUserAnswer, 10);
      if (isNaN(answer) || answer !== mathA + mathB)
        return setFormError(
          "Please solve the verification question correctly."
        );
      return login.mutate({
        identifier: identifier.trim(),
        password,
        trustDevice: true,
        mathA,
        mathB,
        mathAnswer: answer,
      });
    }
    if (mode === "forgot") {
      if (!resetEmail.trim() || !/^\S+@\S+\.\S+$/.test(resetEmail.trim()))
        return setFormError("Enter a valid email address.");
      return getSecurityQuestionsQuery.refetch();
    }
    if (mode === "reset" && securityQuestions) {
      if (!password || passwordStrength(password) < 3)
        return setFormError(
          "Choose a stronger password with at least 10 characters, including letters and numbers."
        );
      return verifySecurityQuestions.mutate({
        email: resetEmail.trim(),
        answer1: securityAnswer1.trim(),
        answer2: securityAnswer2.trim(),
        newPassword: password,
      });
    }
    const accountDetails = courseEnrollmentAccountDetailsSchema.safeParse({
      fullName: name,
      email,
      phone,
    });
    if (!accountDetails.success)
      return setFormError(
        accountDetails.error.issues[0]?.message ?? "Check your account details."
      );
    if (passwordStrength(password) < 3)
      return setFormError(
        "Choose a stronger password with at least 10 characters, including letters and numbers."
      );
    const selectedQ1 = securityQuestion1.trim();
    const selectedA1 = securityAnswer1.trim();
    const selectedQ2 = securityQuestion2.trim();
    const selectedA2 = securityAnswer2.trim();
    if (Boolean(selectedQ1) !== Boolean(selectedA1))
      return setFormError(
        "Provide both security question 1 and its answer, or leave both empty."
      );
    if (Boolean(selectedQ2) !== Boolean(selectedA2))
      return setFormError(
        "Provide both security question 2 and its answer, or leave both empty."
      );
    if (selectedQ1.length < 5)
      return setFormError("Security question 1 must be at least 5 characters.");
    if (selectedA1.length < 1)
      return setFormError("Security answer 1 is required.");
    if (selectedQ2.length < 5)
      return setFormError("Security question 2 must be at least 5 characters.");
    if (selectedA2.length < 1)
      return setFormError("Security answer 2 is required.");
    return register.mutate({
      name: accountDetails.data.fullName,
      email: accountDetails.data.email.toLowerCase(),
      phone: accountDetails.data.phone,
      username: username.trim() || undefined,
      password,
      inviteToken: inviteToken || undefined,
      securityQuestion1: selectedQ1 || undefined,
      securityAnswer1: selectedA1 || undefined,
      securityQuestion2: selectedQ2 || undefined,
      securityAnswer2: selectedA2 || undefined,
    });
  };
  const pending =
    mode === "login"
      ? login.isPending
      : mode === "forgot"
        ? getSecurityQuestionsQuery.isPending
        : mode === "reset"
          ? verifySecurityQuestions.isPending
          : register.isPending;
  const strength = passwordStrength(password);
  const strengthLabel =
    strength < 2
      ? "Needs work"
      : strength < 4
        ? "Getting stronger"
        : "Strong password";
  const strengthColor =
    strength < 2
      ? "bg-red-500"
      : strength < 4
        ? "bg-[var(--brand)]"
        : "bg-emerald-600";
  const isCourseReturn = returnTo.startsWith("/courses/");
  const modeDescription =
    mode === "login"
      ? "Use your email, phone, or username and password to continue."
      : mode === "register"
        ? "Create your learner profile once, then use it for course enrollment."
        : mode === "forgot"
          ? "We’ll help you get back into your account."
          : "Answer your saved security questions to choose a new password.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101d35]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-[var(--brand)]/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-sky-400/10 blur-3xl" />
      </div>
      <div className="relative z-10">
        <SiteNavigation variant="public" showAuthActions={false} />
      </div>
      <section className="container relative z-10 mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-8 px-4 py-6 sm:py-10 lg:grid-cols-[minmax(0,.9fr)_minmax(460px,1.1fr)] lg:gap-16 lg:py-12">
        <div className="dark order-2 pb-4 text-[#f7f3e8] lg:order-1 lg:pb-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[var(--brand-light)]">
            <LockKeyhole size={14} aria-hidden="true" />
            {authCopy.privateAccess}
          </p>
          <h1 className="display mt-5 text-4xl leading-tight sm:text-5xl lg:text-6xl">
            {authCopy.workspace}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            One secure account for your learning journey, course applications,
            and progress.
          </p>
          <div className="mt-7 grid max-w-lg gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <CheckCircle2
                size={18}
                className="shrink-0 text-[var(--brand-light)]"
                aria-hidden="true"
              />
              Keep your course details together
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <LockKeyhole
                size={18}
                className="shrink-0 text-[var(--brand-light)]"
                aria-hidden="true"
              />
              Private access to your workspace
            </div>
          </div>
        </div>
        <div className="order-1 min-w-0 lg:order-2">
          <div className="overflow-hidden rounded-3xl border border-white/50 bg-[#fffdf7] text-[#16243d] shadow-[0_28px_90px_rgba(0,0,0,.3)]">
            {!loading && !user && (mode === "login" || mode === "register") && (
              <div
                role="group"
                aria-label="Account options"
                className="mx-4 mt-4 grid grid-cols-2 rounded-xl bg-[#16243d]/[.06] p-1 sm:mx-8 sm:mt-8"
              >
                <button
                  type="button"
                  aria-pressed={mode === "login"}
                  onClick={() => {
                    setMode("login");
                    setFormError(null);
                  }}
                  className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-white text-[#16243d] shadow-sm"
                      : "text-slate-500 hover:text-[#16243d]"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "register"}
                  onClick={() => {
                    setMode("register");
                    setFormError(null);
                  }}
                  className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                    mode === "register"
                      ? "bg-white text-[#16243d] shadow-sm"
                      : "text-slate-500 hover:text-[#16243d]"
                  }`}
                >
                  Create account
                </button>
              </div>
            )}
            <div className="p-5 sm:p-8 lg:p-9">
              <div className="flex items-start gap-4 border-b border-[#16243d]/10 pb-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--brand)]/15 text-[var(--brand)]">
                  <LockKeyhole size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.13em] text-[var(--brand)]">
                    {authCopy.secureAccess}
                  </p>
                  <h2 className="display mt-1 text-2xl sm:text-3xl">
                    {mode === "login"
                      ? authCopy.welcome
                      : mode === "register"
                        ? authCopy.create
                        : authCopy.reset}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {modeDescription}
                  </p>
                </div>
              </div>
              {loading ? (
                <p className="mt-8 text-sm text-muted-foreground">
                  {authCopy.checking}
                </p>
              ) : user ? (
                <div className="mt-8">
                  <p className="text-sm leading-7 text-muted-foreground">
                    You are signed in as{" "}
                    <strong>{user.email ?? user.name}</strong>.
                  </p>
                  <Link
                    href="/dashboard"
                    className="mt-6 inline-flex items-center gap-2 bg-[#16243d] px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8]"
                  >
                    {authCopy.welcome} <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <>
                  {mode === "register" && isCourseReturn && (
                    <div className="mt-5 flex gap-3 rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand)]/[.08] p-4 text-sm leading-6 text-slate-700">
                      <CheckCircle2
                        size={18}
                        className="mt-1 shrink-0 text-[var(--brand)]"
                        aria-hidden="true"
                      />
                      After creating your account, you’ll return to your course
                      to finish enrollment.
                    </div>
                  )}
                  <form
                    onSubmit={submit}
                    className="mt-6 grid gap-4 [&_input]:w-full [&_input]:rounded-xl [&_input]:border-[#16243d]/15 [&_input]:bg-white [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-[#16243d] [&_input]:outline-none [&_input]:transition [&_input:focus]:border-[var(--brand)] [&_input:focus]:ring-4 [&_input:focus]:ring-[var(--brand)]/10 [&_label]:grid [&_label]:gap-2 [&_label]:text-xs [&_label]:font-semibold [&_label]:normal-case [&_label]:tracking-normal [&_label]:text-slate-700 [&_select]:w-full [&_select]:rounded-xl [&_select]:border-[#16243d]/15 [&_select]:bg-white [&_select]:px-4 [&_select]:py-3 [&_select]:text-sm [&_select]:text-[#16243d] [&_select]:outline-none [&_select:focus]:border-[var(--brand)] [&_select:focus]:ring-4 [&_select:focus]:ring-[var(--brand)]/10"
                  >
                    {mode === "register" && inviteToken && (
                      <div className="border-l-2 border-[var(--brand)] bg-[#16243d]/5 p-3 text-sm text-muted-foreground">
                        You are joining Profound IQ Consulting as an invited
                        team member. Register with the invited email address to
                        activate your staff access.
                      </div>
                    )}
                    {mode === "register" && (
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                        Full name
                        <input
                          id="register-name"
                          name="name"
                          required
                          value={name}
                          onChange={event => setName(event.target.value)}
                          className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                        />
                      </label>
                    )}
                    {mode === "login" && (
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                        Email, phone, or username
                        <input
                          id="login-identifier"
                          name="identifier"
                          required
                          value={identifier}
                          onChange={event => setIdentifier(event.target.value)}
                          autoComplete="username"
                          placeholder="Email, phone, or username"
                          className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                        />
                      </label>
                    )}
                    {mode !== "login" && (
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                        Email address
                        {mode === "register" && (
                          <span className="font-normal normal-case tracking-normal text-muted-foreground">
                            Use the same email address for your account and
                            course enrollment.
                          </span>
                        )}
                        <input
                          id="register-email"
                          name="email"
                          required
                          type="email"
                          value={
                            mode === "forgot" || mode === "reset"
                              ? resetEmail
                              : email
                          }
                          onChange={event => {
                            if (mode === "forgot" || mode === "reset") {
                              setResetEmail(event.target.value);
                            } else {
                              setEmail(event.target.value);
                            }
                          }}
                          autoComplete="email"
                          className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                        />
                      </label>
                    )}
                    {mode === "register" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                          Phone number
                          <input
                            id="register-phone"
                            name="phone"
                            value={phone}
                            onChange={event => setPhone(event.target.value)}
                            autoComplete="tel"
                            placeholder="+254..."
                            required
                            className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                          />
                        </label>
                        <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                          Username
                          <input
                            id="register-username"
                            name="username"
                            value={username}
                            onChange={event => setUsername(event.target.value)}
                            autoComplete="username"
                            placeholder="your.handle"
                            className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                          />
                        </label>
                      </div>
                    )}
                    {mode !== "forgot" && (
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                        Password
                        <span className="font-normal normal-case tracking-normal text-muted-foreground">
                          At least 10 characters, including letters and numbers.
                        </span>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            required
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            autoComplete={
                              mode === "login"
                                ? "current-password"
                                : "new-password"
                            }
                            className="w-full !pr-12 border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                          />
                          <button
                            type="button"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            onClick={() => setShowPassword(value => !value)}
                            className="absolute right-3 top-1/2 -translate-y-0.5 text-muted-foreground hover:text-[var(--brand)]"
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        {mode === "register" && (
                          <div aria-live="polite" className="mt-1">
                            <div
                              className="flex gap-1"
                              aria-label={`Password strength: ${strength} of 5`}
                              role="meter"
                              aria-valuemin={0}
                              aria-valuemax={5}
                              aria-valuenow={strength}
                            >
                              {[1, 2, 3, 4, 5].map(bar => (
                                <span
                                  key={bar}
                                  className={`h-1.5 flex-1 ${bar <= strength ? strengthColor : "bg-[#16243d]/10"}`}
                                />
                              ))}
                            </div>
                            <p className="mt-1 text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
                              {password
                                ? strengthLabel
                                : "Use length, upper and lowercase letters, numbers, and symbols."}
                            </p>
                          </div>
                        )}
                      </label>
                    )}
                    {mode === "login" && (
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                        Verification
                        <span className="font-normal normal-case tracking-normal text-muted-foreground">
                          Solve {mathA} + {mathB} = ?
                        </span>
                        <input
                          id="login-verification"
                          name="verification"
                          required
                          type="number"
                          inputMode="numeric"
                          value={mathUserAnswer}
                          onChange={event =>
                            setMathUserAnswer(event.target.value)
                          }
                          className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                        />
                      </label>
                    )}
                    {mode === "register" && (
                      <>
                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#16243d]/10 bg-slate-50 p-4">
                          <div>
                            <p className="text-sm font-semibold text-[#16243d]">
                              Password recovery questions
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Optional backup if you can’t access your email.
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-expanded={showRecoveryQuestions}
                            aria-controls="recovery-questions-fields"
                            onClick={() => {
                              if (showRecoveryQuestions) {
                                setSecurityQuestion1("");
                                setSecurityAnswer1("");
                                setSecurityQuestion2("");
                                setSecurityAnswer2("");
                              }
                              setShowRecoveryQuestions(value => !value);
                            }}
                            className="shrink-0 rounded-lg border border-[#16243d]/15 bg-white px-3 py-2 text-xs font-semibold text-[#16243d] transition hover:bg-slate-100"
                          >
                            {showRecoveryQuestions ? "Remove" : "Add"}
                          </button>
                        </div>
                        {showRecoveryQuestions && (
                          <div
                            id="recovery-questions-fields"
                            className="space-y-4"
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                                Security question 1
                                <select
                                  id="security-question-1"
                                  name="securityQuestion1"
                                  value={securityQuestion1}
                                  onChange={event =>
                                    setSecurityQuestion1(event.target.value)
                                  }
                                  className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                                >
                                  <option value="">Select a question</option>
                                  {SECURITY_QUESTIONS.map(question => (
                                    <option key={question} value={question}>
                                      {question}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                                Answer
                                <input
                                  id="security-answer-1"
                                  name="securityAnswer1"
                                  value={securityAnswer1}
                                  onChange={event =>
                                    setSecurityAnswer1(event.target.value)
                                  }
                                  placeholder="Your answer"
                                  autoComplete="off"
                                  className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                                />
                              </label>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                                Security question 2
                                <select
                                  id="security-question-2"
                                  name="securityQuestion2"
                                  value={securityQuestion2}
                                  onChange={event =>
                                    setSecurityQuestion2(event.target.value)
                                  }
                                  className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                                >
                                  <option value="">Select a question</option>
                                  {SECURITY_QUESTIONS.map(question => (
                                    <option key={question} value={question}>
                                      {question}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                                Answer
                                <input
                                  id="security-answer-2"
                                  name="securityAnswer2"
                                  value={securityAnswer2}
                                  onChange={event =>
                                    setSecurityAnswer2(event.target.value)
                                  }
                                  placeholder="Your answer"
                                  autoComplete="off"
                                  className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {mode === "reset" && securityQuestions && (
                      <>
                        <div className="border-l-2 border-[var(--brand)] bg-[#16243d]/5 p-3 text-sm text-muted-foreground">
                          <p className="font-semibold">
                            Question 1: {securityQuestions.question1}
                          </p>
                          <input
                            id="reset-security-answer-1"
                            name="securityAnswer1"
                            required
                            value={securityAnswer1}
                            onChange={event =>
                              setSecurityAnswer1(event.target.value)
                            }
                            placeholder="Your answer"
                            autoComplete="off"
                            className="mt-2 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                          />
                        </div>
                        <div className="border-l-2 border-[var(--brand)] bg-[#16243d]/5 p-3 text-sm text-muted-foreground">
                          <p className="font-semibold">
                            Question 2: {securityQuestions.question2}
                          </p>
                          <input
                            id="reset-security-answer-2"
                            name="securityAnswer2"
                            required
                            value={securityAnswer2}
                            onChange={event =>
                              setSecurityAnswer2(event.target.value)
                            }
                            placeholder="Your answer"
                            autoComplete="off"
                            className="mt-2 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                          />
                        </div>
                        <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                          New password
                          <span className="font-normal normal-case tracking-normal text-muted-foreground">
                            At least 10 characters, including letters and
                            numbers.
                          </span>
                          <div className="relative">
                            <input
                              id="reset-password"
                              name="password"
                              required
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={event =>
                                setPassword(event.target.value)
                              }
                              autoComplete="new-password"
                              className="w-full !pr-12 border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--brand)]"
                            />
                            <button
                              type="button"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              onClick={() => setShowPassword(value => !value)}
                              className="absolute right-3 top-1/2 -translate-y-0.5 text-muted-foreground hover:text-[var(--brand)]"
                            >
                              {showPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </label>
                      </>
                    )}
                    <button
                      type="submit"
                      disabled={pending}
                      className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16243d] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#243c60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:cursor-wait disabled:opacity-60"
                    >
                      {pending && (
                        <RefreshCw size={16} className="animate-spin" />
                      )}
                      {mode === "login"
                        ? "Sign in"
                        : mode === "register"
                          ? "Create account"
                          : mode === "reset"
                            ? "Reset password"
                            : "Send reset link"}
                      {!pending && <ArrowRight size={16} />}
                    </button>
                    {formError && (
                      <p
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                      >
                        {formError}
                      </p>
                    )}
                  </form>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setFormError(null);
                        }}
                        className="font-medium text-slate-600 underline-offset-4 transition hover:text-[#16243d] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                    {mode === "forgot" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="font-medium text-slate-600 underline-offset-4 transition hover:text-[#16243d] hover:underline"
                        >
                          Back to sign in
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode("register")}
                          className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline"
                        >
                          Need an account?
                        </button>
                      </>
                    )}
                    {mode === "reset" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setSecurityQuestions(null);
                          setSecurityAnswer1("");
                          setSecurityAnswer2("");
                        }}
                        className="font-medium text-slate-600 underline-offset-4 transition hover:text-[#16243d] hover:underline"
                      >
                        Back to email reset
                      </button>
                    )}
                  </div>
                </>
              )}
              <div className="mt-6 border-t border-[#16243d]/10 pt-5 text-xs leading-5 text-slate-500">
                <p className="flex items-start gap-2">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0 text-[var(--brand)]"
                  />
                  Your password is stored as a one-way cryptographic hash.
                </p>
                <p className="mt-2">
                  Password reset links are single-use and expire after 30
                  minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
