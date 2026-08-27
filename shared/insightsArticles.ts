export type InsightArticle = {
  slug: string;
  index: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  accent: string;
  status: "Draft preview";
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

export const insightArticles: InsightArticle[] = [
  {
    slug: "first-90-days-school-improvement-conversation",
    index: "01",
    category: "Education leadership",
    title: "The first 90 days of a school-improvement conversation",
    excerpt: "A practical guide for framing priorities, listening well, and turning a broad ambition into a sequence of useful decisions.",
    readTime: "6 min read",
    accent: "Listen before you prescribe.",
    status: "Draft preview",
    sections: [
      { heading: "Begin with the conditions for a useful conversation", paragraphs: ["School improvement conversations become more productive when the first task is not to announce a solution. It is to understand the conditions in which people are already teaching, leading, and learning.", "A strong opening makes room for the school’s existing knowledge: what is working, where energy is being lost, and which questions staff and learners are already carrying. Listening is not a pause before action. It is the first form of action because it improves the quality of the decisions that follow."] },
      { heading: "Turn ambition into a small number of priorities", paragraphs: ["A school may have many legitimate priorities, but an improvement conversation needs a manageable centre of gravity. Use evidence, stakeholder perspective, and the school’s strategic intent to identify the few changes that can make other work easier.", "The most useful priority is specific enough to guide behaviour and broad enough to matter. It should help people decide what to do next week, what to monitor, and what to stop doing for now."] },
      { heading: "Design the first 90 days as a learning cycle", paragraphs: ["The first 90 days should not be treated as a test of whether a complete plan was correct. Treat the period as a cycle of purposeful experiments, visible check-ins, and disciplined reflection.", "Agree what will be tried, who needs to be involved, what signals will be observed, and when the group will revisit its assumptions. This turns improvement from a slogan into a shared practice."] },
      { heading: "A question to carry forward", paragraphs: ["What would teachers, learners, and families notice if this priority were genuinely becoming part of everyday practice? The answer can become a practical compass for the next conversation."] },
    ],
  },
  {
    slug: "curriculum-intent-reaches-classroom",
    index: "02",
    category: "Learning design",
    title: "When curriculum intent reaches the classroom",
    excerpt: "A field note on the bridge between curriculum language, teacher practice, and the learner experience that emerges in real settings.",
    readTime: "8 min read",
    accent: "Make the intended experience visible.",
    status: "Draft preview",
    sections: [
      { heading: "Intent is only the beginning", paragraphs: ["Curriculum documents describe what a system values, but learners experience those values through the choices made in classrooms. The distance between a stated intention and a lived experience is therefore an important design question.", "A curriculum becomes more coherent when teachers can see how its principles translate into routines, examples, tasks, feedback, and opportunities for learners to think independently."] },
      { heading: "Translate language into observable practice", paragraphs: ["Words such as inquiry, creativity, depth, and inclusion become useful when a teacher can recognise them in action. What does the learner do? What does the teacher notice? Which resource or question makes the intention visible?", "This translation does not require every classroom to look the same. It requires the professional team to share enough language to compare experiences, learn from one another, and improve deliberately."] },
      { heading: "Use evidence that respects complexity", paragraphs: ["Evidence of curriculum enactment can include learner work, classroom dialogue, planning decisions, assessment patterns, and student reflection. No single measure tells the whole story.", "The goal is not to create another compliance exercise. It is to create a useful mirror that helps teachers identify where the intended learning experience is already strong and where a small adjustment may unlock greater depth."] },
      { heading: "A question to carry forward", paragraphs: ["If a learner described today’s lesson without using the curriculum’s formal language, what would they say they were learning to do? That description can reveal whether curriculum intent is reaching the lived experience."] },
    ],
  },
  {
    slug: "better-question-next-professional-move",
    index: "03",
    category: "Professional growth",
    title: "A better question for your next professional move",
    excerpt: "A reflective piece about capability, confidence, and the small experiments that make purposeful change easier to sustain.",
    readTime: "5 min read",
    accent: "Move from reflection to a next action.",
    status: "Draft preview",
    sections: [
      { heading: "Move beyond the title of the next role", paragraphs: ["When people think about a professional move, they often begin with a title, sector, or destination. Those questions matter, but they can hide a more useful starting point: what kind of capability do you want to practise more often?", "Capability-focused reflection creates options. It allows a person to notice patterns in the work that gives them energy and the conditions in which their contribution becomes most useful."] },
      { heading: "Separate confidence from readiness", paragraphs: ["Confidence can grow after action as well as before it. Waiting to feel completely ready can make a meaningful experiment seem further away than it is.", "A small, bounded experiment—facilitating a meeting, shadowing a colleague, testing a new workflow, or requesting specific feedback—can produce evidence that is more useful than a general self-judgement."] },
      { heading: "Create a next action with a learning question", paragraphs: ["A next action becomes more powerful when paired with a learning question. Instead of asking only whether the action succeeded, ask what it revealed about your strengths, preferences, and development needs.", "This approach turns career movement into an iterative practice. You are not required to predict the entire route. You are choosing the next step that will improve your understanding of the route."] },
      { heading: "A question to carry forward", paragraphs: ["What is one capability you would like your next professional chapter to make more visible, and what small experiment could help you practise it this month?"] },
    ],
  },
];

export function getInsightArticle(slug: string | undefined) {
  return insightArticles.find((article) => article.slug === slug);
}
