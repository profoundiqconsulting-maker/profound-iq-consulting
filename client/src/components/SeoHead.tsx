import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useLocale, type LocaleCode } from "@/contexts/LocaleContext";
import { getInsightArticle } from "@shared/insightsArticles";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

const SITE_NAME = "Profound IQ Consulting";
export const SITE_ORIGIN = PUBLISHED_SITE_ORIGIN;
const PUBLIC_IMAGE_ORIGIN = PUBLISHED_SITE_ORIGIN;
const DEFAULT_IMAGE = `${PUBLIC_IMAGE_ORIGIN}/profound-iq-social-preview.svg`;
const courseSocialImageUrl = (slug: string) =>
  `${PUBLIC_IMAGE_ORIGIN}/og/course/${encodeURIComponent(slug)}.png`;
const SEO_LOCALES = [
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

type SeoConfig = {
  title: string;
  description: string;
  type?: "website" | "article";
  canonical?: string;
  noIndex?: boolean;
  image?: string;
  jsonLd?: Record<string, unknown>;
};

function humanizeSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSeo(pathname: string): SeoConfig {
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  const slug = cleanPath.split("/").filter(Boolean).pop() ?? "";
  const courseName = humanizeSlug(slug);
  const common = { type: "website" as const, canonical: cleanPath };
  if (cleanPath === "/")
    return {
      ...common,
      title: `${SITE_NAME} — Clarity is a capability.`,
      description:
        "Transformational learning, consulting, research, and psychometric insight for people and organizations ready to move from potential to purposeful impact.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_ORIGIN,
        logo: DEFAULT_IMAGE,
        email: "admin@profoundiqconsulting.com",
        telephone: "+254727374055",
        sameAs: [
          "https://www.facebook.com/profoundIQ",
          "https://x.com/ProfoundIQC",
          "https://linkedin.com/company/profoundiqconsulting",
          "https://www.instagram.com/profoundiqconsulting/",
        ],
      },
    };
  if (cleanPath === "/about")
    return {
      ...common,
      title: `About Profound IQ Consulting | ${SITE_NAME}`,
      description:
        "Learn how Profound IQ Consulting helps learners, leaders, schools, and organizations turn insight into purposeful impact.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About Profound IQ Consulting",
        url: `${SITE_ORIGIN}/about`,
        about: { "@type": "Organization", name: SITE_NAME, url: SITE_ORIGIN },
      },
    };
  if (cleanPath === "/services")
    return {
      ...common,
      title: `Consulting Services | ${SITE_NAME}`,
      description:
        "Explore school improvement, international curriculum consulting, teacher development, leadership development, psychometric assessment, and digital learning solutions.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Profound IQ Consulting Services",
        url: `${SITE_ORIGIN}/services`,
        itemListElement: [
          "School Excellence & Improvement Programme",
          "International Curriculum Consulting",
          "Teacher Professional Development",
          "Career Guidance & Psychometric Assessment",
          "School Leadership Development",
          "Digital & AI Education Solutions",
        ].map((name, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
        })),
      },
    };
  if (cleanPath === "/school-solutions")
    return {
      ...common,
      title: `School Solutions | ${SITE_NAME}`,
      description:
        "Help your school strengthen teaching, leadership, curriculum, professional learning, and learner outcomes with practical education consulting.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Profound IQ School Solutions",
        serviceType: "School improvement and education consulting",
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_ORIGIN,
        },
        areaServed: "Worldwide",
      },
    };
  if (cleanPath === "/resources")
    return {
      ...common,
      title: `Resources for Learning and Leadership | ${SITE_NAME}`,
      description:
        "Explore practical guides, research pathways, webinars, and educational insights from Profound IQ Consulting.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Profound IQ Resources",
        url: `${SITE_ORIGIN}/resources`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_ORIGIN },
      },
    };
  if (cleanPath === "/blog")
    return {
      ...common,
      title: `Education and Leadership Insights | ${SITE_NAME}`,
      description:
        "A developing editorial space for useful ideas about education, leadership, curriculum, professional growth, and the changing world of work.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Profound IQ Insights",
        url: `${SITE_ORIGIN}/blog`,
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_ORIGIN,
        },
      },
    };
  if (cleanPath.startsWith("/blog/")) {
    const article = getInsightArticle(slug);
    if (article)
      return {
        ...common,
        type: "article",
        title: `${article.title} | ${SITE_NAME}`,
        description: article.excerpt,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          articleSection: article.category,
          timeRequired: `PT${parseInt(article.readTime, 10) || 5}M`,
          author: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_ORIGIN,
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_ORIGIN,
          },
          mainEntityOfPage: `${SITE_ORIGIN}${cleanPath}`,
        },
      };
  }
  if (cleanPath === "/contact")
    return {
      ...common,
      title: `Contact Profound IQ Consulting | ${SITE_NAME}`,
      description:
        "Contact Profound IQ Consulting about education consulting, professional courses, psychometric assessment, school solutions, and research services.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact Profound IQ Consulting",
        url: `${SITE_ORIGIN}/contact`,
        mainEntity: {
          "@type": "Organization",
          name: SITE_NAME,
          email: "admin@profoundiqconsulting.com",
          telephone: "+254727374055",
        },
      },
    };
  if (cleanPath === "/courses/payment-success")
    return {
      ...common,
      title: `Payment Confirmation | ${SITE_NAME}`,
      description:
        "Your Profound IQ Consulting course payment confirmation and next steps.",
      noIndex: true,
    };
  if (cleanPath === "/courses")
    return {
      ...common,
      title: `Professional Courses | ${SITE_NAME}`,
      description:
        "Explore globally relevant professional courses with interactive lessons, applied practice, assessment, staged Paystack checkout, and completion certificates.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Professional Courses",
        url: `${SITE_ORIGIN}/courses`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_ORIGIN },
      },
    };
  if (cleanPath.startsWith("/courses/"))
    return {
      ...common,
      image: courseSocialImageUrl(slug),
      title: `${courseName || "Professional Course"} | ${SITE_NAME}`,
      description: `Build practical capability through ${courseName || "this professional course"}, with structured modules, interactive lessons, quizzes, and a professional certificate of completion.`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Course",
        name: courseName || "Professional Course",
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_ORIGIN,
        },
        offers: {
          "@type": "Offer",
          price: "4999",
          priceCurrency: "KES",
          url: `${SITE_ORIGIN}${cleanPath}`,
        },
      },
    };
  if (cleanPath === "/assessment")
    return {
      ...common,
      title: `Self Assessment | ${SITE_NAME}`,
      description:
        "Take the Profound IQ Self Assessment to clarify your strengths, development priorities, and next learning steps.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Profound IQ Self Assessment",
        provider: { "@type": "Organization", name: SITE_NAME },
        areaServed: "Worldwide",
        offers: {
          "@type": "Offer",
          price: "399",
          priceCurrency: "KES",
          url: `${SITE_ORIGIN}/assessment`,
        },
      },
    };
  if (cleanPath === "/careerpath" || cleanPath === "/careerpath/assessment")
    return {
      ...common,
      title: `CareerPath Talent Fit Assessment | ${SITE_NAME}`,
      description:
        "Discover strengths, explore possibilities, and choose with confidence through the Profound IQ CareerPath assessment for competency-based education learners.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Profound IQ CareerPath Talent Fit Assessment",
        provider: { "@type": "Organization", name: SITE_NAME },
        offers: {
          "@type": "Offer",
          price: "399",
          priceCurrency: "KES",
          url: `${SITE_ORIGIN}/careerpath`,
        },
      },
    };
  if (cleanPath === "/psychometrics" || cleanPath.startsWith("/psychometrics/"))
    return {
      ...common,
      title: `${cleanPath === "/psychometrics" ? "Psychometric Assessments" : `${courseName} Psychometric Assessment`} | ${SITE_NAME}`,
      description:
        "Use structured psychometric insight to understand personality, cognition, emotional intelligence, employability, leadership potential, and career fit.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Profound IQ Psychometric Assessments",
        provider: { "@type": "Organization", name: SITE_NAME },
        offers: {
          "@type": "Offer",
          price: "699",
          priceCurrency: "KES",
          url: `${SITE_ORIGIN}${cleanPath}`,
        },
      },
    };
  if (
    cleanPath === "/verify/assessment" ||
    cleanPath === "/verify/certificate" ||
    cleanPath === "/verify/psychometric"
  )
    return {
      ...common,
      title: `Verify a Profound IQ Credential | ${SITE_NAME}`,
      description:
        "Verify the authenticity of a Profound IQ Consulting certificate or psychometric report using its secure verification reference.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Credential Verification",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_ORIGIN },
      },
    };
  if (cleanPath === "/privacy-policy")
    return {
      ...common,
      title: `Privacy Policy | ${SITE_NAME}`,
      description:
        "Read how Profound IQ Consulting handles account, learning, assessment, payment, communication, and sharing information.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Privacy Policy",
        description: "Privacy practices for Profound IQ Consulting.",
        url: `${SITE_ORIGIN}/privacy-policy`,
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_ORIGIN,
        },
      },
    };
  if (cleanPath === "/terms-of-service")
    return {
      ...common,
      title: `Terms of Service | ${SITE_NAME}`,
      description:
        "Read the terms governing Profound IQ Consulting courses, assessments, reports, certificates, payments, and support services.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Terms of Service",
        description: "Terms governing the Profound IQ Consulting platform.",
        url: `${SITE_ORIGIN}/terms-of-service`,
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_ORIGIN,
        },
      },
    };
  return {
    ...common,
    title: `${SITE_NAME} Workspace`,
    description:
      "Secure Profound IQ Consulting workspace for assessments, courses, reports, certificates, and learning progress.",
    noIndex: true,
  };
}

