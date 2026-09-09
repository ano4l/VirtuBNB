export type WhatsAppTextMessage = {
  id: string;
  from: string;
  timestamp: string;
  type: "text";
  text: { body: string };
};

export type WhatsAppImageMessage = {
  id: string;
  from: string;
  timestamp: string;
  type: "image";
  image: { id: string; caption?: string; mime_type?: string; sha256?: string };
};

export type WhatsAppInboundMessage = WhatsAppTextMessage | WhatsAppImageMessage;

export type WhatsAppWebhook = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        messages?: WhatsAppInboundMessage[];
      };
    }>;
  }>;
};

import { z } from "zod";

const envelope = z.object({
  object: z.literal("whatsapp_business_account"),
  entry: z.array(z.object({
    changes: z.array(z.object({
      field: z.string(),
      value: z.object({ messages: z.array(z.unknown()).optional() }),
    })),
  })),
});
const base = { id: z.string().min(1).max(256), from: z.string().regex(/^\d{8,15}$/), timestamp: z.string() };
const messageSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("text"), text: z.object({ body: z.string().min(1).max(4096) }) }),
  z.object({ ...base, type: z.literal("image"), image: z.object({ id: z.string().min(1).max(256), caption: z.string().max(4096).optional() }) }),
]);

export function extractMessages(payload: unknown): WhatsAppInboundMessage[] {
  const validated = envelope.parse(payload);
  return (
    validated.entry.flatMap((entry) =>
      entry.changes.filter((change) => change.field === "messages").flatMap((change) => change.value.messages ?? []),
    ).flatMap((message) => {
      const result = messageSchema.safeParse(message);
      return result.success ? [result.data as WhatsAppInboundMessage] : [];
    })
  );
}
