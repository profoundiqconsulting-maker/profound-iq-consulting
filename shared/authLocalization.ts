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

export const authCopy: AuthCopy = {
  privateAccess: "Private / invite only",
  workspace: "Your private workspace.",
  secureAccess: "Your account is secure.",
  welcome: "Welcome back.",
  create: "Create account.",
  reset: "Reset your password.",
  checking: "Checking the account…",
  signIn: "Sign in to continue",
  createAccount: "Create account",
  sendReset: "Send reset link",
  forgot: "Forgot your password?",
  optionalSocial: "Or continue with a social account",
  backToSite: "Back to the site",
};
