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

const copy: Record<string, PsychometricWorkflowCopy> = {
  en: { progress: "Progress", previous: "Previous", next: "Next", reviewAndPay: "Review & pay", beforeYouBegin: "Before you begin", secureCheckout: "Secure checkout", fullName: "Full name", emailAddress: "Email address", consent: "I consent to Profound IQ Consulting processing my responses to generate and deliver this educational profile. I understand it is not a clinical or employment diagnosis.", generateProfile: "and generate profile" },
  sw: { progress: "Maendeleo", previous: "Iliyotangulia", next: "Inayofuata", reviewAndPay: "Kagua na ulipe", beforeYouBegin: "Kabla hujaanza", secureCheckout: "Malipo salama", fullName: "Jina kamili", emailAddress: "Anwani ya barua pepe", consent: "Ninakubali Profound IQ Consulting ichakate majibu yangu ili kuunda na kuwasilisha wasifu huu wa kielimu. Ninaelewa kuwa si utambuzi wa kitabibu au ajira.", generateProfile: "na uunde wasifu" },
  fr: { progress: "Progression", previous: "Précédent", next: "Suivant", reviewAndPay: "Vérifier et payer", beforeYouBegin: "Avant de commencer", secureCheckout: "Paiement sécurisé", fullName: "Nom complet", emailAddress: "Adresse e-mail", consent: "J’autorise Profound IQ Consulting à traiter mes réponses pour créer et livrer ce profil éducatif. Je comprends qu’il ne s’agit pas d’un diagnostic clinique ou professionnel.", generateProfile: "et créer le profil" },
  es: { progress: "Progreso", previous: "Anterior", next: "Siguiente", reviewAndPay: "Revisar y pagar", beforeYouBegin: "Antes de comenzar", secureCheckout: "Pago seguro", fullName: "Nombre completo", emailAddress: "Correo electrónico", consent: "Autorizo a Profound IQ Consulting a procesar mis respuestas para generar y entregar este perfil educativo. Entiendo que no es un diagnóstico clínico ni laboral.", generateProfile: "y generar el perfil" },
  pt: { progress: "Progresso", previous: "Anterior", next: "Seguinte", reviewAndPay: "Rever e pagar", beforeYouBegin: "Antes de começar", secureCheckout: "Pagamento seguro", fullName: "Nome completo", emailAddress: "Endereço de e-mail", consent: "Autorizo a Profound IQ Consulting a processar as minhas respostas para gerar e entregar este perfil educativo. Entendo que não é um diagnóstico clínico ou profissional.", generateProfile: "e gerar o perfil" },
  ar: { progress: "التقدم", previous: "السابق", next: "التالي", reviewAndPay: "مراجعة ودفع", beforeYouBegin: "قبل أن تبدأ", secureCheckout: "دفع آمن", fullName: "الاسم الكامل", emailAddress: "عنوان البريد الإلكتروني", consent: "أوافق على معالجة Profound IQ Consulting لإجاباتي لإنشاء هذا الملف التعليمي وتسليمه. وأفهم أنه ليس تشخيصًا سريريًا أو مهنيًا.", generateProfile: "وإنشاء الملف" },
  zh: { progress: "进度", previous: "上一题", next: "下一题", reviewAndPay: "查看并付款", beforeYouBegin: "开始之前", secureCheckout: "安全结账", fullName: "姓名", emailAddress: "电子邮箱", consent: "我同意 Profound IQ Consulting 处理我的回答，以生成并交付这份教育档案。我了解这不是临床或就业诊断。", generateProfile: "并生成档案" },
  hi: { progress: "प्रगति", previous: "पिछला", next: "अगला", reviewAndPay: "समीक्षा करें और भुगतान करें", beforeYouBegin: "शुरू करने से पहले", secureCheckout: "सुरक्षित चेकआउट", fullName: "पूरा नाम", emailAddress: "ईमेल पता", consent: "मैं Profound IQ Consulting को इस शैक्षिक प्रोफ़ाइल को बनाने और वितरित करने के लिए अपने उत्तर संसाधित करने की सहमति देता/देती हूँ। मैं समझता/समझती हूँ कि यह नैदानिक या रोजगार संबंधी निदान नहीं है।", generateProfile: "और प्रोफ़ाइल बनाएं" },
  de: { progress: "Fortschritt", previous: "Zurück", next: "Weiter", reviewAndPay: "Prüfen und bezahlen", beforeYouBegin: "Bevor Sie beginnen", secureCheckout: "Sichere Zahlung", fullName: "Vollständiger Name", emailAddress: "E-Mail-Adresse", consent: "Ich stimme zu, dass Profound IQ Consulting meine Antworten zur Erstellung und Zustellung dieses Bildungsprofils verarbeitet. Mir ist bewusst, dass es keine klinische oder berufliche Diagnose ist.", generateProfile: "und Profil erstellen" },
  ja: { progress: "進捗", previous: "前へ", next: "次へ", reviewAndPay: "確認して支払う", beforeYouBegin: "始める前に", secureCheckout: "安全な決済", fullName: "氏名", emailAddress: "メールアドレス", consent: "Profound IQ Consulting がこの教育プロフィールの作成と提供のために回答を処理することに同意します。これは臨床または雇用に関する診断ではないことを理解しています。", generateProfile: "プロフィールを作成" },
};

export function getPsychometricWorkflowCopy(locale: string): PsychometricWorkflowCopy { return copy[locale] ?? copy.en; }
export const psychometricWorkflowLocales = Object.keys(copy);

