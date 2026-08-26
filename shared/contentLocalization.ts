import type { CourseDefinition } from "@shared/courseCatalog";
import { localizeCourseMetadata } from "@shared/courseMetadataLocalization";
export type ContentLocale = "en" | "sw" | "fr" | "es" | "pt" | "ar" | "zh" | "hi" | "de" | "ja";

const recurringTranslations: Partial<Record<ContentLocale, Record<string, string>>> = {
  sw: { "Build the mental model": "Jenga mtazamo wa kiakili", "Understand the mechanism": "Elewa utaratibu", "Apply it in daily life": "Tumia katika maisha ya kila siku", "Study the worked example": "Jifunze mfano uliofanyiwa kazi", "Practise through a small experiment": "Jizoeze kupitia jaribio dogo", "Use the simulation and transfer": "Tumia simulizi na hamishia ujuzi", "Learning outcomes": "Matokeo ya kujifunza", "Reflection prompt": "Swali la tafakari" },
  fr: { "Build the mental model": "Construire le modèle mental", "Understand the mechanism": "Comprendre le mécanisme", "Apply it in daily life": "L’appliquer au quotidien", "Study the worked example": "Étudier l’exemple guidé", "Practise through a small experiment": "Pratiquer par une petite expérience", "Use the simulation and transfer": "Utiliser la simulation et transférer", "Learning outcomes": "Résultats d’apprentissage", "Reflection prompt": "Question de réflexion" },
  es: { "Build the mental model": "Construir el modelo mental", "Understand the mechanism": "Comprender el mecanismo", "Apply it in daily life": "Aplicarlo en la vida diaria", "Study the worked example": "Estudiar el ejemplo práctico", "Practise through a small experiment": "Practicar con un pequeño experimento", "Use the simulation and transfer": "Usar la simulación y transferir", "Learning outcomes": "Resultados de aprendizaje", "Reflection prompt": "Pregunta de reflexión" },
  pt: { "Build the mental model": "Construir o modelo mental", "Understand the mechanism": "Compreender o mecanismo", "Apply it in daily life": "Aplicar no dia a dia", "Study the worked example": "Estudar o exemplo prático", "Practise through a small experiment": "Praticar com uma pequena experiência", "Use the simulation and transfer": "Usar a simulação e transferir", "Learning outcomes": "Resultados de aprendizagem", "Reflection prompt": "Pergunta de reflexão" },
  ar: { "Build the mental model": "ابنِ النموذج الذهني", "Understand the mechanism": "افهم الآلية", "Apply it in daily life": "طبّقه في الحياة اليومية", "Study the worked example": "ادرس المثال التطبيقي", "Practise through a small experiment": "تدرّب عبر تجربة صغيرة", "Use the simulation and transfer": "استخدم المحاكاة وانقل المهارة", "Learning outcomes": "مخرجات التعلم", "Reflection prompt": "سؤال للتأمل" },
  zh: { "Build the mental model": "建立思维模型", "Understand the mechanism": "理解运作机制", "Apply it in daily life": "应用于日常生活", "Study the worked example": "学习示例", "Practise through a small experiment": "通过小实验练习", "Use the simulation and transfer": "使用模拟并迁移", "Learning outcomes": "学习成果", "Reflection prompt": "反思问题" },
  hi: { "Build the mental model": "मानसिक मॉडल बनाएं", "Understand the mechanism": "प्रक्रिया को समझें", "Apply it in daily life": "दैनिक जीवन में लागू करें", "Study the worked example": "काम किए गए उदाहरण का अध्ययन करें", "Practise through a small experiment": "एक छोटे प्रयोग से अभ्यास करें", "Use the simulation and transfer": "सिमुलेशन का उपयोग कर स्थानांतरित करें", "Learning outcomes": "सीखने के परिणाम", "Reflection prompt": "चिंतन प्रश्न" },
  de: { "Build the mental model": "Das mentale Modell aufbauen", "Understand the mechanism": "Den Mechanismus verstehen", "Apply it in daily life": "Im Alltag anwenden", "Study the worked example": "Das Arbeitsbeispiel studieren", "Practise through a small experiment": "Mit einem kleinen Experiment üben", "Use the simulation and transfer": "Simulation nutzen und übertragen", "Learning outcomes": "Lernergebnisse", "Reflection prompt": "Reflexionsfrage" },
  ja: { "Build the mental model": "メンタルモデルを構築する", "Understand the mechanism": "仕組みを理解する", "Apply it in daily life": "日常生活で応用する", "Study the worked example": "実例を学ぶ", "Practise through a small experiment": "小さな実験で練習する", "Use the simulation and transfer": "シミュレーションを使い転用する", "Learning outcomes": "学習成果", "Reflection prompt": "振り返りの問い" },
};

export function localizeContentText(locale: ContentLocale, value: string) {
  return recurringTranslations[locale]?.[value] ?? value;
}

