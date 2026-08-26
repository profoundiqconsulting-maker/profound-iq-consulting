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
  suggestTranslation: "Suggest a translation improvement",
  suggestTranslationShort: "Suggest a fix",
  translationFeedbackEyebrow: "Help us improve",
  translationFeedbackTitle: "Suggest a better translation.",
  translationFeedbackDescription: "Tell us which wording could be clearer. We’ll review your suggestion and use it to improve the experience.",
  currentLanguage: "Current language",
  pageContext: "Page",
  sourceText: "Source text",
  sourceTextPlaceholder: "Paste the wording you would like us to review",
  suggestedCorrection: "Suggested correction",
  suggestedCorrectionPlaceholder: "Write the clearer translation you recommend",
  quickCheck: "Quick check:",
  translationFeedbackPrivacy: "Your suggestion is sent to our team with the current page and language so we can review it in context.",
  sendSuggestion: "Send suggestion",
  sending: "Sending…",
  translationFeedbackThanks: "Thank you — your translation suggestion was sent.",
  translationFeedbackError: "We could not send that suggestion. Please try again.",
  translationFeedbackCheckError: "Please solve the quick check correctly.",
  connectedAccount: "Connected account",
  googleAccountConnected: "Google account connected",
  providerAccountConnected: "account connected",
  emailPasswordAccount: "Email and password account",
  googleAccountDescription: "Your Google profile email and picture are used for secure sign-in. You can hide the picture below without disconnecting the account.",
  currentSignInMethodDescription: "Your current sign-in method is shown here for account clarity.",
  preferredLanguage: "Preferred language",
  preferredLanguageDescription: "Saved on this device and applied across your workspace, including Arabic right-to-left layout.",
  languageUpdated: "Preferred language updated",
  languageUpdatedDescription: "Your language preference is now active across the workspace.",
  enrollmentStatus: "Course enrollment status",
  recentPayments: "Recent staged payments",
  noEnrollments: "No course enrollments yet.",
  paymentPending: "Payment pending",
  paymentPaid: "Paid",
  paymentStage: "Stage",
  paymentHistoryDescription: "Review your active courses and the staged payments attached to each enrollment.",
  mockCheckout: "Mock checkout",
  mockCheckoutDescription: "Development-only QA mode. This simulates a successful first installment without charging Paystack.",
  simulatePayment: "Simulate first payment",
  mockPaymentSuccess: "Mock first payment completed",
  paymentHistoryShortcut: "Payment history",
  paymentHistoryShortcutDescription: "View enrollments and staged payments",
} as const;

type TranslationKey = keyof typeof english;