const localizedSeoCopy: Partial<
  Record<LocaleCode, Record<string, { title: string; description: string }>>
> = {
  sw: {
    "/": {
      title: "Profound IQ Consulting — Uwazi ni uwezo.",
      description:
        "Kujifunza kwa mabadiliko, ushauri, utafiti na maarifa ya kisaikometria kwa watu na mashirika.",
    },
    "/courses": {
      title: "Kozi za kitaalamu | Profound IQ Consulting",
      description:
        "Gundua kozi za kitaalamu zenye masomo shirikishi, mazoezi na vyeti vya kukamilisha.",
    },
    "/assessment": {
      title: "Tathmini binafsi | Profound IQ Consulting",
      description:
        "Fahamu nguvu zako, vipaumbele vya maendeleo na hatua zako zinazofuata.",
    },
    "/privacy-policy": {
      title: "Sera ya faragha | Profound IQ Consulting",
      description:
        "Jifunze jinsi Profound IQ Consulting inavyoshughulikia taarifa zako.",
    },
    "/terms-of-service": {
      title: "Masharti ya huduma | Profound IQ Consulting",
      description:
        "Masharti yanayosimamia kozi, tathmini, ripoti, vyeti na huduma za Profound IQ Consulting.",
    },
  },
  fr: {
    "/": {
      title: "Profound IQ Consulting — La clarté est une capacité.",
      description:
        "Apprentissage transformateur, conseil, recherche et expertise psychométrique pour les personnes et les organisations.",
    },
    "/courses": {
      title: "Cours professionnels | Profound IQ Consulting",
      description:
        "Découvrez des cours professionnels avec apprentissage interactif, pratique appliquée et certificats.",
    },
    "/assessment": {
      title: "Auto-évaluation | Profound IQ Consulting",
      description:
        "Clarifiez vos forces, vos priorités de développement et vos prochaines étapes.",
    },
    "/privacy-policy": {
      title: "Politique de confidentialité | Profound IQ Consulting",
      description:
        "Découvrez comment Profound IQ Consulting traite vos informations.",
    },
    "/terms-of-service": {
      title: "Conditions d’utilisation | Profound IQ Consulting",
      description:
        "Conditions régissant les cours, évaluations, rapports, certificats et services.",
    },
  },
  es: {
    "/": {
      title: "Profound IQ Consulting — La claridad es una capacidad.",
      description:
        "Aprendizaje transformador, consultoría, investigación e inteligencia psicométrica para personas y organizaciones.",
    },
    "/courses": {
      title: "Cursos profesionales | Profound IQ Consulting",
      description:
        "Explora cursos profesionales con aprendizaje interactivo, práctica aplicada y certificados.",
    },
    "/assessment": {
      title: "Autoevaluación | Profound IQ Consulting",
      description:
        "Aclara tus fortalezas, prioridades de desarrollo y próximos pasos.",
    },
    "/privacy-policy": {
      title: "Política de privacidad | Profound IQ Consulting",
      description:
        "Conoce cómo Profound IQ Consulting gestiona tu información.",
    },
    "/terms-of-service": {
      title: "Términos del servicio | Profound IQ Consulting",
      description:
        "Términos que rigen cursos, evaluaciones, informes, certificados y servicios.",
    },
  },
  ar: {
    "/": {
      title: "Profound IQ Consulting — الوضوح قدرة.",
      description: "تعلم تحويلي واستشارات وبحث ورؤى نفسية للأفراد والمؤسسات.",
    },
    "/courses": {
      title: "الدورات المهنية | Profound IQ Consulting",
      description:
        "اكتشف دورات مهنية مع تعلم تفاعلي وتطبيق عملي وشهادات إكمال.",
    },
    "/assessment": {
      title: "التقييم الذاتي | Profound IQ Consulting",
      description: "اكتشف نقاط قوتك وأولويات تطويرك وخطواتك القادمة.",
    },
    "/privacy-policy": {
      title: "سياسة الخصوصية | Profound IQ Consulting",
      description: "تعرف على كيفية تعامل Profound IQ Consulting مع معلوماتك.",
    },
    "/terms-of-service": {
      title: "شروط الخدمة | Profound IQ Consulting",
      description:
        "الشروط المنظمة للدورات والتقييمات والتقارير والشهادات والخدمات.",
    },
  },
  zh: {
    "/": {
      title: "Profound IQ Consulting — 清晰是一种能力。",
      description: "为个人和组织提供转型学习、咨询、研究和心理测评洞察。",
    },
    "/courses": {
      title: "专业课程 | Profound IQ Consulting",
      description: "探索包含互动学习、实践练习和完成证书的专业课程。",
    },
    "/assessment": {
      title: "自我评估 | Profound IQ Consulting",
      description: "了解您的优势、发展重点和下一步方向。",
    },
    "/privacy-policy": {
      title: "隐私政策 | Profound IQ Consulting",
      description: "了解 Profound IQ Consulting 如何处理您的信息。",
    },
    "/terms-of-service": {
      title: "服务条款 | Profound IQ Consulting",
      description: "适用于课程、评估、报告、证书和服务的条款。",
    },
  },
};

