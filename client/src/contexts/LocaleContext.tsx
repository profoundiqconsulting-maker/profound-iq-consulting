import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LOCALE_STORAGE_KEY = "profound-iq-locale";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "sw", label: "Swahili", nativeLabel: "Kiswahili", dir: "ltr" },
  { code: "fr", label: "French", nativeLabel: "Français", dir: "ltr" },
  { code: "es", label: "Spanish", nativeLabel: "Español", dir: "ltr" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "zh", label: "Chinese (Simplified)", nativeLabel: "简体中文", dir: "ltr" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr" },
  { code: "de", label: "German", nativeLabel: "Deutsch", dir: "ltr" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", dir: "ltr" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];
type Translation = Record<string, string>;

const english = {
  language: "Language",
  selectLanguage: "Select language",
  backToSite: "Back to site",
  approach: "Approach",
  offerings: "Offerings",
  courses: "Courses",
  selfAssessment: "Self Assessment",
  contact: "Contact",
  beginConversation: "Begin a conversation",
  myWorkspace: "My workspace",
  orientation: "Orientation",
  clarityIs: "Clarity is",
  aCapability: "a capability.",
  heroDescription: "Profound IQ Consulting helps people and organizations move from raw potential to purposeful impact—through learning that changes how you think, lead, and act.",
  takeAssessment: "Take the KES 399 assessment",
  careerPath: "CareerPath",
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
  officeHours: "Monday to Saturday · Office hours",
  yourPrivacyChoices: "Your privacy choices",
  clearerWay: "A clearer way to use cookies.",
  cookieDescription: "We use essential browser storage to keep the site secure and remember progress. Optional analytics help us understand journeys such as course sharing and assessment starts.",
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
  noCourseMatch: "No courses match that search. Try a broader term or reset the filters.",
  discussItem: "Discuss item",
  overview: "Overview",
  adminObservatory: "Admin observatory",
  staffWorkspace: "Staff workspace",
  settings: "Settings",
  navigation: "Navigation",
  signInToContinue: "Sign in to continue",
  signIn: "Sign in",
  signOut: "Sign out",
} as const;

type TranslationKey = keyof typeof english;


const overrides: Partial<Record<LocaleCode, Partial<Translation>>> = {
  sw: { discussItem: "Zungumzia huduma", enrollNow: "Jisajili sasa", openSyllabus: "Fungua mtaala", details: "Maelezo", payment: "Malipo", access: "Ufikiaji", searchCourses: "Tafuta kozi, mada au matokeo", allCategories: "Aina zote", clearFilters: "Futa vichujio", noCourseMatch: "Hakuna kozi inayolingana na utafutaji huo.", language: "Lugha", selectLanguage: "Chagua lugha", backToSite: "Rudi kwenye tovuti", approach: "Mtazamo", offerings: "Huduma", courses: "Kozi", selfAssessment: "Tathmini binafsi", contact: "Mawasiliano", beginConversation: "Anza mazungumzo", myWorkspace: "Eneo langu la kazi", orientation: "Utangulizi", clarityIs: "Uwazi ni", aCapability: "uwezo.", heroDescription: "Profound IQ Consulting huwasaidia watu na mashirika kubadilisha uwezo wa awali kuwa matokeo yenye kusudi kupitia kujifunza kunakobadilisha jinsi unavyofikiri, kuongoza na kutenda.", takeAssessment: "Fanya tathmini ya KES 399", careerPath: "CareerPath", exploreTheWork: "Gundua kazi yetu", talkToUs: "Zungumza nasi", transformationalLearning: "Kujifunza kwa mabadiliko", privacyPolicy: "Sera ya faragha", termsOfService: "Masharti ya huduma", whatsappSupport: "Msaada wa WhatsApp", yourPrivacyChoices: "Chaguo zako za faragha", clearerWay: "Njia rahisi zaidi ya kutumia vidakuzi.", acceptAll: "Kubali vyote", customize: "Badilisha", savePreferences: "Hifadhi mapendeleo", close: "Funga", worldwide: "Duniani kote" },
  fr: { discussItem: "Discuter", enrollNow: "S’inscrire", openSyllabus: "Voir le programme", details: "Détails", payment: "Paiement", access: "Accès", searchCourses: "Rechercher des cours, thèmes ou résultats", allCategories: "Toutes les catégories", clearFilters: "Effacer les filtres", noCourseMatch: "Aucun cours ne correspond à cette recherche. Essayez un terme plus large.", language: "Langue", selectLanguage: "Choisir la langue", backToSite: "Retour au site", approach: "Approche", offerings: "Offres", courses: "Cours", selfAssessment: "Auto-évaluation", contact: "Contact", beginConversation: "Entamer une conversation", myWorkspace: "Mon espace", orientation: "Orientation", clarityIs: "La clarté est", aCapability: "une capacité.", heroDescription: "Profound IQ Consulting aide les personnes et les organisations à transformer leur potentiel en impact concret grâce à un apprentissage qui change votre façon de penser, de diriger et d’agir.", takeAssessment: "Passer l’évaluation à 399 KES", exploreTheWork: "Découvrir notre travail", talkToUs: "Nous contacter", transformationalLearning: "Apprentissage transformateur", privacyPolicy: "Politique de confidentialité", termsOfService: "Conditions d’utilisation", whatsappSupport: "Assistance WhatsApp", yourPrivacyChoices: "Vos choix de confidentialité", clearerWay: "Une façon plus claire d’utiliser les cookies.", acceptAll: "Tout accepter", customize: "Personnaliser", savePreferences: "Enregistrer les préférences", close: "Fermer", worldwide: "Dans le monde entier" },
  es: { language: "Idioma", selectLanguage: "Seleccionar idioma", backToSite: "Volver al sitio", approach: "Enfoque", offerings: "Servicios", courses: "Cursos", selfAssessment: "Autoevaluación", contact: "Contacto", beginConversation: "Iniciar una conversación", myWorkspace: "Mi espacio", orientation: "Orientación", clarityIs: "La claridad es", aCapability: "una capacidad.", heroDescription: "Profound IQ Consulting ayuda a personas y organizaciones a convertir el potencial en impacto con un aprendizaje que transforma la forma de pensar, liderar y actuar.", takeAssessment: "Realiza la evaluación por 399 KES", exploreTheWork: "Explorar nuestro trabajo", talkToUs: "Habla con nosotros", transformationalLearning: "Aprendizaje transformador", privacyPolicy: "Política de privacidad", termsOfService: "Términos del servicio", whatsappSupport: "Soporte por WhatsApp", yourPrivacyChoices: "Tus opciones de privacidad", clearerWay: "Una forma más clara de usar las cookies.", acceptAll: "Aceptar todo", customize: "Personalizar", savePreferences: "Guardar preferencias", close: "Cerrar", worldwide: "En todo el mundo" },
  pt: { language: "Idioma", selectLanguage: "Selecionar idioma", backToSite: "Voltar ao site", approach: "Abordagem", offerings: "Soluções", courses: "Cursos", selfAssessment: "Autoavaliação", contact: "Contacto", beginConversation: "Iniciar uma conversa", myWorkspace: "Meu espaço", orientation: "Orientação", clarityIs: "Clareza é", aCapability: "uma capacidade.", heroDescription: "A Profound IQ Consulting ajuda pessoas e organizações a transformar potencial em impacto com aprendizagem que muda a forma de pensar, liderar e agir.", takeAssessment: "Fazer a avaliação por 399 KES", exploreTheWork: "Explorar o nosso trabalho", talkToUs: "Fale connosco", transformationalLearning: "Aprendizagem transformadora", privacyPolicy: "Política de privacidade", termsOfService: "Termos de serviço", whatsappSupport: "Suporte WhatsApp", yourPrivacyChoices: "As suas escolhas de privacidade", clearerWay: "Uma forma mais clara de usar cookies.", acceptAll: "Aceitar tudo", customize: "Personalizar", savePreferences: "Guardar preferências", close: "Fechar", worldwide: "Em todo o mundo" },
  ar: { language: "اللغة", selectLanguage: "اختر اللغة", backToSite: "العودة إلى الموقع", approach: "النهج", offerings: "الخدمات", courses: "الدورات", selfAssessment: "التقييم الذاتي", contact: "اتصل بنا", beginConversation: "ابدأ محادثة", myWorkspace: "مساحتي", orientation: "التوجيه", clarityIs: "الوضوح هو", aCapability: "قدرة.", heroDescription: "تساعد Profound IQ Consulting الأفراد والمؤسسات على تحويل الإمكانات إلى أثر هادف من خلال تعلم يغير طريقة تفكيرك وقيادتك وتصرفك.", takeAssessment: "ابدأ التقييم مقابل 399 شلن كيني", exploreTheWork: "استكشف أعمالنا", talkToUs: "تحدث معنا", transformationalLearning: "تعلم تحويلي", privacyPolicy: "سياسة الخصوصية", termsOfService: "شروط الخدمة", whatsappSupport: "دعم واتساب", yourPrivacyChoices: "خيارات الخصوصية", clearerWay: "طريقة أوضح لاستخدام ملفات تعريف الارتباط.", acceptAll: "قبول الكل", customize: "تخصيص", savePreferences: "حفظ التفضيلات", close: "إغلاق", worldwide: "في جميع أنحاء العالم" },
  zh: { language: "语言", selectLanguage: "选择语言", backToSite: "返回网站", approach: "方法", offerings: "服务", courses: "课程", selfAssessment: "自我评估", contact: "联系我们", beginConversation: "开始对话", myWorkspace: "我的工作区", orientation: "导览", clarityIs: "清晰是一种", aCapability: "能力。", heroDescription: "Profound IQ Consulting 通过改变思考、领导和行动方式的学习，帮助个人和组织将潜力转化为有目的的影响力。", takeAssessment: "参加 399 KES 评估", exploreTheWork: "探索我们的服务", talkToUs: "联系我们", transformationalLearning: "转型学习", privacyPolicy: "隐私政策", termsOfService: "服务条款", whatsappSupport: "WhatsApp 支持", yourPrivacyChoices: "您的隐私选择", clearerWay: "更清晰地使用 Cookie。", acceptAll: "全部接受", customize: "自定义", savePreferences: "保存偏好", close: "关闭", worldwide: "全球" },
  hi: { language: "भाषा", selectLanguage: "भाषा चुनें", backToSite: "साइट पर लौटें", approach: "दृष्टिकोण", offerings: "सेवाएँ", courses: "पाठ्यक्रम", selfAssessment: "स्व-मूल्यांकन", contact: "संपर्क", beginConversation: "बातचीत शुरू करें", myWorkspace: "मेरा कार्यक्षेत्र", orientation: "परिचय", clarityIs: "स्पष्टता", aCapability: "एक क्षमता है।", heroDescription: "Profound IQ Consulting लोगों और संगठनों को ऐसे सीखने के माध्यम से क्षमता को सार्थक प्रभाव में बदलने में मदद करता है जो सोचने, नेतृत्व करने और कार्य करने के तरीके को बदलता है।", takeAssessment: "KES 399 का मूल्यांकन लें", exploreTheWork: "हमारा काम देखें", talkToUs: "हमसे बात करें", transformationalLearning: "परिवर्तनकारी सीखना", privacyPolicy: "गोपनीयता नीति", termsOfService: "सेवा की शर्तें", whatsappSupport: "WhatsApp सहायता", yourPrivacyChoices: "आपकी गोपनीयता पसंद", clearerWay: "कुकीज़ का उपयोग करने का एक स्पष्ट तरीका।", acceptAll: "सभी स्वीकार करें", customize: "अनुकूलित करें", savePreferences: "पसंद सहेजें", close: "बंद करें", worldwide: "दुनिया भर में" },
  de: { language: "Sprache", selectLanguage: "Sprache auswählen", backToSite: "Zurück zur Website", approach: "Ansatz", offerings: "Angebote", courses: "Kurse", selfAssessment: "Selbsteinschätzung", contact: "Kontakt", beginConversation: "Gespräch beginnen", myWorkspace: "Mein Arbeitsbereich", orientation: "Orientierung", clarityIs: "Klarheit ist", aCapability: "eine Fähigkeit.", heroDescription: "Profound IQ Consulting hilft Menschen und Organisationen, Potenzial in sinnvolle Wirkung zu verwandeln – durch Lernen, das Denken, Führen und Handeln verändert.", takeAssessment: "Bewertung für 399 KES starten", exploreTheWork: "Unsere Arbeit entdecken", talkToUs: "Mit uns sprechen", transformationalLearning: "Transformierendes Lernen", privacyPolicy: "Datenschutzerklärung", termsOfService: "Nutzungsbedingungen", whatsappSupport: "WhatsApp-Support", yourPrivacyChoices: "Ihre Datenschutzauswahl", clearerWay: "Eine klarere Nutzung von Cookies.", acceptAll: "Alle akzeptieren", customize: "Anpassen", savePreferences: "Einstellungen speichern", close: "Schließen", worldwide: "Weltweit" },
  ja: { language: "言語", selectLanguage: "言語を選択", backToSite: "サイトに戻る", approach: "アプローチ", offerings: "サービス", courses: "コース", selfAssessment: "自己評価", contact: "お問い合わせ", beginConversation: "相談を始める", myWorkspace: "マイワークスペース", orientation: "オリエンテーション", clarityIs: "明確さは", aCapability: "能力です。", heroDescription: "Profound IQ Consulting は、考え方・リーダーシップ・行動を変える学びを通して、個人と組織が可能性を意義ある成果へ変えることを支援します。", takeAssessment: "399 KES の評価を受ける", exploreTheWork: "サービスを見る", talkToUs: "ご相談ください", transformationalLearning: "変革型学習", privacyPolicy: "プライバシーポリシー", termsOfService: "利用規約", whatsappSupport: "WhatsApp サポート", yourPrivacyChoices: "プライバシー設定", clearerWay: "Cookie をより明確に利用します。", acceptAll: "すべて許可", customize: "カスタマイズ", savePreferences: "設定を保存", close: "閉じる", worldwide: "世界中" },
};

const translations: Record<LocaleCode, Translation> = Object.fromEntries(SUPPORTED_LOCALES.map(({ code }) => [code, { ...english, ...(overrides[code] ?? {}) }])) as unknown as Record<LocaleCode, Translation>;

const LocaleContext = createContext<{ locale: LocaleCode; setLocale: (locale: LocaleCode) => void; t: (key: TranslationKey) => string; localeInfo: (typeof SUPPORTED_LOCALES)[number] }>({ locale: "en", setLocale: () => undefined, t: (key) => english[key], localeInfo: SUPPORTED_LOCALES[0] });

export function isSupportedLocale(value: string): value is LocaleCode {
  return SUPPORTED_LOCALES.some((item) => item.code === value);
}

export function getLocaleDirection(locale: LocaleCode) {
  return SUPPORTED_LOCALES.find((item) => item.code === locale)?.dir ?? "ltr";
}

export function getLocalizedTranslation(locale: LocaleCode, key: TranslationKey) {
  return translations[locale][key] ?? english[key];
}

function detectLocale(): LocaleCode {
  if (typeof navigator === "undefined") return "en";
  const language = navigator.language.toLowerCase();
    const match = SUPPORTED_LOCALES.find(({ code }) => language === code || language.startsWith(`${code}-`));
    return match?.code ?? "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");
  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleCode | null;
    setLocaleState(stored && SUPPORTED_LOCALES.some((item) => item.code === stored) ? stored : detectLocale());
  }, []);
  useEffect(() => {
    const info = SUPPORTED_LOCALES.find((item) => item.code === locale) ?? SUPPORTED_LOCALES[0];
    document.documentElement.lang = info.code;
    document.documentElement.dir = info.dir;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale: (next: LocaleCode) => setLocaleState(next), t: (key: TranslationKey) => translations[locale][key] ?? english[key], localeInfo: SUPPORTED_LOCALES.find((item) => item.code === locale) ?? SUPPORTED_LOCALES[0] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }
export type { TranslationKey };
