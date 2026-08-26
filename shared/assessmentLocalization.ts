export type AssessmentCopy = {
  startOver: string;
  saveNow: string;
  previousModule: string;
  nextModule: string;
  submitQuiz: string;
  reviewSection: string;
  preferences: string;
  progressRestored: string;
  progressRestoredDescription: string;
};

const copy: Record<string, AssessmentCopy> = {
  en: { startOver: "Start over", saveNow: "Save now", previousModule: "Previous module", nextModule: "Next module", submitQuiz: "Submit quiz", reviewSection: "Review section", preferences: "Assessment preferences", progressRestored: "Assessment progress restored", progressRestoredDescription: "Your locally saved progress is ready to continue." },
  sw: { startOver: "Anza upya", saveNow: "Hifadhi sasa", previousModule: "Moduli iliyotangulia", nextModule: "Moduli inayofuata", submitQuiz: "Wasilisha jaribio", reviewSection: "Kagua sehemu", preferences: "Mapendeleo ya tathmini", progressRestored: "Maendeleo ya tathmini yamerejeshwa", progressRestoredDescription: "Maendeleo yako yaliyohifadhiwa kwenye kifaa yako tayari kuendelea." },
  fr: { startOver: "Recommencer", saveNow: "Enregistrer", previousModule: "Module précédent", nextModule: "Module suivant", submitQuiz: "Envoyer le quiz", reviewSection: "Revoir la section", preferences: "Préférences de l’évaluation", progressRestored: "Progression restaurée", progressRestoredDescription: "Votre progression enregistrée localement est prête à continuer." },
  es: { startOver: "Empezar de nuevo", saveNow: "Guardar ahora", previousModule: "Módulo anterior", nextModule: "Módulo siguiente", submitQuiz: "Enviar cuestionario", reviewSection: "Revisar sección", preferences: "Preferencias de evaluación", progressRestored: "Progreso restaurado", progressRestoredDescription: "Tu progreso guardado localmente está listo para continuar." },
  pt: { startOver: "Recomeçar", saveNow: "Guardar agora", previousModule: "Módulo anterior", nextModule: "Módulo seguinte", submitQuiz: "Enviar questionário", reviewSection: "Rever secção", preferences: "Preferências da avaliação", progressRestored: "Progresso restaurado", progressRestoredDescription: "O seu progresso guardado localmente está pronto para continuar." },
  ar: { startOver: "البدء من جديد", saveNow: "حفظ الآن", previousModule: "الوحدة السابقة", nextModule: "الوحدة التالية", submitQuiz: "إرسال الاختبار", reviewSection: "مراجعة القسم", preferences: "تفضيلات التقييم", progressRestored: "تمت استعادة تقدم التقييم", progressRestoredDescription: "تقدمك المحفوظ محليًا جاهز للمتابعة." },
  zh: { startOver: "重新开始", saveNow: "立即保存", previousModule: "上一模块", nextModule: "下一模块", submitQuiz: "提交测验", reviewSection: "查看部分", preferences: "评估偏好", progressRestored: "评估进度已恢复", progressRestoredDescription: "您本地保存的进度已准备好继续。" },
  hi: { startOver: "फिर से शुरू करें", saveNow: "अभी सहेजें", previousModule: "पिछला मॉड्यूल", nextModule: "अगला मॉड्यूल", submitQuiz: "क्विज़ जमा करें", reviewSection: "अनुभाग की समीक्षा करें", preferences: "मूल्यांकन प्राथमिकताएँ", progressRestored: "मूल्यांकन प्रगति पुनर्स्थापित", progressRestoredDescription: "आपकी स्थानीय रूप से सहेजी गई प्रगति जारी रखने के लिए तैयार है।" },
  de: { startOver: "Neu beginnen", saveNow: "Jetzt speichern", previousModule: "Vorheriges Modul", nextModule: "Nächstes Modul", submitQuiz: "Quiz senden", reviewSection: "Abschnitt prüfen", preferences: "Bewertungseinstellungen", progressRestored: "Bewertungsfortschritt wiederhergestellt", progressRestoredDescription: "Ihr lokal gespeicherter Fortschritt kann fortgesetzt werden." },
  ja: { startOver: "最初から", saveNow: "今すぐ保存", previousModule: "前のモジュール", nextModule: "次のモジュール", submitQuiz: "クイズを送信", reviewSection: "セクションを確認", preferences: "評価設定", progressRestored: "評価の進捗を復元しました", progressRestoredDescription: "ローカルに保存された進捗を続行できます。" },
};

export function getAssessmentCopy(locale: string): AssessmentCopy {
  return copy[locale] ?? copy.en;
}

export const supportedAssessmentCopyLocales = Object.keys(copy);
