import { config as dotenv } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

dotenv({ path: fileURLToPath(new URL("../../../.env", import.meta.url)), quiet: true });

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4100),
    DATABASE_PATH: z.string().optional(),
    PROPERTY_PROVIDER: z.enum(["fake", "nextpax"]).default("fake"),
    NEXTPAX_BASE_URL: z.string().url().optional(),
    NEXTPAX_API_TOKEN: z.string().min(16).optional(),
    AI_PROVIDER: z.enum(["disabled", "openai"]).default("disabled"),
    OPENAI_API_KEY: z.string().min(20).optional(),
    OPENAI_MODEL: z.literal("gpt-5.6-luna").default("gpt-5.6-luna"),
    OPENAI_REASONING_EFFORT: z.enum(["none", "low", "medium", "high", "xhigh", "max"]).default("low"),
    WHATSAPP_VERIFY_TOKEN: z.string().min(8).default("virtuhost-dev-verify"),
    WHATSAPP_TRANSPORT: z.enum(["demo", "cloud"]).default("demo"),
    WHATSAPP_ACCESS_TOKEN: z.string().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
    WHATSAPP_GRAPH_API_VERSION: z.string().regex(/^v\d+\.\d+$/).optional(),
    META_APP_SECRET: z.string().optional(),
    HOST_API_TOKEN: z.string().min(24).optional(),
    HOST_WHATSAPP_NUMBERS: z.string().regex(/^\d{8,15}(,\d{8,15})*$/).optional(),
  })
  .superRefine((value, context) => {
    if (value.PROPERTY_PROVIDER === "nextpax") {
      if (!value.NEXTPAX_BASE_URL) context.addIssue({ code: "custom", path: ["NEXTPAX_BASE_URL"], message: "Required when PROPERTY_PROVIDER is nextpax" });
      if (!value.NEXTPAX_API_TOKEN) context.addIssue({ code: "custom", path: ["NEXTPAX_API_TOKEN"], message: "Required when PROPERTY_PROVIDER is nextpax" });
    }
    if (value.AI_PROVIDER === "openai" && !value.OPENAI_API_KEY) {
      context.addIssue({ code: "custom", path: ["OPENAI_API_KEY"], message: "Required when AI_PROVIDER is openai" });
    }
    if (value.WHATSAPP_TRANSPORT === "cloud") {
      for (const field of ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_GRAPH_API_VERSION", "META_APP_SECRET", "HOST_API_TOKEN", "HOST_WHATSAPP_NUMBERS"] as const) {
        if (!value[field]) context.addIssue({ code: "custom", path: [field], message: "Required for cloud transport" });
      }
    }
    if (value.NODE_ENV === "production" && !value.META_APP_SECRET) {
      context.addIssue({ code: "custom", path: ["META_APP_SECRET"], message: "Required in production" });
    }
    if (value.NODE_ENV === "production") {
      context.addIssue({ code: "custom", message: "This single-host development slice is not ready for production. Tenant isolation and durable job processing are required." });
    }
  });

export type AppConfig = z.infer<typeof schema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return schema.parse(Object.fromEntries(Object.entries(environment).filter(([, value]) => value !== "")));
}