function localizeSeo(
  seo: SeoConfig,
  path: string,
  locale: LocaleCode
): SeoConfig {
  const copy = localizedSeoCopy[locale]?.[path];
  return copy ? { ...seo, ...copy } : seo;
}

function setMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`
  );
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function setProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SeoHead() {
  const [location] = useLocation();
  const { locale } = useLocale();
  const seo = useMemo(
    () =>
      localizeSeo(
        getSeo(location.split("?")[0]),
        location.split("?")[0],
        locale
      ),
    [location, locale]
  );
  useEffect(() => {
    document.title = seo.title;
    setMeta("description", seo.description);
    setMeta("robots", seo.noIndex ? "noindex, nofollow" : "index, follow");
    setProperty("og:title", seo.title);
    setProperty("og:description", seo.description);
    setProperty("og:type", seo.type ?? "website");
    setProperty("og:locale", locale === "en" ? "en_US" : locale);
    setProperty("og:url", `${SITE_ORIGIN}${seo.canonical ?? "/"}`);
    setProperty("og:image", seo.image ?? DEFAULT_IMAGE);
    setProperty("og:image:secure_url", seo.image ?? DEFAULT_IMAGE);
    setProperty("og:image:type", "image/png");
    setProperty("og:image:width", "1200");
    setProperty("og:image:height", "630");
    setProperty("og:image:alt", `${seo.title} — Profound IQ Consulting`);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setProperty("twitter:image", seo.image ?? DEFAULT_IMAGE);
    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_ORIGIN}${seo.canonical ?? "/"}`;
    document.head
      .querySelectorAll<HTMLLinkElement>('link[data-locale-alternate="true"]')
      .forEach(link => link.remove());
    for (const alternateLocale of SEO_LOCALES) {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = alternateLocale === "en" ? "en" : alternateLocale;
      link.href = `${SITE_ORIGIN}${seo.canonical ?? "/"}${(seo.canonical ?? "/").includes("?") ? "&" : "?"}lang=${alternateLocale}`;
      link.dataset.localeAlternate = "true";
      document.head.appendChild(link);
    }
    let structuredData = document.head.querySelector<HTMLScriptElement>(
      'script[data-seo-jsonld="true"]'
    );
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.type = "application/ld+json";
      structuredData.dataset.seoJsonld = "true";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(
      seo.jsonLd ?? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: seo.title,
        description: seo.description,
        url: `${SITE_ORIGIN}${seo.canonical ?? "/"}`,
      }
    );
  }, [seo, locale]);
  return null;
}

export { getSeo, DEFAULT_IMAGE, courseSocialImageUrl };
