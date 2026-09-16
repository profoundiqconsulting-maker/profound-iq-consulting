export type AuthCopy = {
  privateAccess: string;
  workspace: string;
  secureAccess: string;
  welcome: string;
  create: string;
  reset: string;
  checking: string;
  signIn: string;
  createAccount: string;
  sendReset: string;
  forgot: string;
  optionalSocial: string;
  backToSite: string;
};

const en: AuthCopy = {
  privateAccess: "Private access / your next chapter",
  workspace: "Enter your workspace.",
  secureAccess: "Secure account access",
  welcome: "Welcome back.",
  create: "Create your account.",
  reset: "Reset your password.",
  checking: "Checking your session…",
  signIn: "Sign in",
  createAccount: "Create account",
  sendReset: "Send reset link",
  forgot: "Forgot password?",
  optionalSocial: "Optional social sign-in",
  backToSite: "Back to site",
};

const ar: AuthCopy = {
  ...en,
  privateAccess: "وصول خاص / فصلتك القادمة",
  workspace: "أدخل مساحة العمل الخاصة بك.",
  secureAccess: "دخول آمن إلى الحساب",
  welcome: "مرحباً بعودتك.",
  create: "أنشئ حسابك.",
  reset: "إعادة تعيين كلمة المرور.",
  checking: "جاري التحقق من جلستك…",
  signIn: "تسجيل الدخول",
  createAccount: "إنشاء حساب",
  sendReset: "إرسال رابط إعادة التعيين",
  forgot: "نسيت كلمة المرور؟",
  optionalSocial: "تسجيل دخول اجتماعي اختياري",
  backToSite: "العودة إلى الموقع",
};

const localeCopies: Record<string, AuthCopy> = {
  en,
  ar,
};

export function getAuthCopy(locale?: string): AuthCopy {
  return localeCopies[locale ?? "en"] ?? en;
}
