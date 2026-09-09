import { config as dotenv } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

dotenv({ path: fileURLToPath(new URL("../../../.env", import.meta.url)), quiet: true });

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4100),
    DATABASE_PATH: z.string().optional(),
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
