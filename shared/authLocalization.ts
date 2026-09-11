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
};

export const authCopy: AuthCopy = {
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
};

export function getAuthCopy(_locale?: string): AuthCopy {
  return authCopy;
}