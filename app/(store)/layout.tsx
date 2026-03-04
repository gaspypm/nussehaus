import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "Nüsse Haus — Alimentos naturales",
        template: "%s — Nüsse Haus",
    },
    description:
        "Frutos secos y productos naturales en Esperanza, Santa Fe. Pedí fácil por WhatsApp.",
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL
        ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
        : undefined,
    openGraph: {
        title: "Nüsse Haus — Alimentos naturales",
        description:
            "Frutos secos y productos naturales en Esperanza, Santa Fe. Pedí fácil por WhatsApp.",
        type: "website",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function StoreLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="es" className="h-full">
            <body className="min-h-full bg-[#0E0F10] text-[#F4F1EA] antialiased">
                {children}
            </body>
        </html>
    );
}