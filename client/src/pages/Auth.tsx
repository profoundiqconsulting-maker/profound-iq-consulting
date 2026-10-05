import { useEffect, useState } from "react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  facebook,
  instagram,
  linkedin,
  LockKeyhole,
  Loader2,
  MessageCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { BrandLogo } from "@/components/BrandLogo";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  passwordStrength,
} from "../../../shared/localAuth";
import { authCopy } from "../../../shared/authLocalization";

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
    return requested === "register" || requested === "forgot" || requested === "reset"
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
  const verifySecurityQuestions = trpc.auth.verifySecurityQuestions.useMutation({
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
  });

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
        return setFormError("Enter your email and password to continue.");
      const answer = parseInt(mathUserAnswer, 10);
      if (isNaN(answer) || answer !== mathA + mathB)
        return setFormError("Please solve the verification question correctly.");
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
    if (!name.trim()) return setFormError("Enter your full name.");
    if (!email.trim() && !username.trim())
      return setFormError("Provide an email address or username.");
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
      name: name.trim(),
      email: email || undefined,
      phone: phone || undefined,
      username: username || undefined,
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
        ? "bg-[#c9a34e]"
        : "bg-emerald-600";

  return (
    <main className="min-h-screen bg-[#101d35] text-[#f7f3e8]">
      <header className="border-b border-white/10">
        <div className="container flex items-center justify-between py-6">
          <Link href="/" aria-label="Profound IQ Consulting home">
            <BrandLogo context="home" className="border border-[#c9a34e]/70" />
          </Link>
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-[.16em] text-[#c9d1df] hover:text-[#8b6914]"
          >
            {authCopy.backToSite}
          </Link>
        </div>
      </header>
      <section className="container grid min-h-[calc(100vh-90px)] items-center gap-10 py-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow text-[#8b6914]">{authCopy.privateAccess}</p>
          <h1 className="display mt-5 heading-clamp-lg">
            {authCopy.workspace}
          </h1>
          <p className="mt-6 max-w-md text-fluid-base leading-8 text-[#c1cad7]">
            Use your email or username and password to continue your assessment
            journey.
          </p>
        </div>
        <div className="border border-[#c9a34e]/60 bg-[#f7f3e8] p-7 text-[#16243d] shadow-2xl sm:p-10">
          <div className="flex items-center gap-3 border-b border-[#16243d]/15 pb-6">
            <LockKeyhole className="text-[#7d5e1e]" size={20} />
            <div>
              <p className="eyebrow text-[#7d5e1e]">{authCopy.secureAccess}</p>
              <h2 className="display mt-2 text-3xl">
                {mode === "login"
                  ? authCopy.welcome
                  : mode === "register"
                    ? authCopy.create
                    : authCopy.reset}
              </h2>
            </div>
          </div>
          {loading ? (
            <p className="mt-8 text-sm text-[#657084]">{authCopy.checking}</p>
          ) : user ? (
            <div className="mt-8">
              <p className="text-sm leading-7 text-[#4a566a]">
                You are signed in as <strong>{user.email ?? user.name}</strong>.
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
              <form onSubmit={submit} className="mt-8 grid gap-4">
                {mode === "register" && inviteToken && (
                  <div className="border-l-2 border-[#c9a34e] bg-[#16243d]/5 p-3 text-sm text-[#4a566a]">
                    You are joining Profound IQ Consulting as an invited team
                    member. Register with the invited email address to activate
                    your staff access.
                  </div>
                )}
                {mode === "register" && (
                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                    Full name
                    <input
                      required
                      value={name}
                      onChange={event => setName(event.target.value)}
                      className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                    />
                  </label>
                )}
                {mode === "login" && (
                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                    Email or username
                    <input
                      required
                      value={identifier}
                      onChange={event => setIdentifier(event.target.value)}
                      autoComplete="username"
                      className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                    />
                  </label>
                )}
                {mode !== "login" && (
                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                    Email address
                    {mode === "register" && (
                      <span className="font-normal normal-case tracking-normal text-[#657084]">
                        Optional when you use a username; email is recommended
                        for password recovery.
                      </span>
                    )}
                    <input
                      required={mode === "forgot" || mode === "reset"}
                      type="email"
                      value={mode === "forgot" || mode === "reset" ? resetEmail : email}
                      onChange={event => {
                        if (mode === "forgot" || mode === "reset") {
                          setResetEmail(event.target.value);
                        } else {
                          setEmail(event.target.value);
                        }
                      }}
                      autoComplete="email"
                      className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                    />
                  </label>
                )}
                {mode === "register" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                      Phone number{" "}
                      <span className="font-normal normal-case tracking-normal text-[#657084]">
                        Optional profile detail
                      </span>
                      <input
                        value={phone}
                        onChange={event => setPhone(event.target.value)}
                        autoComplete="tel"
                         placeholder="+254..."
                        className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                      />
                    </label>
                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                      Username
                      <input
                        value={username}
                        onChange={event => setUsername(event.target.value)}
                        autoComplete="username"
                        placeholder="your.handle"
                        className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                      />
                    </label>
                  </div>
                )}
                {mode !== "forgot" && (
                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                    Password
                    <span className="font-normal normal-case tracking-normal text-[#657084]">
                      At least 10 characters, including letters and numbers.
                    </span>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                        className="w-full border border-[#16243d]/20 bg-white px-3 py-3 pr-11 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword(value => !value)}
                        className="absolute right-3 top-1/2 -translate-y-0.5 text-[#657084] hover:text-[#7d5e1e]"
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
                        <p className="mt-1 text-[11px] font-normal normal-case tracking-normal text-[#657084]">
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
                    <span className="font-normal normal-case tracking-normal text-[#657084]">
                      Solve {mathA} + {mathB} = ?
                    </span>
                    <input
                      required
                      type="number"
                      inputMode="numeric"
                      value={mathUserAnswer}
                      onChange={event => setMathUserAnswer(event.target.value)}
                      className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                    />
                  </label>
                )}
                {mode === "register" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                        Security question 1
                        <select
                          value={securityQuestion1}
                          onChange={event => setSecurityQuestion1(event.target.value)}
                          className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
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
                          value={securityAnswer1}
                          onChange={event => setSecurityAnswer1(event.target.value)}
                          placeholder="Your answer"
                          autoComplete="off"
                          className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                        Security question 2
                        <select
                          value={securityQuestion2}
                          onChange={event => setSecurityQuestion2(event.target.value)}
                          className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
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
                          value={securityAnswer2}
                          onChange={event => setSecurityAnswer2(event.target.value)}
                          placeholder="Your answer"
                          autoComplete="off"
                          className="border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                        />
                      </label>
                    </div>
                  </>
                )}
                {mode === "reset" && securityQuestions && (
                  <>
                    <div className="border-l-2 border-[#c9a34e] bg-[#16243d]/5 p-3 text-sm text-[#4a566a]">
                      <p className="font-semibold">Question 1: {securityQuestions.question1}</p>
                      <input
                        required
                        value={securityAnswer1}
                        onChange={event => setSecurityAnswer1(event.target.value)}
                        placeholder="Your answer"
                        autoComplete="off"
                        className="mt-2 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#c9a34e]"
                      />
                    </div>
                    <div className="border-l-2 border-[#c9a34e] bg-[#16243d]/5 p-3 text-sm text-[#4a566a]">
                      <p className="font-semibold">Question 2: {securityQuestions.question2}</p>
                      <input
                        required
                        value={securityAnswer2}
                        onChange={event => setSecurityAnswer2(event.target.value)}
                        placeholder="Your answer"
                        autoComplete="off"
                        className="mt-2 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#c9a34e]"
                      />
                    </div>
                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[.1em]">
                      New password
                      <span className="font-normal normal-case tracking-normal text-[#657084]">
                        At least 10 characters, including letters and numbers.
                      </span>
                      <div className="relative">
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={event => setPassword(event.target.value)}
                          autoComplete="new-password"
                          className="w-full border border-[#16243d]/20 bg-white px-3 py-3 pr-11 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#c9a34e]"
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword(value => !value)}
                          className="absolute right-3 top-1/2 -translate-y-0.5 text-[#657084] hover:text-[#7d5e1e]"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>
                  </>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] disabled:opacity-60"
                >
                  {pending && <RefreshCw size={14} className="animate-spin" />}
                  {mode === "login"
                    ? "Sign in"
                    : mode === "register"
                      ? "Create account"
                      : mode === "reset"
                        ? "Reset password"
                        : "Send reset link"}
                  <ArrowRight size={14} />
                </button>
                {formError && (
                  <p
                    role="alert"
                    className="mt-3 border-l-2 border-red-600 bg-red-50 px-3 py-2 text-xs leading-5 text-red-800"
                  >
                    {formError}
                  </p>
                )}
              </form>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (mode === "reset") {
                      setMode("forgot");
                      setSecurityQuestions(null);
                      setSecurityAnswer1("");
                      setSecurityAnswer2("");
                    } else {
                      setMode(mode === "login" ? "register" : "login");
                    }
                  }}
                  className="font-bold text-[#7d5e1e] underline-offset-4 hover:underline"
                >
                  {mode === "login"
                    ? "Create an account"
                    : mode === "reset"
                      ? "Back to email reset"
                      : "Back to sign in"}
                </button>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[#657084] underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
                {mode === "forgot" && (
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-[#657084] underline-offset-4 hover:underline"
                  >
                    Need an account?
                  </button>
                )}
              </div>
            </>
          )}
          <div className="mt-8 border-t border-[#16243d]/15 pt-6 text-xs leading-6 text-[#657084]">
            <p className="flex items-start gap-2">
              <CheckCircle2
                size={15}
                className="mt-0.5 shrink-0 text-[#7d5e1e]"
              />
              Your password is stored as a one-way cryptographic hash.
            </p>
            <p className="mt-3">
              Password reset links are single-use and expire after 30 minutes.
              You can also reset your password by answering your security questions.
            </p>
          </div>
        </div>
      </section>
      <footer className="border-t border-white/10 bg-[#101d35] py-12 text-[#f7f3e8]">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold">Profound IQ Consulting</p>
              <p className="mt-1 text-xs text-[#c1cad7]">Transformational learning for a changing world.</p>
            </div>
            <div className="flex items-center gap-2" aria-label="Social media links">
              <a
                href="https://www.facebook.com/profoundIQ"
                target="_blank"
                rel="noreferrer"
                aria-label="Profound IQ Consulting on Facebook"
                className="inline-flex h-9 w-9 items-center justify-center border border-white/15 text-[#c1cad7] transition-all hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
              >
                <facebook size={16} />
              </a>
              <a
                href="https://x.com/ProfoundIQC"
                target="_blank"
                rel="noreferrer"
                aria-label="Profound IQ Consulting on X"
                className="inline-flex h-9 w-9 items-center justify-center border border-white/15 text-[#c1cad7] transition-all hover:border-white hover:bg-white hover:text-[#101d35]"
              >
                <X size={16} />
              </a>
              <a
                href="https://linkedin.com/company/profoundiqconsulting"
                target="_blank"
                rel="noreferrer"
                aria-label="Profound IQ Consulting on LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center border border-white/15 text-[#c1cad7] transition-all hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
              >
                <linkedin size={16} />
              </a>
              <a
                href="https://www.instagram.com/profoundiqconsulting/"
                target="_blank"
                rel="noreferrer"
                aria-label="Profound IQ Consulting on Instagram"
                className="inline-flex h-9 w-9 items-center justify-center border border-white/15 text-[#c1cad7] transition-all hover:border-[#E4405F] hover:bg-[#E4405F] hover:text-white"
              >
                <instagram size={16} />
              </a>
              <a
                href="https://wa.me/254727374055"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with Profound IQ Consulting on WhatsApp"
                className="inline-flex h-9 w-9 items-center justify-center border border-[#25D366]/60 text-[#d9fbe5] transition-all hover:border-[#25D366] hover:bg-[#25D366]/10"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-5 text-center text-[10px] font-bold uppercase tracking-[.14em] text-[#8f9db3]">
            © 2026 Profound IQ Consulting · Online / Kenya / Global reach
          </div>
        </div>
      </footer>
    </main>
  );
}
