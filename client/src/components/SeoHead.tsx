import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";

const SITE_NAME = "Profound IQ Consulting";
const SITE_ORIGIN = "https://profoundiqconsulting.com";
const PUBLIC_IMAGE_ORIGIN = "https://profoundiq-vguqrhsm.manus.space";
const DEFAULT_IMAGE = `${PUBLIC_IMAGE_ORIGIN}/manus-storage/profound-iq-social-preview_9d540b32.png`;
const courseSocialImageUrl = (slug: string) => `${PUBLIC_IMAGE_ORIGIN}/og/course/${encodeURIComponent(slug)}.png`;

type SeoConfig = { title: string; description: string; type?: "website" | "article"; canonical?: string; noIndex?: boolean; image?: string; jsonLd?: Record<string, unknown> };

function humanizeSlug(slug: string) {
  return slug.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function getSeo(pathname: string): SeoConfig {
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  const slug = cleanPath.split("/").filter(Boolean).pop() ?? "";
  const courseName = humanizeSlug(slug);
  const common = { type: "website" as const, canonical: cleanPath };
  if (cleanPath === "/") return { ...common, title: `${SITE_NAME} — Clarity is a capability.`, description: "Transformational learning, consulting, research, and psychometric insight for people and organizations ready to move from potential to purposeful impact.", jsonLd: { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_ORIGIN, logo: DEFAULT_IMAGE, email: "admin@profoundiqconsulting.com", telephone: "+254727374055", sameAs: ["https://www.facebook.com/profoundIQ", "https://x.com/ProfoundIQC", "https://linkedin.com/company/profoundiqconsulting", "https://www.instagram.com/profoundiqconsulting/"] } };
  if (cleanPath === "/courses/payment-success") return { ...common, title: `Payment Confirmation | ${SITE_NAME}`, description: "Your Profound IQ Consulting course payment confirmation and next steps.", noIndex: true };
  if (cleanPath === "/courses") return { ...common, title: `Professional Courses | ${SITE_NAME}`, description: "Explore globally relevant professional courses with interactive lessons, applied practice, assessment, staged Paystack checkout, and completion certificates.", jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Professional Courses", url: `${SITE_ORIGIN}/courses`, isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_ORIGIN } } };
  if (cleanPath.startsWith("/courses/")) return { ...common, image: courseSocialImageUrl(slug), title: `${courseName || "Professional Course"} | ${SITE_NAME}`, description: `Build practical capability through ${courseName || "this professional course"}, with structured modules, interactive lessons, quizzes, and a professional certificate of completion.`, jsonLd: { "@context": "https://schema.org", "@type": "Course", name: courseName || "Professional Course", provider: { "@type": "Organization", name: SITE_NAME, url: SITE_ORIGIN }, offers: { "@type": "Offer", price: "4999", priceCurrency: "KES", url: `${SITE_ORIGIN}${cleanPath}` } } };
  if (cleanPath === "/assessment") return { ...common, title: `Self Assessment | ${SITE_NAME}`, description: "Take the Profound IQ Self Assessment to clarify your strengths, development priorities, and next learning steps.", jsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Profound IQ Self Assessment", provider: { "@type": "Organization", name: SITE_NAME }, areaServed: "Worldwide", offers: { "@type": "Offer", price: "399", priceCurrency: "KES", url: `${SITE_ORIGIN}/assessment` } } };
  if (cleanPath === "/careerpath" || cleanPath === "/careerpath/assessment") return { ...common, title: `CareerPath Talent Fit Assessment | ${SITE_NAME}`, description: "Discover strengths, explore possibilities, and choose with confidence through the Profound IQ CareerPath assessment for competency-based education learners.", jsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Profound IQ CareerPath Talent Fit Assessment", provider: { "@type": "Organization", name: SITE_NAME }, offers: { "@type": "Offer", price: "399", priceCurrency: "KES", url: `${SITE_ORIGIN}/careerpath` } } };
  if (cleanPath === "/psychometrics" || cleanPath.startsWith("/psychometrics/")) return { ...common, title: `${cleanPath === "/psychometrics" ? "Psychometric Assessments" : `${courseName} Psychometric Assessment`} | ${SITE_NAME}`, description: "Use structured psychometric insight to understand personality, cognition, emotional intelligence, employability, leadership potential, and career fit.", jsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Profound IQ Psychometric Assessments", provider: { "@type": "Organization", name: SITE_NAME }, offers: { "@type": "Offer", price: "699", priceCurrency: "KES", url: `${SITE_ORIGIN}${cleanPath}` } } };
  if (cleanPath === "/verify/certificate" || cleanPath === "/verify/psychometric") return { ...common, title: `Verify a Profound IQ Credential | ${SITE_NAME}`, description: "Verify the authenticity of a Profound IQ Consulting certificate or psychometric report using its secure verification reference.", jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: "Credential Verification", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_ORIGIN } } };
  if (cleanPath === "/privacy-policy") return { ...common, title: `Privacy Policy | ${SITE_NAME}`, description: "Read how Profound IQ Consulting handles account, learning, assessment, payment, communication, and sharing information.", jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: "Privacy Policy", description: "Privacy practices for Profound IQ Consulting.", url: `${SITE_ORIGIN}/privacy-policy`, publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_ORIGIN } } };
  if (cleanPath === "/terms-of-service") return { ...common, title: `Terms of Service | ${SITE_NAME}`, description: "Read the terms governing Profound IQ Consulting courses, assessments, reports, certificates, payments, and support services.", jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: "Terms of Service", description: "Terms governing the Profound IQ Consulting platform.", url: `${SITE_ORIGIN}/terms-of-service`, publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_ORIGIN } } };
  return { ...common, title: `${SITE_NAME} Workspace`, description: "Secure Profound IQ Consulting workspace for assessments, courses, reports, certificates, and learning progress.", noIndex: true };
}

function setMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) { element = document.createElement("meta"); element.name = name; document.head.appendChild(element); }
  element.content = content;
}

function setProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) { element = document.createElement("meta"); element.setAttribute("property", property); document.head.appendChild(element); }
  element.content = content;
}

export function SeoHead() {
  const [location] = useLocation();
  const seo = useMemo(() => getSeo(location.split("?")[0]), [location]);
  useEffect(() => {
    document.title = seo.title;
    setMeta("description", seo.description);
    setMeta("robots", seo.noIndex ? "noindex, nofollow" : "index, follow");
    setProperty("og:title", seo.title);
    setProperty("og:description", seo.description);
    setProperty("og:type", seo.type ?? "website");
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
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = `${SITE_ORIGIN}${seo.canonical ?? "/"}`;
    let structuredData = document.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld="true"]');
    if (!structuredData) { structuredData = document.createElement("script"); structuredData.type = "application/ld+json"; structuredData.dataset.seoJsonld = "true"; document.head.appendChild(structuredData); }
    structuredData.textContent = JSON.stringify(seo.jsonLd ?? { "@context": "https://schema.org", "@type": "WebPage", name: seo.title, description: seo.description, url: `${SITE_ORIGIN}${seo.canonical ?? "/"}` });
  }, [seo]);
  return null;
}

export { getSeo, SITE_ORIGIN, DEFAULT_IMAGE, courseSocialImageUrl };