const overrides: Partial<Record<LocaleCode, Partial<Translation>>> = {
  sw: { connectedAccount: "Akaunti iliyounganishwa", googleAccountConnected: "Akaunti ya Google imeunganishwa", providerAccountConnected: "akaunti imeunganishwa", emailPasswordAccount: "Akaunti ya barua pepe na nenosiri", googleAccountDescription: "Barua pepe na picha yako ya Google hutumika kwa kuingia kwa usalama. Unaweza kuficha picha hapa chini bila kutenganisha akaunti.", currentSignInMethodDescription: "Njia yako ya sasa ya kuingia inaonyeshwa kwa uwazi wa akaunti.", preferredLanguage: "Lugha unayopendelea", preferredLanguageDescription: "Huhifadhiwa kwenye kifaa hiki na kutumika katika eneo lako lote la kazi, pamoja na mpangilio wa kulia kwenda kushoto wa Kiarabu.", discussItem: "Zungumzia huduma", enrollNow: "Jisajili sasa", openSyllabus: "Fungua mtaala", details: "Maelezo", payment: "Malipo", access: "Ufikiaji", searchCourses: "Tafuta kozi, mada au matokeo", allCategories: "Aina zote", clearFilters: "Futa vichujio", noCourseMatch: "Hakuna kozi inayolingana na utafutaji huo.", language: "Lugha", selectLanguage: "Chagua lugha", backToSite: "Rudi kwenye tovuti", approach: "Mtazamo", offerings: "Huduma", courses: "Kozi", selfAssessment: "Tathmini binafsi", contact: "Mawasiliano", beginConversation: "Anza mazungumzo", myWorkspace: "Eneo langu la kazi", orientation: "Utangulizi", clarityIs: "Uwazi ni", aCapability: "uwezo.", heroDescription: "Profound IQ Consulting huwasaidia watu na mashirika kubadilisha uwezo wa awali kuwa matokeo yenye kusudi kupitia kujifunza kunakobadilisha jinsi unavyofikiri, kuongoza na kutenda.", takeAssessment: "Fanya tathmini ya KES 399", careerPath: "CareerPath", exploreTheWork: "Gundua kazi yetu", talkToUs: "Zungumza nasi", transformationalLearning: "Kujifunza kwa mabadiliko", privacyPolicy: "Sera ya faragha", termsOfService: "Masharti ya huduma", whatsappSupport: "Msaada wa WhatsApp", yourPrivacyChoices: "Chaguo zako za faragha", clearerWay: "Njia rahisi zaidi ya kutumia vidakuzi.", acceptAll: "Kubali vyote", customize: "Badilisha", savePreferences: "Hifadhi mapendeleo", close: "Funga", worldwide: "Duniani kote" },
  fr: { discussItem: "Discuter", enrollNow: "S’inscrire", openSyllabus: "Voir le programme", details: "Détails", payment: "Paiement", access: "Accès", searchCourses: "Rechercher des cours, thèmes ou résultats", allCategories: "Toutes les catégories", clearFilters: "Effacer les filtres", noCourseMatch: "Aucun cours ne correspond à cette recherche. Essayez un terme plus large.", language: "Langue", selectLanguage: "Choisir la langue", backToSite: "Retour au site", approach: "Approche", offerings: "Offres", courses: "Cours", selfAssessment: "Auto-évaluation", contact: "Contact", beginConversation: "Entamer une conversation", myWorkspace: "Mon espace", orientation: "Orientation", clarityIs: "La clarté est", aCapability: "une capacité.", heroDescription: "Profound IQ Consulting aide les personnes et les organisations à transformer leur potentiel en impact concret grâce à un apprentissage qui change votre façon de penser, de diriger et d’agir.", takeAssessment: "Passer l’évaluation à 399 KES", exploreTheWork: "Découvrir notre travail", talkToUs: "Nous contacter", transformationalLearning: "Apprentissage transformateur", privacyPolicy: "Politique de confidentialité", termsOfService: "Conditions d’utilisation", whatsappSupport: "Assistance WhatsApp", yourPrivacyChoices: "Vos choix de confidentialité", clearerWay: "Une façon plus claire d’utiliser les cookies.", acceptAll: "Tout accepter", customize: "Personnaliser", savePreferences: "Enregistrer les préférences", close: "Fermer", worldwide: "Dans le monde entier" },
  es: { language: "Idioma", selectLanguage: "Seleccionar idioma", backToSite: "Volver al sitio", approach: "Enfoque", offerings: "Servicios", courses: "Cursos", selfAssessment: "Autoevaluación", contact: "Contacto", beginConversation: "Iniciar una conversación", myWorkspace: "Mi espacio", orientation: "Orientación", clarityIs: "La claridad es", aCapability: "una capacidad.", heroDescription: "Profound IQ Consulting ayuda a personas y organizaciones a convertir el potencial en impacto con un aprendizaje que transforma la forma de pensar, liderar y actuar.", takeAssessment: "Realiza la evaluación por 399 KES", exploreTheWork: "Explorar nuestro trabajo", talkToUs: "Habla con nosotros", transformationalLearning: "Aprendizaje transformador", privacyPolicy: "Política de privacidad", termsOfService: "Términos del servicio", whatsappSupport: "Soporte por WhatsApp", yourPrivacyChoices: "Tus opciones de privacidad", clearerWay: "Una forma más clara de usar las cookies.", acceptAll: "Aceptar todo", customize: "Personalizar", savePreferences: "Guardar preferencias", close: "Cerrar", worldwide: "En todo el mundo" },
  pt: { language: "Idioma", selectLanguage: "Selecionar idioma", backToSite: "Voltar ao site", approach: "Abordagem", offerings: "Soluções", courses: "Cursos", selfAssessment: "Autoavaliação", contact: "Contacto", beginConversation: "Iniciar uma conversa", myWorkspace: "Meu espaço", orientation: "Orientação", clarityIs: "Clareza é", aCapability: "uma capacidade.", heroDescription: "A Profound IQ Consulting ajuda pessoas e organizações a transformar potencial em impacto com aprendizagem que muda a forma de pensar, liderar e agir.", takeAssessment: "Fazer a avaliação por 399 KES", exploreTheWork: "Explorar o nosso trabalho", talkToUs: "Fale connosco", transformationalLearning: "Aprendizagem transformadora", privacyPolicy: "Política de privacidade", termsOfService: "Termos de serviço", whatsappSupport: "Suporte WhatsApp", yourPrivacyChoices: "As suas escolhas de privacidade", clearerWay: "Uma forma mais clara de usar cookies.", acceptAll: "Aceitar tudo", customize: "Personalizar", savePreferences: "Guardar preferências", close: "Fechar", worldwide: "Em todo o mundo" },
  ar: { connectedAccount: "الحساب المرتبط", googleAccountConnected: "حساب Google متصل", providerAccountConnected: "حساب متصل", emailPasswordAccount: "حساب البريد الإلكتروني وكلمة المرور", googleAccountDescription: "يُستخدم بريدك الإلكتروني وصورتك من Google لتسجيل الدخول بأمان. يمكنك إخفاء الصورة أدناه دون فصل الحساب.", currentSignInMethodDescription: "تظهر طريقة تسجيل الدخول الحالية لتوضيح الحساب.", preferredLanguage: "اللغة المفضلة", preferredLanguageDescription: "تُحفظ على هذا الجهاز وتُطبق في مساحة العمل، بما في ذلك تخطيط العربية من اليمين إلى اليسار.", language: "اللغة", selectLanguage: "اختر اللغة", backToSite: "العودة إلى الموقع", approach: "النهج", offerings: "الخدمات", courses: "الدورات", selfAssessment: "التقييم الذاتي", contact: "اتصل بنا", beginConversation: "ابدأ محادثة", myWorkspace: "مساحتي", orientation: "التوجيه", clarityIs: "الوضوح هو", aCapability: "قدرة.", heroDescription: "تساعد Profound IQ Consulting الأفراد والمؤسسات على تحويل الإمكانات إلى أثر هادف من خلال تعلم يغير طريقة تفكيرك وقيادتك وتصرفك.", takeAssessment: "ابدأ التقييم مقابل 399 شلن كيني", exploreTheWork: "استكشف أعمالنا", talkToUs: "تحدث معنا", transformationalLearning: "تعلم تحويلي", privacyPolicy: "سياسة الخصوصية", termsOfService: "شروط الخدمة", whatsappSupport: "دعم واتساب", yourPrivacyChoices: "خيارات الخصوصية", clearerWay: "طريقة أوضح لاستخدام ملفات تعريف الارتباط.", acceptAll: "قبول الكل", customize: "تخصيص", savePreferences: "حفظ التفضيلات", close: "إغلاق", worldwide: "في جميع أنحاء العالم" },
  zh: { language: "语言", selectLanguage: "选择语言", backToSite: "返回网站", approach: "方法", offerings: "服务", courses: "课程", selfAssessment: "自我评估", contact: "联系我们", beginConversation: "开始对话", myWorkspace: "我的工作区", orientation: "导览", clarityIs: "清晰是一种", aCapability: "能力。", heroDescription: "Profound IQ Consulting 通过改变思考、领导和行动方式的学习，帮助个人和组织将潜力转化为有目的的影响力。", takeAssessment: "参加 399 KES 评估", exploreTheWork: "探索我们的服务", talkToUs: "联系我们", transformationalLearning: "转型学习", privacyPolicy: "隐私政策", termsOfService: "服务条款", whatsappSupport: "WhatsApp 支持", yourPrivacyChoices: "您的隐私选择", clearerWay: "更清晰地使用 Cookie。", acceptAll: "全部接受", customize: "自定义", savePreferences: "保存偏好", close: "关闭", worldwide: "全球" },
  hi: { language: "भाषा", selectLanguage: "भाषा चुनें", backToSite: "साइट पर लौटें", approach: "दृष्टिकोण", offerings: "सेवाएँ", courses: "पाठ्यक्रम", selfAssessment: "स्व-मूल्यांकन", contact: "संपर्क", beginConversation: "बातचीत शुरू करें", myWorkspace: "मेरा कार्यक्षेत्र", orientation: "परिचय", clarityIs: "स्पष्टता", aCapability: "एक क्षमता है।", heroDescription: "Profound IQ Consulting लोगों और संगठनों को ऐसे सीखने के माध्यम से क्षमता को सार्थक प्रभाव में बदलने में मदद करता है जो सोचने, नेतृत्व करने और कार्य करने के तरीके को बदलता है।", takeAssessment: "KES 399 का मूल्यांकन लें", exploreTheWork: "हमारा काम देखें", talkToUs: "हमसे बात करें", transformationalLearning: "परिवर्तनकारी सीखना", privacyPolicy: "गोपनीयता नीति", termsOfService: "सेवा की शर्तें", whatsappSupport: "WhatsApp सहायता", yourPrivacyChoices: "आपकी गोपनीयता पसंद", clearerWay: "कुकीज़ का उपयोग करने का एक स्पष्ट तरीका।", acceptAll: "सभी स्वीकार करें", customize: "अनुकूलित करें", savePreferences: "पसंद सहेजें", close: "बंद करें", worldwide: "दुनिया भर में" },
  de: { language: "Sprache", selectLanguage: "Sprache auswählen", backToSite: "Zurück zur Website", approach: "Ansatz", offerings: "Angebote", courses: "Kurse", selfAssessment: "Selbsteinschätzung", contact: "Kontakt", beginConversation: "Gespräch beginnen", myWorkspace: "Mein Arbeitsbereich", orientation: "Orientierung", clarityIs: "Klarheit ist", aCapability: "eine Fähigkeit.", heroDescription: "Profound IQ Consulting hilft Menschen und Organisationen, Potenzial in sinnvolle Wirkung zu verwandeln – durch Lernen, das Denken, Führen und Handeln verändert.", takeAssessment: "Bewertung für 399 KES starten", exploreTheWork: "Unsere Arbeit entdecken", talkToUs: "Mit uns sprechen", transformationalLearning: "Transformierendes Lernen", privacyPolicy: "Datenschutzerklärung", termsOfService: "Nutzungsbedingungen", whatsappSupport: "WhatsApp-Support", yourPrivacyChoices: "Ihre Datenschutzauswahl", clearerWay: "Eine klarere Nutzung von Cookies.", acceptAll: "Alle akzeptieren", customize: "Anpassen", savePreferences: "Einstellungen speichern", close: "Schließen", worldwide: "Weltweit" },
  ja: { language: "言語", selectLanguage: "言語を選択", backToSite: "サイトに戻る", approach: "アプローチ", offerings: "サービス", courses: "コース", selfAssessment: "自己評価", contact: "お問い合わせ", beginConversation: "相談を始める", myWorkspace: "マイワークスペース", orientation: "オリエンテーション", clarityIs: "明確さは", aCapability: "能力です。", heroDescription: "Profound IQ Consulting は、考え方・リーダーシップ・行動を変える学びを通して、個人と組織が可能性を意義ある成果へ変えることを支援します。", takeAssessment: "399 KES の評価を受ける", exploreTheWork: "サービスを見る", talkToUs: "ご相談ください", transformationalLearning: "変革型学習", privacyPolicy: "プライバシーポリシー", termsOfService: "利用規約", whatsappSupport: "WhatsApp サポート", yourPrivacyChoices: "プライバシー設定", clearerWay: "Cookie をより明確に利用します。", acceptAll: "すべて許可", customize: "カスタマイズ", savePreferences: "設定を保存", close: "閉じる", worldwide: "世界中" },
};

