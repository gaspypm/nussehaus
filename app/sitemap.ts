import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

type ProductRow = {
    slug: string;
    updated_at: string | null;
    is_active: boolean;
};

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://nussehaus.com").replace(/\/$/, "");

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;

    return createClient(url, anon, { auth: { persistSession: false } });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_URL}/productos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },

        { url: `${SITE_URL}/categorias`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
        { url: `${SITE_URL}/categorias/frutos-secos`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
        { url: `${SITE_URL}/categorias/frutas-deshidratadas`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
        { url: `${SITE_URL}/categorias/mixes`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
        { url: `${SITE_URL}/categorias/chocolateados`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
        { url: `${SITE_URL}/categorias/hongos`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },

        { url: `${SITE_URL}/envios`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE_URL}/preguntas-frecuentes`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

        { url: `${SITE_URL}/llms.txt`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    ];

    const supabase = getSupabase();
    if (!supabase) return staticRoutes;

    const { data, error } = await supabase
        .from("products")
        .select("slug, updated_at, is_active")
        .eq("is_active", true);

    if (error || !data) return staticRoutes;

    const productRoutes: MetadataRoute.Sitemap = (data as ProductRow[])
        .filter((p) => p.slug)
        .map((p) => ({
            url: `${SITE_URL}/product/${p.slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.8,
        }));

    return [...staticRoutes, ...productRoutes];
}