const assessmentDimensionTranslations: Partial<Record<ContentLocale, Record<string, string>>> = {
  sw: { "clarity": "uwazi", "adaptability": "ufikiri unaobadilika", "leadership": "uongozi", "communication": "mawasiliano", "collaboration": "ushirikiano", "execution": "nidhamu ya utekelezaji", "resilience": "ustahimilivu", "selfAwareness": "kujifahamu", "influence": "ushawishi wa kimaadili", "growth": "mwelekeo wa ukuaji" },
  fr: { clarity: "clarté", adaptability: "pensée adaptative", leadership: "leadership", communication: "communication", collaboration: "impact collaboratif", execution: "discipline d’exécution", resilience: "résilience", selfAwareness: "conscience de soi", influence: "influence éthique", growth: "orientation de croissance" },
  es: { clarity: "claridad", adaptability: "pensamiento adaptativo", leadership: "liderazgo", communication: "comunicación", collaboration: "impacto colaborativo", execution: "disciplina de ejecución", resilience: "resiliencia", selfAwareness: "autoconocimiento", influence: "influencia ética", growth: "orientación al crecimiento" },
  pt: { clarity: "clareza", adaptability: "pensamento adaptativo", leadership: "liderança", communication: "comunicação", collaboration: "impacto colaborativo", execution: "disciplina de execução", resilience: "resiliência", selfAwareness: "autoconsciência", influence: "influência ética", growth: "orientação para o crescimento" },
  ar: { clarity: "الوضوح", adaptability: "التفكير التكيفي", leadership: "القيادة", communication: "التواصل", collaboration: "الأثر التعاوني", execution: "انضباط التنفيذ", resilience: "المرونة", selfAwareness: "الوعي الذاتي", influence: "التأثير الأخلاقي", growth: "التوجه نحو النمو" },
  zh: { clarity: "方向清晰度", adaptability: "适应性思维", leadership: "领导力", communication: "沟通", collaboration: "协作影响力", execution: "执行纪律", resilience: "韧性实践", selfAwareness: "自我觉察", influence: "道德影响力", growth: "成长取向" },
  hi: { clarity: "दिशा की स्पष्टता", adaptability: "अनुकूल सोच", leadership: "नेतृत्व", communication: "संचार", collaboration: "सहयोगी प्रभाव", execution: "क्रियान्वयन अनुशासन", resilience: "लचीला अभ्यास", selfAwareness: "आत्म-जागरूकता", influence: "नैतिक प्रभाव", growth: "विकास अभिमुखता" },
  de: { clarity: "Klarheit der Richtung", adaptability: "Anpassungsfähiges Denken", leadership: "Führung", communication: "Kommunikation", collaboration: "Kooperative Wirkung", execution: "Umsetzungsdisziplin", resilience: "Resiliente Praxis", selfAwareness: "Selbstwahrnehmung", influence: "Ethischer Einfluss", growth: "Wachstumsorientierung" },
  ja: { clarity: "方向性の明確さ", adaptability: "適応的思考", leadership: "リーダーシップ", communication: "コミュニケーション", collaboration: "協働の影響", execution: "実行の規律", resilience: "回復力の実践", selfAwareness: "自己認識", influence: "倫理的影響力", growth: "成長志向" },
};

export function localizeAssessmentPrompt(locale: ContentLocale, prompt: string, dimensionKey?: string) {
  const translation = dimensionKey ? assessmentDimensionTranslations[locale]?.[dimensionKey] : undefined;
  if (!translation) return prompt;
  const match = prompt.match(/\s\(([^)]+)\)$/);
  return match ? `${prompt.slice(0, match.index)} (${translation})` : prompt;
}

export function localizeCourseDefinition(locale: ContentLocale, course: CourseDefinition): CourseDefinition {
  const metadata = localizeCourseMetadata(locale, course.slug, course.title, course.description);
  if (locale === "en") return course;
  return {
    ...course,
    title: metadata.title,
    description: metadata.description,

    modules: course.modules.map((module) => ({
      ...module,
      title: localizeContentText(locale, module.title),
      promise: localizeContentText(locale, module.promise),
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        title: localizeContentText(locale, lesson.title),
        summary: localizeContentText(locale, lesson.summary),
        outcome: localizeContentText(locale, lesson.outcome),
        objectives: lesson.objectives.map((value) => localizeContentText(locale, value)),
        sections: lesson.sections.map((section) => ({ ...section, heading: localizeContentText(locale, section.heading), body: localizeContentText(locale, section.body), callout: section.callout ? localizeContentText(locale, section.callout) : section.callout })),
        example: { ...lesson.example, context: localizeContentText(locale, lesson.example.context), move: localizeContentText(locale, lesson.example.move), result: localizeContentText(locale, lesson.example.result) },
        simulation: { ...lesson.simulation, prompt: localizeContentText(locale, lesson.simulation.prompt), options: lesson.simulation.options.map((value) => localizeContentText(locale, value)), feedback: lesson.simulation.feedback.map((value) => localizeContentText(locale, value)) },
        reflectionPrompt: localizeContentText(locale, lesson.reflectionPrompt),
        keyTakeaway: localizeContentText(locale, lesson.keyTakeaway),
        illustration: { ...lesson.illustration, label: localizeContentText(locale, lesson.illustration.label), caption: localizeContentText(locale, lesson.illustration.caption) },
      })),
      quiz: module.quiz.map((question) => ({ ...question, prompt: localizeContentText(locale, question.prompt), options: question.options.map((value) => localizeContentText(locale, value)), sourceLessonTitle: localizeContentText(locale, question.sourceLessonTitle), explanation: localizeContentText(locale, question.explanation), optionExplanations: question.optionExplanations.map((value) => localizeContentText(locale, value)) })),
    })),
  };
}