const paymentOverrides: Partial<Record<LocaleCode, Partial<Translation>>> = {
  en: { enrollmentStatus: "Course enrollment status", recentPayments: "Recent staged payments", noEnrollments: "No course enrollments yet.", paymentPending: "Payment pending", paymentPaid: "Paid", paymentStage: "Stage", paymentHistoryDescription: "Review your active courses and the staged payments attached to each enrollment.", mockCheckout: "Mock checkout", mockCheckoutDescription: "Development-only QA mode. This simulates a successful first installment without charging Paystack.", simulatePayment: "Simulate first payment", mockPaymentSuccess: "Mock first payment completed", paymentHistoryShortcut: "Payment history", paymentHistoryShortcutDescription: "View enrollments and staged payments" },
  sw: { enrollmentStatus: "Hali ya usajili wa kozi", recentPayments: "Malipo ya hivi karibuni kwa awamu", noEnrollments: "Bado hakuna usajili wa kozi.", paymentPending: "Malipo yanasubiri", paymentPaid: "Imelipwa", paymentStage: "Awamu", paymentHistoryDescription: "Kagua kozi zako na malipo ya awamu yanayohusiana na kila usajili.", mockCheckout: "Malipo ya majaribio", mockCheckoutDescription: "Hali ya QA ya maendeleo pekee. Hii huiga malipo ya kwanza bila kutoza Paystack.", simulatePayment: "Iga malipo ya kwanza", mockPaymentSuccess: "Malipo ya kwanza ya majaribio yamekamilika", paymentHistoryShortcut: "Historia ya malipo", paymentHistoryShortcutDescription: "Tazama usajili na malipo ya awamu" },
  fr: { enrollmentStatus: "Statut des inscriptions", recentPayments: "Derniers paiements échelonnés", noEnrollments: "Aucune inscription à un cours pour le moment.", paymentPending: "Paiement en attente", paymentPaid: "Payé", paymentStage: "Étape", paymentHistoryDescription: "Consultez vos cours actifs et les paiements échelonnés associés.", mockCheckout: "Paiement simulé", mockCheckoutDescription: "Mode QA de développement. Simule un premier versement sans débiter Paystack.", simulatePayment: "Simuler le premier paiement", mockPaymentSuccess: "Premier paiement simulé terminé", paymentHistoryShortcut: "Historique des paiements", paymentHistoryShortcutDescription: "Voir les inscriptions et paiements" },
  es: { enrollmentStatus: "Estado de inscripción al curso", recentPayments: "Pagos recientes por etapas", noEnrollments: "Aún no hay inscripciones.", paymentPending: "Pago pendiente", paymentPaid: "Pagado", paymentStage: "Etapa", paymentHistoryDescription: "Revisa tus cursos activos y los pagos por etapas asociados.", mockCheckout: "Pago simulado", mockCheckoutDescription: "Modo QA de desarrollo. Simula el primer pago sin cobrar a través de Paystack.", simulatePayment: "Simular primer pago", mockPaymentSuccess: "Primer pago simulado completado", paymentHistoryShortcut: "Historial de pagos", paymentHistoryShortcutDescription: "Ver inscripciones y pagos" },
  pt: { enrollmentStatus: "Estado da inscrição no curso", recentPayments: "Pagamentos recentes por etapas", noEnrollments: "Ainda não existem inscrições.", paymentPending: "Pagamento pendente", paymentPaid: "Pago", paymentStage: "Etapa", paymentHistoryDescription: "Consulte os seus cursos ativos e os pagamentos faseados associados.", mockCheckout: "Pagamento simulado", mockCheckoutDescription: "Modo QA de desenvolvimento. Simula a primeira prestação sem cobrar no Paystack.", simulatePayment: "Simular primeiro pagamento", mockPaymentSuccess: "Primeiro pagamento simulado concluído", paymentHistoryShortcut: "Histórico de pagamentos", paymentHistoryShortcutDescription: "Ver inscrições e pagamentos" },
  ar: { enrollmentStatus: "حالة التسجيل في الدورة", recentPayments: "المدفوعات المرحلية الأخيرة", noEnrollments: "لا توجد تسجيلات في الدورات بعد.", paymentPending: "الدفع قيد الانتظار", paymentPaid: "مدفوع", paymentStage: "المرحلة", paymentHistoryDescription: "راجع دوراتك النشطة والمدفوعات المرحلية المرتبطة بكل تسجيل.", mockCheckout: "دفع تجريبي", mockCheckoutDescription: "وضع QA للتطوير فقط. يحاكي الدفعة الأولى دون تحصيل من Paystack.", simulatePayment: "محاكاة الدفعة الأولى", mockPaymentSuccess: "اكتملت الدفعة الأولى التجريبية", paymentHistoryShortcut: "سجل المدفوعات", paymentHistoryShortcutDescription: "عرض التسجيلات والمدفوعات المرحلية" },
  zh: { enrollmentStatus: "课程注册状态", recentPayments: "近期分期付款", noEnrollments: "目前还没有课程注册。", paymentPending: "待付款", paymentPaid: "已付款", paymentStage: "阶段", paymentHistoryDescription: "查看您的在读课程及其分期付款记录。", mockCheckout: "模拟结账", mockCheckoutDescription: "仅限开发 QA。模拟首期付款，不会向 Paystack 收费。", simulatePayment: "模拟首期付款", mockPaymentSuccess: "模拟首期付款已完成", paymentHistoryShortcut: "付款记录", paymentHistoryShortcutDescription: "查看注册和分期付款" },
  hi: { enrollmentStatus: "पाठ्यक्रम नामांकन स्थिति", recentPayments: "हाल के चरणबद्ध भुगतान", noEnrollments: "अभी कोई पाठ्यक्रम नामांकन नहीं है।", paymentPending: "भुगतान लंबित", paymentPaid: "भुगतान हो चुका है", paymentStage: "चरण", paymentHistoryDescription: "अपने सक्रिय पाठ्यक्रमों और उनसे जुड़े चरणबद्ध भुगतानों की समीक्षा करें।", mockCheckout: "मॉक चेकआउट", mockCheckoutDescription: "केवल विकास QA मोड। Paystack से शुल्क लिए बिना पहला भुगतान सिम्युलेट करता है।", simulatePayment: "पहला भुगतान सिम्युलेट करें", mockPaymentSuccess: "मॉक पहला भुगतान पूरा हुआ", paymentHistoryShortcut: "भुगतान इतिहास", paymentHistoryShortcutDescription: "नामांकन और चरणबद्ध भुगतान देखें" },
  de: { enrollmentStatus: "Kursanmeldestatus", recentPayments: "Letzte Ratenzahlungen", noEnrollments: "Noch keine Kursanmeldungen.", paymentPending: "Zahlung ausstehend", paymentPaid: "Bezahlt", paymentStage: "Phase", paymentHistoryDescription: "Prüfen Sie Ihre aktiven Kurse und die zugehörigen Ratenzahlungen.", mockCheckout: "Testzahlung", mockCheckoutDescription: "Nur für Entwicklungs-QA. Simuliert die erste Rate ohne eine Paystack-Abbuchung.", simulatePayment: "Erste Zahlung simulieren", mockPaymentSuccess: "Erste Testzahlung abgeschlossen", paymentHistoryShortcut: "Zahlungsverlauf", paymentHistoryShortcutDescription: "Anmeldungen und Ratenzahlungen ansehen" },
  ja: { enrollmentStatus: "コース登録状況", recentPayments: "最近の分割払い", noEnrollments: "コース登録はまだありません。", paymentPending: "支払い待ち", paymentPaid: "支払い済み", paymentStage: "ステージ", paymentHistoryDescription: "受講中のコースと各登録に紐づく分割払いを確認できます。", mockCheckout: "モック決済", mockCheckoutDescription: "開発用QAモードです。Paystackへの請求なしで初回支払いをシミュレーションします。", simulatePayment: "初回支払いをシミュレート", mockPaymentSuccess: "モック初回支払いが完了しました", paymentHistoryShortcut: "支払い履歴", paymentHistoryShortcutDescription: "登録と分割払いを確認" },
};

