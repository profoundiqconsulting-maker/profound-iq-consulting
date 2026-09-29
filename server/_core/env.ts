export const ENV = {
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",

  // Session & Auth
  sessionSecret: process.env.SESSION_SECRET ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  port: parseInt(process.env.PORT ?? "3000"),

  // Storage (DigitalOcean Spaces S3-compatible)
  doSpacesEndpoint: process.env.DO_SPACES_ENDPOINT ?? "",
  doSpacesRegion: process.env.DO_SPACES_REGION ?? "",
  doSpacesBucket: process.env.DO_SPACES_BUCKET ?? "",
  doSpacesAccessKey: process.env.DO_SPACES_ACCESS_KEY ?? "",
  doSpacesSecretKey: process.env.DO_SPACES_SECRET_KEY ?? "",
  doSpacesBaseUrl: process.env.DO_SPACES_BASE_URL ?? "", // e.g., https://my-bucket.nyc3.digitaloceanspaces.com

  // Paystack
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY ?? "",

  // Email (Resend)
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "noreply@profoundiq.com",

  // LLM provider (OpenAI-compatible chat completions API)
  llmApiUrl: process.env.LLM_API_URL ?? "https://api.openai.com",
  llmApiKey: process.env.LLM_API_KEY ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",

  // Environment
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};
