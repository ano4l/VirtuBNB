export interface WhatsAppTransport {
  sendText(to: string, body: string): Promise<void>;
}

export class DemoWhatsAppTransport implements WhatsAppTransport {
  async sendText(to: string, body: string): Promise<void> {
    console.info("[whatsapp-demo] Reply prepared", { characters: body.length });
  }
}

export class CloudWhatsAppTransport implements WhatsAppTransport {
  constructor(
    private readonly accessToken: string,
    private readonly phoneNumberId: string,
    private readonly graphApiVersion: string,
  ) {}

  async sendText(to: string, body: string): Promise<void> {
    const response = await fetch(
      `https://graph.facebook.com/${this.graphApiVersion}/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`WhatsApp send failed (${response.status})`);
    }
  }
}