const translations: Record<LocaleCode, Translation> = Object.fromEntries(SUPPORTED_LOCALES.map(({ code }) => [code, { ...english, ...(overrides[code] ?? {}), ...(paymentOverrides[code] ?? {}) }])) as unknown as Record<LocaleCode, Translation>;

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

export function detectLocaleFromPreferences(preferences: readonly string[]): LocaleCode {
  for (const preference of preferences) {
    const language = preference.toLowerCase();
    const match = SUPPORTED_LOCALES.find(({ code }) => language === code || language.startsWith(`${code}-`));
    if (match) return match.code;
  }
  return "en";
}

function detectLocale(): LocaleCode {
  if (typeof navigator === "undefined") return "en";
  return detectLocaleFromPreferences(navigator.languages?.length ? navigator.languages : [navigator.language]);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");
  useEffect(() => {
    const urlLocale = new URLSearchParams(window.location.search).get("lang") as LocaleCode | null;
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleCode | null;
    if (urlLocale && SUPPORTED_LOCALES.some((item) => item.code === urlLocale)) {
      setLocaleState(urlLocale);
      return;
    }
    setLocaleState(stored && SUPPORTED_LOCALES.some((item) => item.code === stored) ? stored : detectLocale());
  }, []);
  useEffect(() => {
    const info = SUPPORTED_LOCALES.find((item) => item.code === locale) ?? SUPPORTED_LOCALES[0];
    document.documentElement.lang = info.code;
    document.documentElement.dir = info.dir;
    document.documentElement.classList.add("locale-transitioning");
    const timer = window.setTimeout(() => document.documentElement.classList.remove("locale-transitioning"), 260);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    return () => window.clearTimeout(timer);
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale: (next: LocaleCode) => setLocaleState(next), t: (key: TranslationKey) => translations[locale][key] ?? english[key], localeInfo: SUPPORTED_LOCALES.find((item) => item.code === locale) ?? SUPPORTED_LOCALES[0] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }
export type { TranslationKey };
