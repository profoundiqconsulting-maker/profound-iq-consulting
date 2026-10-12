/**
 * WebMCP (Web Model Context Protocol) progressive enhancement.
 *
 * WebMCP is an experimental, W3C-draft, Chrome-only API (behind a flag /
 * origin trial; Firefox and Safari have no timeline). It lets a page register
 * structured, read-only tools that AI agents can call instead of scraping the
 * DOM.
 *
 * This module is strictly additive and safe:
 *  - It feature-detects the API and is a no-op on browsers without it.
 *  - Every tool is read-only (no navigation, no submission, no state change).
 *  - Registration is wrapped in try/catch so it can never break the page.
 *
 * The imperative API is paired with declarative `toolname`/`tooldescription`
 * attributes on the public forms (Contact, Blog newsletter, Home inquiry).
 */
type JsonSchema = {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
  description?: string;
};

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  annotations?: Record<string, boolean>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

type ModelContext = {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void;
};

const SERVICES = [
  { name: "Transformation services", path: "/services" },
  { name: "School solutions", path: "/school-solutions" },
  { name: "Professional courses", path: "/courses" },
  { name: "Self assessment", path: "/assessment" },
  { name: "Psychometrics", path: "/psychometrics" },
  { name: "Career path", path: "/careerpath" },
];

const CONTACT = {
  email: "admin@profoundiqconsulting.com",
  phone: "+254 727 374 055",
  whatsapp: "https://wa.me/254727374055",
  contactPage: "/contact",
};

function buildTools(): WebMcpTool[] {
  const emptyInput: JsonSchema = {
    type: "object",
    properties: {},
    additionalProperties: false,
  };

  return [
    {
      name: "get_services_overview",
      description:
        "List Profound IQ Consulting's service lines with the page path to each, for answering questions about what the company offers.",
      inputSchema: emptyInput,
      annotations: { readOnlyHint: true },
      execute: async () => ({
        organisation: "Profound IQ Consulting",
        summary:
          "Transformational learning, educational consulting, school improvement, psychometric insight, and professional development.",
        services: SERVICES,
      }),
    },
    {
      name: "get_contact_info",
      description:
        "Return the ways to contact Profound IQ Consulting (email, phone, WhatsApp, and the contact page URL).",
      inputSchema: emptyInput,
      annotations: { readOnlyHint: true },
      execute: async () => ({
        ...CONTACT,
        responseTime: "Replies within 24 hours on weekdays.",
      }),
    },
  ];
}

export function registerWebMcpTools() {
  if (typeof document === "undefined") return;
  // Chrome 150 moved the API to document.modelContext; older Chrome exposes
  // navigator.modelContext. Feature-detect both.
  const modelContext =
    (document as unknown as { modelContext?: ModelContext }).modelContext ??
    (navigator as unknown as { modelContext?: ModelContext }).modelContext;

  if (!modelContext || typeof modelContext.registerTool !== "function") {
    return;
  }

  try {
    const controller = new AbortController();
    for (const tool of buildTools()) {
      modelContext.registerTool(tool, { signal: controller.signal });
    }
  } catch {
    // WebMCP is experimental — never let registration break the page.
  }
}
