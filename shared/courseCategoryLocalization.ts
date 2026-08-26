const labels: Record<string, Record<string, string>> = {
  en: { "All categories": "All categories", "Business & Enterprise": "Business & Enterprise", "Leadership & Workplace": "Leadership & Workplace", "Career & Education": "Career & Education", "Performance & Innovation": "Performance & Innovation", "Personal Development": "Personal Development" },
  sw: { "All categories": "Makundi yote", "Business & Enterprise": "Biashara na Ujasiriamali", "Leadership & Workplace": "Uongozi na Mahali pa Kazi", "Career & Education": "Kazi na Elimu", "Performance & Innovation": "Utendaji na Ubunifu", "Personal Development": "Maendeleo Binafsi" },
  fr: { "All categories": "Toutes les catégories", "Business & Enterprise": "Entreprise et affaires", "Leadership & Workplace": "Leadership et travail", "Career & Education": "Carrière et éducation", "Performance & Innovation": "Performance et innovation", "Personal Development": "Développement personnel" },
  es: { "All categories": "Todas las categorías", "Business & Enterprise": "Negocios y empresa", "Leadership & Workplace": "Liderazgo y trabajo", "Career & Education": "Carrera y educación", "Performance & Innovation": "Rendimiento e innovación", "Personal Development": "Desarrollo personal" },
  pt: { "All categories": "Todas as categorias", "Business & Enterprise": "Negócios e empresas", "Leadership & Workplace": "Liderança e trabalho", "Career & Education": "Carreira e educação", "Performance & Innovation": "Desempenho e inovação", "Personal Development": "Desenvolvimento pessoal" },
  ar: { "All categories": "كل الفئات", "Business & Enterprise": "الأعمال والمشاريع", "Leadership & Workplace": "القيادة وبيئة العمل", "Career & Education": "المسار المهني والتعليم", "Performance & Innovation": "الأداء والابتكار", "Personal Development": "التنمية الشخصية" },
  zh: { "All categories": "所有类别", "Business & Enterprise": "商业与企业", "Leadership & Workplace": "领导力与职场", "Career & Education": "职业与教育", "Performance & Innovation": "绩效与创新", "Personal Development": "个人发展" },
  hi: { "All categories": "सभी श्रेणियाँ", "Business & Enterprise": "व्यवसाय और उद्यम", "Leadership & Workplace": "नेतृत्व और कार्यस्थल", "Career & Education": "करियर और शिक्षा", "Performance & Innovation": "प्रदर्शन और नवाचार", "Personal Development": "व्यक्तिगत विकास" },
  de: { "All categories": "Alle Kategorien", "Business & Enterprise": "Wirtschaft und Unternehmen", "Leadership & Workplace": "Führung und Arbeitsplatz", "Career & Education": "Karriere und Bildung", "Performance & Innovation": "Leistung und Innovation", "Personal Development": "Persönliche Entwicklung" },
  ja: { "All categories": "すべてのカテゴリー", "Business & Enterprise": "ビジネスと企業", "Leadership & Workplace": "リーダーシップと職場", "Career & Education": "キャリアと教育", "Performance & Innovation": "パフォーマンスと革新", "Personal Development": "自己成長" },
};

export function localizeCourseCategory(locale: string, category: string): string {
  return labels[locale]?.[category] ?? labels.en[category] ?? category;
}

export const courseCategoryLocales = Object.keys(labels);
