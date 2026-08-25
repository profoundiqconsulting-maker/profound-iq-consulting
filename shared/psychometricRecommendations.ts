import type { PsychometricReport } from "./psychometrics";

export type PsychometricCourseRecommendation = { slug: string; title: string; reason: string; action: string };

const courseTitles: Record<string, string> = {
  "personal-growth-self-discovery": "Personal Growth & Self-Discovery",
  "personal-brand-strategy": "Building a Distinctive Personal Brand",
  "effective-communication-essentials": "Essentials of Effective Communication",
  "critical-thinking-problem-solving": "Critical Thinking & Problem Solving",
  "decision-making-skills": "Decision-Making Skills",
  "creativity-and-innovation": "Creativity & Innovation in Practice",
  "emotional-intelligence-mastery": "Mastering Emotional Intelligence",
  "lasting-interpersonal-relationships": "Building Lasting Interpersonal Relationships",
  "conflict-resolution-negotiation": "Conflict Resolution & Negotiation",
  "career-development-employability": "Career Development & Employability",
  "digital-literacy-and-etiquette": "Digital Literacy & Digital Etiquette",
  "adaptability-and-resilience": "Adaptability & Resilience",
  "leadership-and-self-leadership": "Leadership & Self-Leadership",
  "teamwork-and-collaboration": "Teamwork & Collaboration",
  "negotiation-mastery": "Mastering the Art of Negotiation",
  "entrepreneurial-mindset": "The Entrepreneurial Mindset",
  "presentation-and-public-speaking": "Presentation & Public Speaking",
};

const profileMap: Record<string, Array<{ slug: string; reason: string; action: string }>> = {
  "career-personality-profile": [
    { slug: "personal-growth-self-discovery", reason: "Turn self-understanding into a practical development plan.", action: "Choose one behaviour to practise in your next work or study week." },
    { slug: "personal-brand-strategy", reason: "Translate your strengths and work preferences into a credible professional presence.", action: "Draft three evidence-backed strengths for your profile or portfolio." },
    { slug: "effective-communication-essentials", reason: "Strengthen how your preferences show up in conversations and collaboration.", action: "Ask one trusted colleague for feedback on your communication impact." },
  ],
  "cognitive-reasoning-assessment": [
    { slug: "critical-thinking-problem-solving", reason: "Apply structured reasoning to ambiguous professional decisions.", action: "Write down the evidence, assumptions, and alternatives behind one decision." },
    { slug: "decision-making-skills", reason: "Convert analytical ability into repeatable decision discipline.", action: "Use a decision journal for your next consequential choice." },
    { slug: "creativity-and-innovation", reason: "Pair rigorous analysis with generative exploration and experimentation.", action: "Generate three alternatives before selecting your next solution." },
  ],
  "emotional-intelligence-profile": [
    { slug: "emotional-intelligence-mastery", reason: "Build deliberate habits for self-awareness, regulation, empathy, and relationships.", action: "Name the trigger, response, and preferred response after one difficult interaction." },
    { slug: "lasting-interpersonal-relationships", reason: "Strengthen trust and repair patterns in important working relationships.", action: "Schedule a purposeful listening conversation with someone you work with." },
    { slug: "conflict-resolution-negotiation", reason: "Use emotional signals to navigate tension constructively.", action: "Separate the relationship, interests, and practical issue in one live conflict." },
  ],
  "future-ready-employability-profile": [
    { slug: "career-development-employability", reason: "Turn your capability profile into evidence for employability and progression.", action: "Add one measurable achievement to your CV, portfolio, or LinkedIn profile." },
    { slug: "digital-literacy-and-etiquette", reason: "Build confident, responsible practice for modern digital work.", action: "Audit one digital workflow for clarity, security, and professional etiquette." },
    { slug: "adaptability-and-resilience", reason: "Strengthen your response to change, uncertainty, and setbacks.", action: "Run a small experiment that tests a new way of working." },
  ],
  "leadership-potential-profile": [
    { slug: "leadership-and-self-leadership", reason: "Translate leadership potential into visible ownership and influence.", action: "Define one outcome you will own and the behaviour that will signal progress." },
    { slug: "teamwork-and-collaboration", reason: "Make leadership effective through alignment, trust, and shared execution.", action: "Clarify roles, decision rights, and the next handoff in one team project." },
    { slug: "negotiation-mastery", reason: "Strengthen influence and stakeholder alignment in complex situations.", action: "Prepare interests, options, and a fair outcome before your next negotiation." },
  ],
  "career-interests-occupational-fit": [
    { slug: "career-development-employability", reason: "Turn interest signals into informed career exploration and evidence.", action: "Interview one person working in an area connected to your top interests." },
    { slug: "entrepreneurial-mindset", reason: "Explore opportunity, initiative, and value creation across occupational settings.", action: "Identify one unmet need and sketch a small test solution." },
    { slug: "presentation-and-public-speaking", reason: "Make your interests visible through confident communication and advocacy.", action: "Explain one area you want to explore in a two-minute recorded pitch." },
  ],
};

export function getPsychometricCourseRecommendations(report: Pick<PsychometricReport, "testSlug">): PsychometricCourseRecommendation[] {
  return (profileMap[report.testSlug] ?? []).flatMap((item) => courseTitles[item.slug] ? [{ ...item, title: courseTitles[item.slug] }] : []);
}
