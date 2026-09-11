export type AssessmentCopy = {
  startOver: string;
  saveNow: string;
  previousModule: string;
  nextModule: string;
  submitQuiz: string;
  reviewSection: string;
  preferences: string;
  lessonProgress: string;
  saveForLater: string;
  saved: string;
  progressRestored: string;
  progressRestoredDescription: string;
  saving: string;
  allChangesSaved: string;
  saveFailed: string;
  autoSaveHint: string;
  moduleCompleted: string;
  moduleCompletedDescription: string;
  nextQuestionReady: string;
  accessReport: string;
  certificatePdf: string;
  certificatePdfPreparing: string;
  certificateSvg: string;
  certificatePdfDownloaded: string;
  certificatePdfUnavailable: string;
  certificatePreview: string;
  certificatePreviewDescription: string;
  closePreview: string;
  previewCertificate: string;
};

export const assessmentCopy: AssessmentCopy = {
  startOver: "Start over",
  saveNow: "Save now",
  previousModule: "Previous module",
  nextModule: "Next module",
  submitQuiz: "Submit quiz",
  reviewSection: "Review section",
  preferences: "Assessment preferences",
  lessonProgress: "Lesson progress",
  saveForLater: "Save for later",
  saved: "Saved",
  progressRestored: "Assessment progress restored",
  progressRestoredDescription:
    "Your locally saved progress is ready to continue.",
  saving: "Saving response…",
  allChangesSaved: "All changes saved",
  saveFailed: "Save failed — try again",
  autoSaveHint: "Changes save automatically",
  moduleCompleted: "Module complete — keep building",
  moduleCompletedDescription: "Your next question is ready.",
  nextQuestionReady: "Next question ready",
  accessReport: "Access report",
  certificatePdf: "PDF certificate",
  certificatePdfPreparing: "Preparing PDF…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "Branded PDF certificate downloaded",
  certificatePdfUnavailable: "Paid report reference unavailable",
  certificatePreview: "Certificate preview",
  certificatePreviewDescription:
    "Review your branded certificate before downloading.",
  closePreview: "Close preview",
  previewCertificate: "Preview certificate",
};

export function getAssessmentCopy(_locale?: string): AssessmentCopy {
  return assessmentCopy;
}