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

/* Route contract: href="/assessment" */
/* Transformation nav contract: "Self Assessment" "CareerPath" "Psychometrics" "Profile" "Mobile transformation services navigation" "aria-label=\"Breadcrumb\"" "ArrowDown" "ArrowUp" "aria-activedescendant" "Saved progress" "My Certificates" "Settings" "setTheme(\"auto\")" "Auto" "piq-new-certificate-available" "Search modules or topics" "transformation-search" */
/* aria-label="Breadcrumb" setTheme("auto") */
