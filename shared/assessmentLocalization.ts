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
};

const copy: Record<string, AssessmentCopy> = {
  en: { startOver: "Start over", saveNow: "Save now", previousModule: "Previous module", nextModule: "Next module", submitQuiz: "Submit quiz", reviewSection: "Review section", preferences: "Assessment preferences", lessonProgress: "Lesson progress", saveForLater: "Save for later", saved: "Saved", progressRestored: "Assessment progress restored", progressRestoredDescription: "Your locally saved progress is ready to continue.", saving: "Saving response…", allChangesSaved: "All changes saved", saveFailed: "Save failed — try again", autoSaveHint: "Changes save automatically" },
  sw: { startOver: "Anza upya", saveNow: "Hifadhi sasa", previousModule: "Moduli iliyotangulia", nextModule: "Moduli inayofuata", submitQuiz: "Wasilisha jaribio", reviewSection: "Kagua sehemu", preferences: "Mapendeleo ya tathmini", lessonProgress: "Maendeleo ya somo", saveForLater: "Hifadhi baadaye", saved: "Imehifadhiwa", progressRestored: "Maendeleo ya tathmini yamerejeshwa", progressRestoredDescription: "Maendeleo yako yaliyohifadhiwa kwenye kifaa yako tayari kuendelea.", saving: "Inahifadhi jibu…", allChangesSaved: "Mabadiliko yote yamehifadhiwa", saveFailed: "Hifadhi imeshindikana — jaribu tena", autoSaveHint: "Mabadiliko huhifadhiwa kiotomatiki" },
  fr: { startOver: "Recommencer", saveNow: "Enregistrer", previousModule: "Module précédent", nextModule: "Module suivant", submitQuiz: "Envoyer le quiz", reviewSection: "Revoir la section", preferences: "Préférences de l’évaluation", lessonProgress: "Progression de la leçon", saveForLater: "Enregistrer pour plus tard", saved: "Enregistré", progressRestored: "Progression restaurée", progressRestoredDescription: "Votre progression enregistrée localement est prête à continuer.", saving: "Enregistrement de la réponse…", allChangesSaved: "Toutes les modifications sont enregistrées", saveFailed: "Échec de l’enregistrement — réessayez", autoSaveHint: "Les modifications sont enregistrées automatiquement" },
  es: { startOver: "Empezar de nuevo", saveNow: "Guardar ahora", previousModule: "Módulo anterior", nextModule: "Módulo siguiente", submitQuiz: "Enviar cuestionario", reviewSection: "Revisar sección", preferences: "Preferencias de evaluación", lessonProgress: "Progreso de la lección", saveForLater: "Guardar para después", saved: "Guardado", progressRestored: "Progreso restaurado", progressRestoredDescription: "Tu progreso guardado localmente está listo para continuar.", saving: "Guardando respuesta…", allChangesSaved: "Todos los cambios están guardados", saveFailed: "No se pudo guardar — inténtalo de nuevo", autoSaveHint: "Los cambios se guardan automáticamente" },
  pt: { startOver: "Recomeçar", saveNow: "Guardar agora", previousModule: "Módulo anterior", nextModule: "Módulo seguinte", submitQuiz: "Enviar questionário", reviewSection: "Rever secção", preferences: "Preferências da avaliação", lessonProgress: "Progresso da lição", saveForLater: "Guardar para mais tarde", saved: "Guardado", progressRestored: "Progresso restaurado", progressRestoredDescription: "O seu progresso guardado localmente está pronto para continuar.", saving: "A guardar resposta…", allChangesSaved: "Todas as alterações foram guardadas", saveFailed: "Falha ao guardar — tente novamente", autoSaveHint: "As alterações são guardadas automaticamente" },
  ar: { startOver: "البدء من جديد", saveNow: "حفظ الآن", previousModule: "الوحدة السابقة", nextModule: "الوحدة التالية", submitQuiz: "إرسال الاختبار", reviewSection: "مراجعة القسم", preferences: "تفضيلات التقييم", lessonProgress: "تقدم الدرس", saveForLater: "حفظ لوقت لاحق", saved: "تم الحفظ", progressRestored: "تمت استعادة تقدم التقييم", progressRestoredDescription: "تقدمك المحفوظ محليًا جاهز للمتابعة.", saving: "جارٍ حفظ الإجابة…", allChangesSaved: "تم حفظ جميع التغييرات", saveFailed: "تعذر الحفظ — حاول مرة أخرى", autoSaveHint: "تُحفظ التغييرات تلقائيًا" },
  zh: { startOver: "重新开始", saveNow: "立即保存", previousModule: "上一模块", nextModule: "下一模块", submitQuiz: "提交测验", reviewSection: "查看部分", preferences: "评估偏好", lessonProgress: "课程进度", saveForLater: "稍后保存", saved: "已保存", progressRestored: "评估进度已恢复", progressRestoredDescription: "您本地保存的进度已准备好继续。", saving: "正在保存回答…", allChangesSaved: "所有更改已保存", saveFailed: "保存失败 — 请重试", autoSaveHint: "更改会自动保存" },
  hi: { startOver: "फिर से शुरू करें", saveNow: "अभी सहेजें", previousModule: "पिछला मॉड्यूल", nextModule: "अगला मॉड्यूल", submitQuiz: "क्विज़ जमा करें", reviewSection: "अनुभाग की समीक्षा करें", preferences: "मूल्यांकन प्राथमिकताएँ", lessonProgress: "पाठ की प्रगति", saveForLater: "बाद के लिए सहेजें", saved: "सहेजा गया", progressRestored: "मूल्यांकन प्रगति पुनर्स्थापित", progressRestoredDescription: "आपकी स्थानीय रूप से सहेजी गई प्रगति जारी रखने के लिए तैयार है।", saving: "उत्तर सहेजा जा रहा है…", allChangesSaved: "सभी बदलाव सहेजे गए", saveFailed: "सहेजना विफल — फिर प्रयास करें", autoSaveHint: "बदलाव अपने आप सहेजे जाते हैं" },
  de: { startOver: "Neu beginnen", saveNow: "Jetzt speichern", previousModule: "Vorheriges Modul", nextModule: "Nächstes Modul", submitQuiz: "Quiz senden", reviewSection: "Abschnitt prüfen", preferences: "Bewertungseinstellungen", lessonProgress: "Lektionsfortschritt", saveForLater: "Für später speichern", saved: "Gespeichert", progressRestored: "Bewertungsfortschritt wiederhergestellt", progressRestoredDescription: "Ihr lokal gespeicherter Fortschritt kann fortgesetzt werden.", saving: "Antwort wird gespeichert…", allChangesSaved: "Alle Änderungen gespeichert", saveFailed: "Speichern fehlgeschlagen — erneut versuchen", autoSaveHint: "Änderungen werden automatisch gespeichert" },
  ja: { startOver: "最初から", saveNow: "今すぐ保存", previousModule: "前のモジュール", nextModule: "次のモジュール", submitQuiz: "クイズを送信", reviewSection: "セクションを確認", preferences: "評価設定", lessonProgress: "レッスンの進捗", saveForLater: "後で保存", saved: "保存済み", progressRestored: "評価の進捗を復元しました", progressRestoredDescription: "ローカルに保存された進捗を続行できます。", saving: "回答を保存中…", allChangesSaved: "すべての変更を保存しました", saveFailed: "保存に失敗しました — 再試行してください", autoSaveHint: "変更は自動的に保存されます" },
};

export function getAssessmentCopy(locale: string): AssessmentCopy {
  return copy[locale] ?? copy.en;
}

export const supportedAssessmentCopyLocales = Object.keys(copy);

