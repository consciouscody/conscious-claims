const defaultLocalSecret = "local-dev-jwt-secret-not-for-shared-use";

export const ENV = {
  appId: process.env.VITE_APP_ID || "local-dev",
  cookieSecret: process.env.JWT_SECRET || defaultLocalSecret,
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiBaseUrl: process.env.OPENAI_BASE_URL ?? "",
  openAiModel: process.env.OPENAI_MODEL ?? "",
};
