export type PsychometricWorkflowCopy = {
  progress: string;
  previous: string;
  next: string;
  reviewAndPay: string;
  beforeYouBegin: string;
  secureCheckout: string;
  fullName: string;
  emailAddress: string;
  consent: string;
  generateProfile: string;
};

export const psychometricWorkflowCopy: PsychometricWorkflowCopy = {
  progress: "Progress",
  previous: "Previous",
  next: "Next",
  reviewAndPay: "Review & pay",
  beforeYouBegin: "Before you begin",
  secureCheckout: "Secure checkout",
  fullName: "Full name",
  emailAddress: "Email address",
  consent:
    "I consent to Profound IQ Consulting processing my responses to generate and deliver this educational profile. I understand it is not a clinical or employment diagnosis.",
  generateProfile: "and generate profile",
};

export function getPsychometricWorkflowCopy(
  _locale?: string
): PsychometricWorkflowCopy {
  return psychometricWorkflowCopy;
}