import type { Metadata } from "next";
import Storefront from "./Storefront";

export const metadata: Metadata = {
    title: "Nüsse Haus — Alimentos naturales",
    description:
        "Frutos secos y productos naturales en Esperanza, Santa Fe. Pedidos por WhatsApp.",
    robots: { index: true, follow: true },
    openGraph: {
        title: "Nüsse Haus — Alimentos naturales",
        description:
            "Frutos secos y productos naturales en Esperanza, Santa Fe. Pedidos por WhatsApp.",
        type: "website",
    },
};

type Variant = {
    id: string;
    label: string;
    unit: "g" | "ml";
    amount: number;
    price_cents: number;
    stock_qty?: number;
    is_available: boolean;
    sort_order: number;
};

type Product = {
    id: string;
    name: string;
    slug: string;
    short_description?: string;
    long_description?: string;
    images: string[];
    is_active: boolean;
    sort_order: number;
    variants: Variant[];
};

const cloudinaryUrl = (publicIdOrUrl: string) => {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloud) return publicIdOrUrl;
    if (/^https?:\/\//i.test(publicIdOrUrl)) return publicIdOrUrl;
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_1600/${publicIdOrUrl}`;
};

function mockProducts(): Product[] {
    const img = (pid: string) => cloudinaryUrl(pid);

    return [
        {
            id: "p1",
            name: "Almendras",
            slug: "almendras",
            short_description: "Clásicas y crocantes.",
            long_description:
                "Almendras seleccionadas. Ideales para snack, granola o recetas.",
            images: [img("nussehaus/mock/almendras_1"), img("nussehaus/mock/almendras_2")],
            is_active: true,
            sort_order: 1,
            variants: [
                { id: "v1", label: "250 g", unit: "g", amount: 250, price_cents: 420000, stock_qty: 18, is_available: true, sort_order: 1 },
                { id: "v2", label: "500 g", unit: "g", amount: 500, price_cents: 780000, stock_qty: 6, is_available: true, sort_order: 2 },
            ],
        },
        {
            id: "p2",
            name: "Nueces",
            slug: "nueces",
            short_description: "Mitades y trozos.",
            long_description:
                "Nueces seleccionadas para repostería, yogur o snacks.",
            images: [img("nussehaus/mock/nueces_1"), img("nussehaus/mock/nueces_2")],
            is_active: true,
            sort_order: 2,
            variants: [
                { id: "v3", label: "250 g", unit: "g", amount: 250, price_cents: 520000, stock_qty: 8, is_available: true, sort_order: 1 },
                { id: "v4", label: "500 g", unit: "g", amount: 500, price_cents: 980000, stock_qty: 0, is_available: false, sort_order: 2 },
            ],
        },
        {
            id: "p3",
            name: "Castañas tostadas",
            slug: "castanas-tostadas",
            short_description: "Suaves y aromáticas.",
            long_description:
                "Castañas listas para comer. Excelente snack o para sumar a platos cálidos.",
            images: [img("nussehaus/mock/castanas_1")],
            is_active: true,
            sort_order: 3,
            variants: [
                { id: "v5", label: "200 g", unit: "g", amount: 200, price_cents: 690000, stock_qty: 4, is_available: true, sort_order: 1 },
            ],
        },
        {
            id: "p4",
            name: "Almendras con chocolate (leche)",
            slug: "almendras-chocolate-leche",
            short_description: "Para café o regalo.",
            long_description:
                "Almendras bañadas en chocolate con leche. Textura y sabor equilibrados.",
            images: [img("nussehaus/mock/choco_leche_1")],
            is_active: true,
            sort_order: 4,
            variants: [
                { id: "v6", label: "150 g", unit: "g", amount: 150, price_cents: 620000, stock_qty: 12, is_available: true, sort_order: 1 },
                { id: "v7", label: "300 g", unit: "g", amount: 300, price_cents: 1140000, stock_qty: 3, is_available: true, sort_order: 2 },
            ],
        },
        {
            id: "p5",
            name: "Ghee",
            slug: "ghee",
            short_description: "Manteca clarificada.",
            long_description:
                "Ghee artesanal: alto punto de humo, ideal para cocinar.",
            images: [img("nussehaus/mock/ghee_1"), img("nussehaus/mock/ghee_2")],
            is_active: true,
            sort_order: 5,
            variants: [
                { id: "v8", label: "250 ml", unit: "ml", amount: 250, price_cents: 890000, stock_qty: 5, is_available: true, sort_order: 1 },
            ],
        },
        {
            id: "p6",
            name: "Mix Premium",
            slug: "mix-premium",
            short_description: "Temporalmente agotado.",
            long_description:
                "Mix premium de frutos secos. Volverá a estar disponible pronto.",
            images: [img("nussehaus/mock/mix_premium_1")],
            is_active: true,
            sort_order: 6,
            variants: [
                { id: "v9", label: "250 g", unit: "g", amount: 250, price_cents: 0, stock_qty: 0, is_available: false, sort_order: 1 },
            ],
        },
    ];
}

export default async function Page() {
    const products = mockProducts()
        .filter((p) => p.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);

    return <Storefront initialProducts={products} />;
}