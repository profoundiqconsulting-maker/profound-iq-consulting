import { createContext, useContext, type ReactNode } from "react";

const english = {
  language: "Language",
  selectLanguage: "Select language",
  paymentHistoryUnavailable:
    "Payment history is temporarily unavailable. Please try again.",
  paymentHistoryPagination: "Payment history pages",
  pageOfPages: "Page {page} of {pages}",
  previousPage: "Previous",
  nextPage: "Next",
  loadingPaymentHistory: "Loading payment history…",
  backToSite: "Back to site",
  approach: "Approach",
  offerings: "Offerings",
  courses: "Courses",
  myIllustrations: "My Illustrations",
  myIllustrationsDescription:
    "Your saved visual study cards from every course.",
  noIllustrations: "No illustrations saved yet.",
  savedAcrossCourses: "Saved across your courses",
  viewIllustration: "View illustration",
  zoomArtwork: "Zoom artwork",
  downloadStudySheet: "Download study sheet",
  openLesson: "Open lesson",
  removeBookmark: "Remove bookmark",
  illustrationMode: "Illustration mode",
  selfAssessment: "Self Assessment",
  selfAssessmentReports: "Assessment Reports",
  psychometrics: "Psychometrics",
  psychometricReports: "Psychometric Reports",
  contact: "Contact",
  beginConversation: "Begin a conversation",
  myWorkspace: "My workspace",
  orientation: "Orientation",
  clarityIs: "Clarity is",
  aCapability: "a capability.",
  heroDescription:
    "Profound IQ Consulting helps people and organizations move from raw potential to purposeful impact—through learning that changes how you think, lead, and act.",
  takeAssessment: "Take the KES 399 assessment",
  careerPath: "CareerPath",
  careerPathReports: "CareerPath Reports",
  exploreTheWork: "Explore the work",
  talkToUs: "Talk to us",
  transformationalLearning: "Transformational learning",
  professionalInsight: "Professional insight",
  learnerDirection: "Learner direction",
  direction: "Direction",
  development: "Development",
  insight: "Insight",
  evidence: "Evidence",
  educationalConsulting: "Educational consulting",
  professionalCourses: "Professional courses",
  psychometricTesting: "Psychometric testing",
  researchSurveys: "Research surveys",
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  whatsappSupport: "WhatsApp support",
  alwaysOnline: "Always online",
  yourPrivacyChoices: "Your privacy choices",
  clearerWay: "A clearer way to use cookies.",
  cookieDescription:
    "We use essential browser storage to keep the site secure and remember progress. Optional analytics help us understand journeys such as course sharing and assessment starts.",
  acceptAll: "Accept all",
  customize: "Customize",
  savePreferences: "Save preferences",
  essentialCookies: "Essential cookies",
  analyticsCookies: "Analytics cookies",
  alwaysActive: "Always active",
  optional: "Optional",
  close: "Close",
  effectiveDate: "Effective date",
  questionsOrRequests: "Questions or requests?",
  submitEnrollment: "Submit enrollment interest",
  yourName: "Your name",
  emailAddress: "Email address",
  selectedCourse: "Selected course",
  recording: "Recording…",
  enrollmentRecorded: "Your interest is recorded.",
  readMore: "Read more",
  viewCourses: "View courses",
  worldwide: "Worldwide",
  enrollNow: "Enroll now",
  openSyllabus: "Open syllabus",
  details: "Details",
  payment: "Payment",
  access: "Access",
  searchCourses: "Search courses, topics, or outcomes",
  allCategories: "All categories",
  clearFilters: "Clear filters",
  noCourseMatch:
    "No courses match that search. Try a broader term or reset the filters.",
  discussItem: "Discuss item",
  overview: "Overview",
  certificates: "My Certificates",
  adminObservatory: "Admin observatory",
  staffWorkspace: "Staff workspace",
  settings: "Settings",
  navigation: "Navigation",
  enrolledCourses: "Enrolled Courses",
  signInToContinue: "Sign in to continue",
  signIn: "Sign in",
  signOut: "Sign out",
  suggestTranslation: "Suggest a translation improvement",
  suggestTranslationShort: "Suggest a fix",
  translationFeedbackEyebrow: "Help us improve",
  translationFeedbackTitle: "Suggest a better translation.",
  translationFeedbackDescription:
    "Tell us which wording could be clearer. We'll review your suggestion and use it to improve the experience.",
  currentLanguage: "Current language",
  pageContext: "Page",
  sourceText: "Source text",
  sourceTextPlaceholder: "Paste the wording you would like us to review",
  suggestedCorrection: "Suggested correction",
  suggestedCorrectionPlaceholder: "Write the clearer translation you recommend",
  quickCheck: "Quick check:",
  translationFeedbackPrivacy:
    "Your suggestion is sent to our team with the current page and language so we can review it in context.",
  sendSuggestion: "Send suggestion",
  sending: "Sending…",
  translationFeedbackThanks:
    "Thank you — your translation suggestion was sent.",
  translationFeedbackError:
    "We could not send that suggestion. Please try again.",
  translationFeedbackCheckError: "Please solve the quick check correctly.",
  connectedAccount: "Connected account",
  googleAccountConnected: "Google account connected",
  providerAccountConnected: "account connected",
  emailPasswordAccount: "Email and password account",
  googleAccountDescription:
    "Your Google profile email and picture are used for secure sign-in. You can hide the picture below without disconnecting the account.",
  currentSignInMethodDescription:
    "Your current sign-in method is shown here for account clarity.",
  preferredLanguage: "Preferred language",
  preferredLanguageDescription:
    "Saved on this device and applied across your workspace.",
  languageUpdated: "Preferred language updated",
  languageUpdatedDescription:
    "Your language preference is now active across the workspace.",
  enrollmentStatus: "Course enrollment status",
  recentPayments: "Recent staged payments",
  noEnrollments: "No course enrollments yet.",
  paymentPending: "Payment pending",
  paymentPaid: "Paid",
  paymentStage: "Stage",
  paymentHistoryDescription:
    "Review your active courses and the staged payments attached to each enrollment.",
  mockCheckout: "Mock checkout",
  mockCheckoutDescription:
    "Development-only QA mode. This simulates a successful first installment without charging Paystack.",
  simulatePayment: "Simulate first payment",
  mockPaymentSuccess: "Mock first payment completed",
  paymentHistoryShortcut: "Payment history",
  paymentHistoryShortcutDescription: "View enrollments and staged payments",
  filterByCourse: "Filter by course",
  filterByStage: "Filter by stage",
  filterByStatus: "Filter by status",
  allCourses: "All courses",
  allStages: "All stages",
  allStatuses: "All statuses",
  fromDate: "From date",
  toDate: "To date",
  sortTransactions: "Sort transactions",
  newestFirst: "Newest first",
  oldestFirst: "Oldest first",
  amountHighToLow: "Amount: high to low",
  amountLowToHigh: "Amount: low to high",
  courseAtoZ: "Course: A–Z",
  stageOrder: "Stage order",
  statusOrder: "Status",
  showingTransactions: "Showing {count} of {total} transactions",
  filteredTransactions: "Matching transactions",
  paidTotal: "Paid total",
  pendingTotal: "Pending total",
  noPaymentMatch: "No payments match these filters.",
  course: "Course",
  amount: "Amount",
  status: "Status",
  transactionDate: "Transaction date",
  reference: "Reference",
  notAvailable: "Not available",
} as const;

type TranslationKey = keyof typeof english;

const LocaleContext = createContext<{
  locale: "en";
  setLocale: (locale: "en") => void;
  t: (key: TranslationKey) => string;
  localeInfo: { code: "en"; label: "English"; nativeLabel: "English"; dir: "ltr" };
}>({
  locale: "en",
  setLocale: () => undefined,
  t: key => english[key],
  localeInfo: { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  return (
    <LocaleContext.Provider
      value={{
        locale: "en" as const,
        setLocale: () => undefined,
        t: (key: TranslationKey) => english[key],
        localeInfo: { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function isSupportedLocale(value: string): value is "en" {
  return value === "en";
}

export function getLocaleDirection(): "ltr" {
  return "ltr";
}

export function getLocalizedTranslation(key: TranslationKey): string {
  return english[key];
}

export function detectLocaleFromPreferences(): "en" {
  return "en";
}

export type { TranslationKey };
export const LOCALE_STORAGE_KEY = "profound-iq-locale";
export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
] as const;
export type LocaleCode = "en";