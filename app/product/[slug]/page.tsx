import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { formatARSFromCents } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type ProductImage = { id: string; url: string; sort_order: number | null };
type ProductVariant = {
    id: string;
    label: string;
    unit: string;
    amount: number;
    price_cents: number;
    stock_qty: number | null;
    is_available: boolean;
    sort_order: number | null;
};

type Product = {
    id: string;
    slug: string;
    name: string;
    short_description: string | null;
    description: string | null;
    is_active: boolean;
    sort_order: number | null;
    product_images: ProductImage[];
    product_variants: ProductVariant[];
};

type ProductSlugRow = { slug: string };

type ProductQueryRow = {
    id: string;
    slug: string;
    name: string;
    short_description: string | null;
    description: string | null;
    is_active: boolean;
    sort_order: number | null;
    product_images: ProductImage[] | null;
    product_variants: ProductVariant[] | null;
};

async function getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("products")
        .select(
            `
        id, slug, name, short_description, description, is_active, sort_order,
        product_images ( id, url, sort_order ),
        product_variants ( id, label, unit, amount, price_cents, stock_qty, is_available, sort_order )
      `
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

    if (error || !data) return null;

    const row = data as unknown as ProductQueryRow;

    const images = (row.product_images ?? [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    const variants = (row.product_variants ?? [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    return {
        ...row,
        product_images: images,
        product_variants: variants,
    };
}

export async function generateMetadata(
    { params }: { params: { slug: string } }
): Promise<Metadata> {
    const product = await getProductBySlug(params.slug);
    if (!product) {
        return {
            title: "Producto no encontrado — Nüsse Haus",
            robots: { index: false, follow: false },
        };
    }

    const title = `${product.name} — Nüsse Haus`;
    const description =
        product.short_description ?? "Producto disponible en Nüsse Haus.";

    const ogImage = product.product_images?.[0]?.url;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
    };
}

export default async function ProductPage({
    params,
}: {
    params: { slug: string };
}) {
    const product = await getProductBySlug(params.slug);
    if (!product) notFound();

    const hero = product.product_images?.[0]?.url;

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
            <Link href="/" className="text-sm text-black/70 hover:text-black">
                ← Volver
            </Link>

            <div className="mt-4 rounded-3xl border border-black/10 bg-white p-5">
                <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>

                {product.short_description ? (
                    <p className="mt-2 text-sm leading-6 text-black/60">
                        {product.short_description}
                    </p>
                ) : null}

                {hero ? (
                    <div className="mt-4 relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10">
                        <Image src={hero} alt={product.name} fill className="object-cover" />
                    </div>
                ) : null}

                {product.description ? (
                    <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-black/75">
                        {product.description}
                    </div>
                ) : null}

                <div className="mt-6">
                    <div className="text-sm font-semibold">Presentaciones</div>
                    <div className="mt-3 grid gap-2">
                        {product.product_variants.map((v) => (
                            <div
                                key={v.id}
                                className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3"
                            >
                                <div>
                                    <div className="text-sm font-semibold">{v.label}</div>
                                    <div className="text-xs text-black/55">
                                        {v.is_available ? "Disponible" : "Sin stock"}
                                        {typeof v.stock_qty === "number" ? ` · Stock: ${v.stock_qty}` : ""}
                                    </div>
                                </div>

                                <div className="text-sm font-semibold">
                                    {formatARSFromCents(v.price_cents)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* acá enchufás tu add-to-cart / ProductModal */}
            </div>
        </div>
    );
}