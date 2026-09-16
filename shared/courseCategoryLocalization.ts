export const courseCategoryLocales = [
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

const categoryLabels: Record<string, Record<string, string>> = {
  "Business & Enterprise": {
    en: "Business & Enterprise",
    sw: "Biashara na Shughuli za Kampuni",
    fr: "Affaires et Entreprise",
    es: "Negocios y Empresa",
    pt: "Negócios e Empresa",
    ar: "الأعمال والشركات",
    zh: "商业与企业",
    hi: "व्यवसाय और उद्यम",
    de: "Geschäft und Unternehmen",
    ja: "ビジネスと企業",
  },
  "Leadership & Workplace": {
    en: "Leadership & Workplace",
    sw: "Uwongozi na Mahali pa Kazi",
    fr: "Leadership et Lieu de travail",
    es: "Liderazgo y Lugar de trabajo",
    pt: "Liderança e Local de trabalho",
    ar: "القيادة ومكان العمل",
    zh: "领导力与职场",
    hi: "नेतृत्व और कार्यस्थल",
    de: "Führung und Arbeitsplatz",
    ja: "リーダーシップと職場",
  },
  "Career & Education": {
    en: "Career & Education",
    sw: "Kazi na Elimu",
    fr: "Carrière et Éducation",
    es: "Carrera y Educación",
    pt: "Carreira e Educação",
    ar: "المهنة والتعليم",
    zh: "职业与教育",
    hi: "करियर और शिक्षा",
    de: "Karriere und Bildung",
    ja: "キャリアと教育",
  },
  "Performance & Innovation": {
    en: "Performance & Innovation",
    sw: "Uwazi na Ubunifu",
    fr: "Performance et Innovation",
    es: "Rendimiento e Innovación",
    pt: "Desempenho e Inovação",
    ar: "الأداء والابتكار",
    zh: "绩效与创新",
    hi: "प्रदर्शन और नवाचार",
    de: "Leistung und Innovation",
    ja: "パフォーマンスとイノベーション",
  },
  "Personal Development": {
    en: "Personal Development",
    sw: "Ukuaji wa Kujifunza",
    fr: "Développement personnel",
    es: "Desarrollo Personal",
    pt: "Desenvolvimento Pessoal",
    ar: "التطوير الشخصي",
    zh: "个人发展",
    hi: "व्यक्तिगत विकास",
    de: "Persönliche Entwicklung",
    ja: "パーソナル開発",
  },
};

export function localizeCourseCategory(
  locale: string,
  category: string
): string {
  return categoryLabels[category]?.[locale] ?? category;
}
