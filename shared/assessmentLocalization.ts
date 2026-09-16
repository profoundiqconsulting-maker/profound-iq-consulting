export const supportedAssessmentCopyLocales = [
  "en",
  "sw",
  "fr",
  "es",
  "pt",
  "ar",
  "zh",
  "hi",
  "de",
  "ja",
] as const;

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

const en: AssessmentCopy = {
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

const sw: AssessmentCopy = {
  ...en,
  startOver: "Anza upya",
  saveNow: "Hifadhi sasa",
  previousModule: "Moduli iliyopita",
  nextModule: "Moduli inayofuata",
  submitQuiz: "Wasiliza jaribio",
  reviewSection: "Angalia sehemu",
  preferences: "Mapendeleo ya tathmini",
  lessonProgress: "Maendeleo ya somo",
  saveForLater: "Hifadhi kwa baadaye",
  saved: "Imehifadhiwa",
  progressRestored: "Maendeleo ya tathmini yamefurushwa",
  progressRestoredDescription:
    "Maendeleo yako yaliyohifadhiwa kwenye simu yako yako tayari kuendelea.",
  saving: "Kuna hifadhi jibu…",
  allChangesSaved: "Mabadiliko yote yamehifadhiwa",
  saveFailed: "Hifadhi imeshindwa — jaribu tena",
  autoSaveHint: "Mabadiliko huhifadhiwa kiotomatiki",
  moduleCompleted: "Moduli imekamilika — endelea kujenga",
  moduleCompletedDescription: "Swali lako lifuatao ni tayari.",
  nextQuestionReady: "Swali lifuatao ni tayari",
  accessReport: "Ripoti ya ufikiaji",
  certificatePdf: "Cheti cha PDF",
  certificatePdfPreparing: "Kunaanda PDF…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "Cheti cha PDF kimetolewa",
  certificatePdfUnavailable: "Kumbukumbu ya malipo haipatikani",
  certificatePreview: "Muhtasari wa cheti",
  certificatePreviewDescription:
    "Angalia cheti chako kilichobeba kabla ya kudownload.",
  closePreview: "Funga muhtasari",
  previewCertificate: "Muhtasari wa cheti",
};

const fr: AssessmentCopy = {
  ...en,
  startOver: "Recommencer",
  saveNow: "Enregistrer",
  previousModule: "Module précédent",
  nextModule: "Module suivant",
  submitQuiz: "Soumettre le quiz",
  reviewSection: "Vérifier la section",
  preferences: "Préférences d'évaluation",
  lessonProgress: "Progression de la leçon",
  saveForLater: "Enregistrer pour plus tard",
  saved: "Enregistré",
  progressRestored: "Progression d'évaluation restaurée",
  progressRestoredDescription:
    "Votre progression enregistrée localement est prête à être poursuivie.",
  saving: "Enregistrement de la réponse…",
  allChangesSaved: "Toutes les modifications enregistrées",
  saveFailed: "Échec de l'enregistrement — réessayez",
  autoSaveHint: "Les modifications s'enregistrent automatiquement",
  moduleCompleted: "Module terminé — continuez",
  moduleCompletedDescription: "Votre prochaine question est prête.",
  nextQuestionReady: "Prochaine question prête",
  accessReport: "Rapport d'accès",
  certificatePdf: "Certificat PDF",
  certificatePdfPreparing: "Préparation du PDF…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "Certificat PDF téléchargé",
  certificatePdfUnavailable: "Référence de paiement non disponible",
  certificatePreview: "Aperçu du certificat",
  certificatePreviewDescription:
    "Vérifiez votre certificat avant de le télécharger.",
  closePreview: "Fermer l'aperçu",
  previewCertificate: "Aperçu du certificat",
};

const es: AssessmentCopy = {
  ...en,
  startOver: "Empezar de nuevo",
  saveNow: "Guardar ahora",
  previousModule: "Módulo anterior",
  nextModule: "Módulo siguiente",
  submitQuiz: "Enviar prueba",
  reviewSection: "Revisar sección",
  preferences: "Preferencias de evaluación",
  lessonProgress: "Progreso de la lección",
  saveForLater: "Guardar para más tarde",
  saved: "Guardado",
  progressRestored: "Progreso de evaluación restaurado",
  progressRestoredDescription:
    "Su progreso guardado localmente está listo para continuar.",
  saving: "Guardando respuesta…",
  allChangesSaved: "Todos los cambios guardados",
  saveFailed: "Error al guardar — intente de nuevo",
  autoSaveHint: "Los cambios se guardan automáticamente",
  moduleCompleted: "Módulo completado — siga adelante",
  moduleCompletedDescription: "Su próxima pregunta está lista.",
  nextQuestionReady: "Próxima pregunta lista",
  accessReport: "Informe de acceso",
  certificatePdf: "Certificado PDF",
  certificatePdfPreparing: "Preparando PDF…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "Certificado PDF descargado",
  certificatePdfUnavailable: "Referencia de pago no disponible",
  certificatePreview: "Vista previa del certificado",
  certificatePreviewDescription:
    "Revise su certificado antes de descargarlo.",
  closePreview: "Cerrar vista previa",
  previewCertificate: "Vista previa del certificado",
};

const pt: AssessmentCopy = {
  ...en,
  startOver: "Recomeçar",
  saveNow: "Salvar agora",
  previousModule: "Módulo anterior",
  nextModule: "Próximo módulo",
  submitQuiz: "Enviar questionário",
  reviewSection: "Revisar seção",
  preferences: "Preferências da avaliação",
  lessonProgress: "Progresso da lição",
  saveForLater: "Salvar para mais tarde",
  saved: "Salvo",
  progressRestored: "Progresso da avaliação restaurado",
  progressRestoredDescription:
    "Seu progresso salvo localmente está pronto para continuar.",
  saving: "Salvando resposta…",
  allChangesSaved: "Todas as alterações salvas",
  saveFailed: "Falha ao salvar — tente novamente",
  autoSaveHint: "As alterações são salvas automaticamente",
  moduleCompleted: "Módulo concluído — continue",
  moduleCompletedDescription: "Sua próxima pergunta está pronta.",
  nextQuestionReady: "Próxima pergunta pronta",
  accessReport: "Relatório de acesso",
  certificatePdf: "Certificado PDF",
  certificatePdfPreparing: "Preparando PDF…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "Certificado PDF baixado",
  certificatePdfUnavailable: "Referência de pagamento indisponível",
  certificatePreview: "Prévia do certificado",
  certificatePreviewDescription:
    "Revise seu certificado antes de baixar.",
  closePreview: "Fechar prévia",
  previewCertificate: "Prévia do certificado",
};

const ar: AssessmentCopy = {
  ...en,
  startOver: "ابدأ من جديد",
  saveNow: "حفظ الآن",
  previousModule: "الوحدة السابقة",
  nextModule: "الوحدة التالية",
  submitQuiz: "إرسال الاختبار",
  reviewSection: "مراجعة القسم",
  preferences: "تفضيلات التقييم",
  lessonProgress: "تقدم الدرس",
  saveForLater: "حفظ لاحقاً",
  saved: "تم الحفظ",
  progressRestored: "تم استعادة تقدم التقييم",
  progressRestoredDescription:
    "تقدمك المحفوظ محلياً جاهز للمتابعة.",
  saving: "جاري حفظ الإجابة…",
  allChangesSaved: "تم حفظ جميع التغييرات",
  saveFailed: "فشل الحفظ — حاول مرة أخرى",
  autoSaveHint: "التغييرات تحفظ تلقائياً",
  moduleCompleted: "اكتملت الوحدة — استمر",
  moduleCompletedDescription: "سؤالك التالي جاهز.",
  nextQuestionReady: "السؤال التالي جاهز",
  accessReport: "تقرير الوصول",
  certificatePdf: "شهادة PDF",
  certificatePdfPreparing: "جاري إعداد PDF…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "تم تنزيل شهادة PDF",
  certificatePdfUnavailable: "مرجع الدفع غير متاح",
  certificatePreview: "معاينة الشهادة",
  certificatePreviewDescription:
    "راجع شهادتك قبل التنزيل.",
  closePreview: "إغلاق المعاينة",
  previewCertificate: "معاينة الشهادة",
};

const zh: AssessmentCopy = {
  ...en,
  startOver: "重新开始",
  saveNow: "立即保存",
  previousModule: "上一模块",
  nextModule: "下一模块",
  submitQuiz: "提交测验",
  reviewSection: "复习部分",
  preferences: "评估偏好",
  lessonProgress: "课程进度",
  saveForLater: "保存以备后用",
  saved: "已保存",
  progressRestored: "评估进度已恢复",
  progressRestoredDescription:
    "您本地保存的进度已准备好继续。",
  saving: "正在保存答案…",
  allChangesSaved: "所有更改已保存",
  saveFailed: "保存失败 — 请重试",
  autoSaveHint: "更改自动保存",
  moduleCompleted: "模块完成 — 继续学习",
  moduleCompletedDescription: "您的下一个问题已准备好。",
  nextQuestionReady: "下一个问题已准备好",
  accessReport: "访问报告",
  certificatePdf: "PDF 证书",
  certificatePdfPreparing: "正在准备 PDF…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "PDF 证书已下载",
  certificatePdfUnavailable: "付款参考不可用",
  certificatePreview: "证书预览",
  certificatePreviewDescription:
    "下载前查看您的证书。",
  closePreview: "关闭预览",
  previewCertificate: "预览证书",
};

const hi: AssessmentCopy = {
  ...en,
  startOver: "फिर से शुरू करें",
  saveNow: "अभी सहेजें",
  previousModule: "पिछला मॉड्यूल",
  nextModule: "अगला मॉड्यूल",
  submitQuiz: "क्विज जमा करें",
  reviewSection: " अनुभाग की समीक्षा करें",
  preferences: "मूल्यांकन प्राथमिकताएँ",
  lessonProgress: "पाठ की प्रगति",
  saveForLater: "बाद के लिए सहेजें",
  saved: "सहेजा गया",
  progressRestored: "मूल्यांकन प्रगति पुनर्स्थापित",
  progressRestoredDescription:
    "स्थानीय रूप से सहेजी गई आपकी प्रगति जारी रखने के लिए तैयार है।",
  saving: "उत्तर सहेज रहे हैं…",
  allChangesSaved: "सभी बदलाव सहेजे गए",
  saveFailed: "सहेजने में विफल — पुनः प्रयास करें",
  autoSaveHint: "बदलाव स्वचालित रूप से सहेजे जाते हैं",
  moduleCompleted: "मॉड्यूल पूर्ण — आगे बढ़ें",
  moduleCompletedDescription: "आपका अगला सवाल तैयार है।",
  nextQuestionReady: "अगला सवाल तैयार",
  accessReport: "पहुंच रिपोर्ट",
  certificatePdf: "PDF प्रमाणपत्र",
  certificatePdfPreparing: "PDF तैयार कर रहे हैं…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "PDF प्रमाणपत्र डाउनलोड किया गया",
  certificatePdfUnavailable: "भुगतान संदर्भ अनुपलब्ध",
  certificatePreview: "प्रमाणपत्र पूर्वावलोकन",
  certificatePreviewDescription:
    "डाउनलोड करने से पहले अपने प्रमाणपत्र की समीक्षा करें।",
  closePreview: "पूर्वावलोकन बंद करें",
  previewCertificate: "प्रमाणपत्र पूर्वावलोकन",
};

const de: AssessmentCopy = {
  ...en,
  startOver: "Neu starten",
  saveNow: "Jetzt speichern",
  previousModule: "Vorheriges Modul",
  nextModule: "Nächstes Modul",
  submitQuiz: "Quiz absenden",
  reviewSection: "Abschnitt überprüfen",
  preferences: "Bewertungspräferenzen",
  lessonProgress: "Lektionsfortschritt",
  saveForLater: "Für später speichern",
  saved: "Gespeichert",
  progressRestored: "Bewertungsfortschritt wiederhergestellt",
  progressRestoredDescription:
    "Ihr lokal gespeicherter Fortschritt ist bereit zum Fortfahren.",
  saving: "Antwort wird gespeichert…",
  allChangesSaved: "Alle Änderungen gespeichert",
  saveFailed: "Speichern fehlgeschlagen — versuchen Sie es erneut",
  autoSaveHint: "Änderungen werden automatisch gespeichert",
  moduleCompleted: "Modul abgeschlossen — weiter so",
  moduleCompletedDescription: "Ihre nächste Frage ist bereit.",
  nextQuestionReady: "Nächste Frage bereit",
  accessReport: "Zugriffsbericht",
  certificatePdf: "PDF-Zertifikat",
  certificatePdfPreparing: "PDF wird vorbereitet…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "PDF-Zertifikat heruntergeladen",
  certificatePdfUnavailable: "Zahlungsreferenz nicht verfügbar",
  certificatePreview: "Zertifikatsvorschau",
  certificatePreviewDescription:
    "Überprüfen Sie Ihr Zertifikat vor dem Download.",
  closePreview: "Vorschau schließen",
  previewCertificate: "Zertifikatsvorschau",
};

const ja: AssessmentCopy = {
  ...en,
  startOver: "最初からやり直す",
  saveNow: "今すぐ保存",
  previousModule: "前のモジュール",
  nextModule: "次のモジュール",
  submitQuiz: "クイズを提出",
  reviewSection: "セクションを確認",
  preferences: "評価設定",
  lessonProgress: "レッスンの進捗",
  saveForLater: "後で保存",
  saved: "保存済み",
  progressRestored: "評価の進捗が復元されました",
  progressRestoredDescription:
    "ローカルに保存された進捗が続行する準備ができました。",
  saving: "回答を保存中…",
  allChangesSaved: "すべての変更が保存されました",
  saveFailed: "保存に失敗 — 再試行してください",
  autoSaveHint: "変更は自動的に保存されます",
  moduleCompleted: "モジュール完了 — 続けてください",
  moduleCompletedDescription: "次の質問の準備ができました。",
  nextQuestionReady: "次の質問の準備ができました",
  accessReport: "アクセスレポート",
  certificatePdf: "PDF証明書",
  certificatePdfPreparing: "PDFを準備中…",
  certificateSvg: "SVG",
  certificatePdfDownloaded: "PDF証明書をダウンロードしました",
  certificatePdfUnavailable: "支払い参照が利用できません",
  certificatePreview: "証明書のプレビュー",
  certificatePreviewDescription:
    "ダウンロードする前に証明書を確認してください。",
  closePreview: "プレビューを閉じる",
  previewCertificate: "証明書のプレビュー",
};

const localeCopies: Record<string, AssessmentCopy> = {
  en,
  sw,
  fr,
  es,
  pt,
  ar,
  zh,
  hi,
  de,
  ja,
};

export function getAssessmentCopy(locale: string): AssessmentCopy {
  return localeCopies[locale] ?? en;
}
