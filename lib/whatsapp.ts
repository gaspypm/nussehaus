const WHATSAPP_NUMBER = "5493496466524";

export function buildWhatsAppLink(message: string) {
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}