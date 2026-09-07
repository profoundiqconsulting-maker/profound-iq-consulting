import { readFileSync, writeFileSync } from "node:fs";

function fixFile(filePath, fixes) {
  const content = readFileSync(filePath, "utf8");
  let result = content;
  for (const [oldStr, newStr] of fixes) {
    if (!result.includes(oldStr)) {
      console.error(
        `Pattern not found in ${filePath}: ${oldStr.slice(0, 60)}...`
      );
      process.exit(1);
    }
    result = result.replace(oldStr, newStr);
  }
  writeFileSync(filePath, result);
  console.log(`Fixed ${filePath}`);
}

// 1. Fix server/paystackWebhook.ts - add missing import
fixFile("server/paystackWebhook.ts", [
  [
    'import { emailAssessmentReportIfNeeded, emailCareerPathReportIfNeeded, emailPsychometricReportIfNeeded, sendPaymentReceiptEmail } from "./email";',
    'import { emailAssessmentReportIfNeeded, emailCareerPathReportIfNeeded, emailPsychometricReportIfNeeded, sendPaymentReceiptEmail } from "./email";\nimport { PUBLISHED_SITE_ORIGIN } from "../shared/siteOrigin";',
  ],
]);

// 2. Fix server/reportPdf.ts - add missing import
fixFile("server/reportPdf.ts", [
  [
    'import { existsSync } from "node:fs";',
    'import { existsSync, readFileSync } from "node:fs";',
  ],
]);

// 3. Fix Assessment.tsx - cast productType
fixFile("client/src/pages/Assessment.tsx", [
  [
    "productType: result.productType,",
    'productType: result.productType as "assessment",',
  ],
]);

// 4. Fix Psychometrics.tsx - cast productType
fixFile("client/src/pages/Psychometrics.tsx", [
  [
    "productType: result.productType,",
    'productType: result.productType as "psychometric",',
  ],
]);

// 5. Fix CareerPath.tsx - multiple fixes
const careerPath = readFileSync("client/src/pages/CareerPath.tsx", "utf8");

// 5a. Cast productType
let cp = careerPath.replace(
  "productType: result.productType,",
  'productType: result.productType as "careerpath",'
);

// 5b. Remove the orphaned PaystackInlineModal from inside CareerPathReportView
// Find the block after </main> inside CareerPathReportView and remove the modal
const modalBlockStart = cp.indexOf("      <PaystackInlineModal");
const modalBlockEnd = cp.indexOf("    </div>\n  );\n}", modalBlockStart);
if (modalBlockStart === -1 || modalBlockEnd === -1) {
  console.error("Could not find modal block in CareerPath.tsx");
  process.exit(1);
}
const beforeModal = cp.slice(0, modalBlockStart);
const afterModal = cp.slice(modalBlockEnd + "    </div>\n  );\n}".length);
cp = beforeModal + afterModal;

// Now add the modal inside CareerPath component, before the closing </main>
// Find the CareerPath return ending: </main>\n    </div>\n  );\n}\n\nfunction CareerPathReportView
const careerPathEnd = cp.indexOf("  );\n}\n\nfunction CareerPathReportView");
if (careerPathEnd === -1) {
  console.error("Could not find CareerPath ending in CareerPath.tsx");
  process.exit(1);
}

const modalJSX = `      <PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail={user?.email ?? ""}
        onClose={() => {
          setInlineModalOpen(false);
          setInlineProduct(null);
        }}
        onSuccess={(reference) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          setPaymentState("verifying");
          verify.mutate({ reference }, {
            onSuccess: (result) => {
              setReport(result.report);
              setPaymentState("paid");
              toast.success("Payment verified");
            },
            onError: (error) => {
              setPaymentState("error");
              setVerificationError(error.message);
              toast.error(error.message);
            },
          });
        }}
        onError={(message) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          setPaymentState("error");
          setVerificationError(message);
          toast.error("Payment failed", { description: message });
        }}
      />
`;

cp = cp.slice(0, careerPathEnd) + modalJSX + cp.slice(careerPathEnd);

writeFileSync("client/src/pages/CareerPath.tsx", cp);
console.log("Fixed CareerPath.tsx");

// 6. Fix CourseWorkspace.tsx - fix modal and cast productType
const courseWorkspace = readFileSync(
  "client/src/pages/CourseWorkspace.tsx",
  "utf8"
);

// 6a. Cast productType
let cw = courseWorkspace.replace(
  "productType: result.productType,",
  'productType: result.productType as "course_stage",'
);

// 6b. Fix the PaystackInlineModal to use correct variables for CourseWorkspace
const oldModal = `<PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail={email}
        onClose={() => { setInlineModalOpen(false); setInlineProduct(null); }}
        onSuccess={(reference) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          setPaymentState(paystackStateAfter("verify"));
          verifyMutation.mutate({ reference }, { onSuccess: () => { void courseState.refetch(); setPaymentPending(false); window.history.replaceState({}, "", window.location.pathname); toast.success("Payment verified", { description: "Your course access is updated." }); }, onError: (error) => { setPaymentState(paystackStateAfter("failure")); toast.error(error.message); } });
        }}
        onError={(message) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          setPaymentState(paystackStateAfter("failure"));
          toast.error("Payment failed", { description: message });
        }}
      />`;

const newModal = `<PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail={user?.email ?? identityEmail ?? ""}
        onClose={() => { setInlineModalOpen(false); setInlineProduct(null); }}
        onSuccess={(reference) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          verifyMutation.mutate({ reference }, { onSuccess: () => { void courseState.refetch(); toast.success("Payment verified", { description: "Your course access is updated." }); }, onError: (error) => toast.error(error.message) });
        }}
        onError={(message) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          toast.error("Payment failed", { description: message });
        }}
      />`;

if (!cw.includes(oldModal)) {
  console.error("Could not find old modal in CourseWorkspace.tsx");
  process.exit(1);
}
cw = cw.replace(oldModal, newModal);

writeFileSync("client/src/pages/CourseWorkspace.tsx", cw);
console.log("Fixed CourseWorkspace.tsx");

console.log("All fixes applied.");
