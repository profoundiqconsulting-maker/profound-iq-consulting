import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/profound-iq-consulting";
const files = [
  "client/src/lib/illustrationStudySheet.ts",
  "client/src/pages/CareerPath.tsx",
  "client/src/pages/Assessment.tsx",
  "client/src/pages/Auth.tsx",
  "client/src/pages/UserDashboard.tsx",
  "client/src/pages/CourseWorkspace.tsx",
  "client/src/components/TranslationFeedback.tsx",
  "client/src/components/AdminCourseShareAnalytics.tsx",
  "client/src/components/CourseShareActions.tsx",
  "client/src/components/TransformationNav.tsx",
];

for (const relative of files) {
  const file = path.join(root, relative);
  let source = fs.readFileSync(file, "utf8");
  if (!source.includes("PUBLISHED_SITE_ORIGIN")) {
    const firstImportEnd = source.indexOf("\n", source.indexOf("import "));
    source = `${source.slice(0, firstImportEnd + 1)}import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";\n${source.slice(firstImportEnd + 1)}`;
  }
  source = source.replaceAll("window.location.origin", "PUBLISHED_SITE_ORIGIN");
  source = source.replaceAll("location.origin", "PUBLISHED_SITE_ORIGIN");
  source = source.replaceAll(
    'typeof window !== "undefined" ? PUBLISHED_SITE_ORIGIN : "https://profoundiq-vguqrhsm.manus.space"',
    "PUBLISHED_SITE_ORIGIN"
  );
  fs.writeFileSync(file, source);
}

const routerFile = path.join(root, "server/routers.ts");
let router = fs.readFileSync(routerFile, "utf8");
if (
  !router.includes(
    'import { PUBLISHED_SITE_ORIGIN } from "../shared/siteOrigin";'
  )
) {
  router = router.replace(
    'import { buildCoursePaymentSuccessPath } from "../shared/coursePaymentRouting";\n',
    'import { buildCoursePaymentSuccessPath } from "../shared/coursePaymentRouting";\nimport { PUBLISHED_SITE_ORIGIN } from "../shared/siteOrigin";\n'
  );
}
router = router.replace(
  'const PUBLIC_SITE_ORIGIN = (process.env.PUBLIC_SITE_ORIGIN || "https://profoundiq-vguqrhsm.manus.space").replace(/\\\/$/, "");',
  "const PUBLIC_SITE_ORIGIN = PUBLISHED_SITE_ORIGIN;"
);
router = router.replace(
  /const originHeader = ctx\.req\.headers\.origin;\n\s*const origin = typeof originHeader === "string" \? originHeader : PUBLIC_SITE_ORIGIN;/g,
  "const origin = PUBLIC_SITE_ORIGIN;"
);
router = router.replace(
  /const originHeader = ctx\.req\.headers\.origin;\n\s*const origin = typeof originHeader === "string" \? originHeader : "https:\/\/profoundiq-vguqrhsm\.manus\.space";/g,
  "const origin = PUBLIC_SITE_ORIGIN;"
);
router = router.replace(
  /const verificationOrigin = typeof ctx\.req\.headers\.origin === "string" \? ctx\.req\.headers\.origin : "https:\/\/profoundiq-vguqrhsm\.manus\.space";/g,
  "const verificationOrigin = PUBLIC_SITE_ORIGIN;"
);
fs.writeFileSync(routerFile, router);
