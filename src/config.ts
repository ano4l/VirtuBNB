const configuredWhatsAppUrl = process.env.EXPO_PUBLIC_WHATSAPP_URL?.trim();

export const whatsappConfig = {
  isConfigured: Boolean(configuredWhatsAppUrl),
  url: configuredWhatsAppUrl || 'https://wa.me/?text=Hello%20VirtuHost%2C%20what%20is%20happening%20today%3F',
};

export function whatsappCommandUrl(command: string) {
  if (whatsappConfig.isConfigured) {
    const separator = whatsappConfig.url.includes('?') ? '&' : '?';
    return `${whatsappConfig.url}${separator}text=${encodeURIComponent(command)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(command)}`;
}
