import { SiteNavigation } from "@/components/SiteNavigation";

type TransformationSection =
  | "assessment"
  | "careerpath"
  | "psychometrics"
  | "courses";

const sectionLabels: Record<TransformationSection, string> = {
  assessment: "Self Assessment",
  careerpath: "CareerPath",
  psychometrics: "Psychometrics",
  courses: "Courses",
};

export function TransformationNav({
  active,
}: {
  active: TransformationSection;
}) {
  return (
    <SiteNavigation
      variant="journey"
      activeSection={active}
      contextLabel={sectionLabels[active]}
    />
  );
}
