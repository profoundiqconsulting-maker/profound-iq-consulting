import { readFileSync, writeFileSync } from "node:fs";

const filePath = "client/src/pages/CareerPath.tsx";
const content = readFileSync(filePath, "utf8");

// 1. Add import for PaystackInlineModal
let result = content.replace(
  'import { useLocale } from "@/contexts/LocaleContext";',
  'import { useLocale } from "@/contexts/LocaleContext";\nimport PaystackInlineModal, { type PaystackInlineProduct } from "@/components/PaystackInlineModal";'
);

// 2. Add state variables after paymentState
result = result.replace(
  '  const [paymentState, setPaymentState] =\n    useState<PaystackCheckoutState>("idle");',
  '  const [paymentState, setPaymentState] =\n    useState<PaystackCheckoutState>("idle");\n  const [inlineModalOpen, setInlineModalOpen] = useState(false);\n  const [inlineProduct, setInlineProduct] = useState<PaystackInlineProduct | null>(null);'
);

// 3. Add initializeInlinePayment mutation after initializePayment
result = result.replace(
  '  const initializePayment = trpc.careerPath.initializePayment.useMutation();',
  '  const initializePayment = trpc.careerPath.initializePayment.useMutation();\n  const initializeInlinePayment = trpc.careerPath.initializeInlinePayment.useMutation();'
);

// 4. Update beginPayment to use inline payment
result = result.replace(
  `      const result = await initializePayment.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        personalNotes: personalNotes.trim() || undefined,
        receiptTitle: receiptTitle.trim() || undefined,
        consent: true,
        answers,
      });
      setReceiptPreviewOpen(false);
      setPaymentState(paystackStateAfter("ready"));
      toast.success("Checkout ready", {
        description: paystackCheckoutCopy.redirecting.description,
      });
      window.location.assign(result.authorizationUrl);`,
  `      const result = await initializeInlinePayment.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        personalNotes: personalNotes.trim() || undefined,
        receiptTitle: receiptTitle.trim() || undefined,
        consent: true,
        answers,
      });
      setReceiptPreviewOpen(false);
      setPaymentState(paystackStateAfter("ready"));
      setInlineProduct({
        accessCode: result.accessCode,
        reference: result.reference,
        amountKes: result.amountKes,
        productName: result.productName,
        productType: result.productType,
      });
      setInlineModalOpen(true);`
);

// 5. Find where to insert the modal - before function CareerPathReportView
const marker = "\nfunction CareerPathReportView(";
const markerIndex = result.indexOf(marker);
if (markerIndex === -1) {
  console.error("Could not find CareerPathReportView marker");
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

result = result.slice(0, markerIndex) + modalJSX + result.slice(markerIndex);

writeFileSync(filePath, result);
console.log("Fixed CareerPath.tsx");
