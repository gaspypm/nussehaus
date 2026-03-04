// app/(store)/Storefront.tsx
"use client";

import React from "react";
import Image from "next/image";

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

const currencyARS = (cents: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(Math.round(cents / 100));

function cn(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}

function qtyKey(variantId: string) {
    return `v:${variantId}`;
}

function sumQty(cart: Record<string, number>) {
    let total = 0;
    for (const k of Object.keys(cart)) total += cart[k] || 0;
    return total;
}

function buildCartLines(products: Product[], cart: Record<string, number>) {
    const lines: Array<{ product: Product; variant: Variant; qty: number }> = [];
    const byVariant = new Map<string, { product: Product; variant: Variant }>();
    for (const p of products) for (const v of p.variants) byVariant.set(v.id, { product: p, variant: v });
    for (const [k, qty] of Object.entries(cart)) {
        if (!qty) continue;
        const variantId = k.replace("v:", "");
        const ref = byVariant.get(variantId);
        if (!ref) continue;
        lines.push({ product: ref.product, variant: ref.variant, qty });
    }
    lines.sort((a, b) => {
        const pa = a.product.sort_order - b.product.sort_order;
        if (pa !== 0) return pa;
        return a.variant.sort_order - b.variant.sort_order;
    });
    return lines;
}

function cartTotalCents(lines: ReturnType<typeof buildCartLines>) {
    return lines.reduce((acc, l) => acc + l.variant.price_cents * l.qty, 0);
}

function safeOpen(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
}

function mockOrderCode() {
    const s = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `NH-${s}`;
}

function makeWhatsAppDraft(
    name: string,
    address: string,
    orderCode: string,
    lines: ReturnType<typeof buildCartLines>,
    totalCents: number
) {
    const body =
        `Hola! Soy ${name}. Dirección: ${address}.\n\n` +
        `Pedido ${orderCode}\n` +
        lines
            .map(
                (l) =>
                    `- ${l.product.name} (${l.variant.label}) x${l.qty} = ${currencyARS(
                        l.variant.price_cents * l.qty
                    )}`
            )
            .join("\n") +
        `\n\nTotal: ${currencyARS(totalCents)}`;
    return `https://wa.me/?text=${encodeURIComponent(body)}`;
}

type BtnProps = {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    className?: string;
};

function LogoMark() {
    return (
        <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-black/10 bg-white">
                <Image src="/logo.jpg" alt="Nüsse Haus" fill className="object-cover" priority />
            </div>
            <div className="leading-tight">
                <div className="text-[15px] font-semibold tracking-tight text-black">Nüsse Haus</div>
                <div className="text-xs text-black/55">Alimentos naturales</div>
            </div>
        </div>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border border-black/10 bg-white/60 px-3 py-1 text-[12px] font-medium text-black/70 backdrop-blur">
            {children}
        </span>
    );
}

function PrimaryButton({ children, onClick, disabled, className }: BtnProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition",
                disabled
                    ? "cursor-not-allowed bg-black/10 text-black/40"
                    : "bg-[#E0B05A] text-[#2B1D07] hover:brightness-95 active:brightness-90",
                className
            )}
        >
            {children}
        </button>
    );
}

function GhostButton({ children, onClick, className }: BtnProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-black/80 backdrop-blur hover:bg-white/90 active:bg-white",
                className
            )}
        >
            {children}
        </button>
    );
}

export default function Storefront({ initialProducts }: { initialProducts: Product[] }) {
    const [products] = React.useState<Product[]>(initialProducts);
    const [selected, setSelected] = React.useState<{ product: Product; variantId?: string } | null>(null);
    const [cartOpen, setCartOpen] = React.useState(false);
    const [checkoutOpen, setCheckoutOpen] = React.useState(false);
    const [cart, setCart] = React.useState<Record<string, number>>({});

    const cartCount = React.useMemo(() => sumQty(cart), [cart]);
    const lines = React.useMemo(() => buildCartLines(products, cart), [products, cart]);
    const total = React.useMemo(() => cartTotalCents(lines), [lines]);
    const canCheckout = lines.length > 0;

    function inc(variantId: string, max = 99) {
        setCart((prev) => {
            const k = qtyKey(variantId);
            const next = Math.min(max, (prev[k] || 0) + 1);
            return { ...prev, [k]: next };
        });
    }

    function dec(variantId: string) {
        setCart((prev) => {
            const k = qtyKey(variantId);
            const next = Math.max(0, (prev[k] || 0) - 1);
            const copy = { ...prev, [k]: next };
            if (copy[k] === 0) delete copy[k];
            return copy;
        });
    }

    function removeLine(variantId: string) {
        setCart((prev) => {
            const copy = { ...prev };
            delete copy[qtyKey(variantId)];
            return copy;
        });
    }

    return (
        <div className="min-h-screen pb-24">
            <div className="mx-auto w-full max-w-[520px] px-4 pt-4">
                <div className="flex items-center justify-between">
                    <LogoMark />
                    <button
                        type="button"
                        onClick={() => setCartOpen(true)}
                        className="relative inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm font-semibold text-black/80 backdrop-blur hover:bg-white/90"
                        aria-label="Abrir carrito"
                    >
                        <span>Carrito</span>
                        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70">{cartCount}</span>
                    </button>
                </div>

                <div className="mt-4 rounded-3xl border border-black/10 bg-white/70 p-4 backdrop-blur shadow-[var(--shadow)]">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap gap-2">
                                <Pill>Esperanza, Santa Fe</Pill>
                                <Pill>Pedidos por WhatsApp</Pill>
                            </div>
                            <h1 className="mt-3 text-[22px] font-semibold leading-tight tracking-tight text-black">
                                Elegí productos y confirmá tu pedido.
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-black/60">
                                Seleccioná la presentación y cantidad. Confirmás en 2 pasos.
                            </p>
                        </div>
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-white">
                            <Image src="/logo.jpg" alt="Nüsse Haus" fill className="object-cover" />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <a
                            href="#productos"
                            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-black/80 backdrop-blur hover:bg-white/90"
                        >
                            Ver productos
                        </a>
                        <PrimaryButton onClick={() => setCartOpen(true)}>Ver carrito</PrimaryButton>
                    </div>
                </div>

                <div id="productos" className="mt-6">
                    <div className="mb-3 flex items-end justify-between">
                        <h2 className="text-[15px] font-semibold tracking-tight text-black/85">Productos</h2>
                        <span className="text-xs text-black/45">Toque para ver</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {products
                            .slice()
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((p) => {
                                const variants = p.variants.slice().sort((a, b) => a.sort_order - b.sort_order);
                                const firstImg = p.images?.[0] || "/product.jpg";
                                const quick = variants.find((v) => v.is_available && v.price_cents > 0) || null;
                                const allUnavailable = variants.every((v) => !v.is_available || v.price_cents <= 0);

                                const from = variants
                                    .filter((v) => v.is_available && v.price_cents > 0)
                                    .sort((a, b) => a.price_cents - b.price_cents)[0];

                                const q = quick ? cart[qtyKey(quick.id)] || 0 : 0;

                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setSelected({ product: p, variantId: variants[0]?.id })}
                                        className="text-left"
                                        aria-label={`Ver ${p.name}`}
                                    >
                                        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 backdrop-blur shadow-[var(--shadow)]">
                                            <div className="relative aspect-[4/3] w-full bg-white">
                                                <Image src={firstImg} alt={p.name} fill className="object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                                {allUnavailable && (
                                                    <div className="absolute left-3 top-3 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-black/70 backdrop-blur">
                                                        Sin stock
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="truncate text-[14px] font-semibold tracking-tight text-black">{p.name}</div>
                                                        {p.short_description && (
                                                            <div className="mt-0.5 line-clamp-1 text-xs text-black/55">{p.short_description}</div>
                                                        )}
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        {from ? (
                                                            <div className="text-[12px] font-semibold text-black/70">{currencyARS(from.price_cents)}</div>
                                                        ) : (
                                                            <div className="text-[12px] font-semibold text-black/35">—</div>
                                                        )}
                                                        <div className="text-[10px] text-black/40">desde</div>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    {!quick ? (
                                                        <div className="rounded-2xl bg-black/5 px-3 py-2 text-center text-xs font-semibold text-black/40">
                                                            No disponible
                                                        </div>
                                                    ) : q === 0 ? (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="rounded-2xl bg-black/5 px-3 py-2 text-center text-xs font-semibold text-black/55">
                                                                {quick.label}
                                                            </div>
                                                            <PrimaryButton
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    inc(quick.id);
                                                                }}
                                                                className="py-2"
                                                            >
                                                                Agregar
                                                            </PrimaryButton>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-2 py-2 backdrop-blur"
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setSelected({ product: p, variantId: quick.id });
                                                            }}
                                                            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                                                                if (e.key === "Enter" || e.key === " ") {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setSelected({ product: p, variantId: quick.id });
                                                                }
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    dec(quick.id);
                                                                }}
                                                                className="h-8 w-8 rounded-xl border border-black/10 bg-white text-black/70 hover:bg-black/5"
                                                                aria-label="Quitar uno"
                                                            >
                                                                −
                                                            </button>
                                                            <div className="text-center">
                                                                <div className="text-[13px] font-semibold text-black">{q}</div>
                                                                <div className="text-[10px] text-black/45">{quick.label}</div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    inc(quick.id);
                                                                }}
                                                                className="h-8 w-8 rounded-xl border border-black/10 bg-white text-black/70 hover:bg-black/5"
                                                                aria-label="Sumar uno"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                    </div>

                    <div className="mt-6 pb-2 text-center text-xs text-black/45">
                        Nüsse Haus · Esperanza, Santa Fe
                    </div>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40">
                <div className="mx-auto w-full max-w-[520px] px-4 pb-4">
                    <div className="rounded-3xl border border-black/10 bg-white/80 p-3 backdrop-blur shadow-[var(--shadow)]">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-[12px] font-semibold text-black/70">
                                    {cartCount > 0 ? `${cartCount} item${cartCount === 1 ? "" : "s"} en carrito` : "Carrito vacío"}
                                </div>
                                <div className="truncate text-[14px] font-semibold text-black">
                                    {cartCount > 0 ? currencyARS(total) : "—"}
                                </div>
                            </div>
                            <PrimaryButton onClick={() => setCartOpen(true)} disabled={!canCheckout} className="min-w-[160px]">
                                Ver carrito
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>

            {selected && (
                <ProductSheet
                    product={selected.product}
                    initialVariantId={selected.variantId}
                    onClose={() => setSelected(null)}
                    cart={cart}
                    onInc={inc}
                    onDec={dec}
                />
            )}

            {cartOpen && (
                <CartSheet
                    lines={lines}
                    totalCents={total}
                    onClose={() => setCartOpen(false)}
                    onRemoveLine={removeLine}
                    onInc={inc}
                    onDec={dec}
                    onCheckout={() => {
                        setCartOpen(false);
                        setCheckoutOpen(true);
                    }}
                    canCheckout={canCheckout}
                />
            )}

            {checkoutOpen && (
                <CheckoutSheet
                    lines={lines}
                    totalCents={total}
                    onClose={() => setCheckoutOpen(false)}
                    onSuccess={() => {
                        setCheckoutOpen(false);
                        setCart({});
                    }}
                />
            )}
        </div>
    );
}

function Sheet({
    title,
    subtitle,
    onClose,
    children,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    React.useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50">
            <button type="button" className="absolute inset-0 bg-black/25" onClick={onClose} aria-label="Cerrar" />
            <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[520px]">
                <div className="rounded-t-[28px] border border-black/10 bg-white/90 backdrop-blur shadow-[var(--shadow)]">
                    <div className="px-4 pt-3">
                        <div className="mx-auto h-1.5 w-12 rounded-full bg-black/10" />
                    </div>
                    <div className="flex items-start justify-between gap-3 px-4 pt-3">
                        <div className="min-w-0">
                            <div className="truncate text-[16px] font-semibold tracking-tight text-black">{title}</div>
                            {subtitle && <div className="mt-0.5 text-xs text-black/55">{subtitle}</div>}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 w-9 rounded-2xl border border-black/10 bg-white text-black/70 hover:bg-black/5"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="px-4 pb-5 pt-4">{children}</div>
                </div>
            </div>
        </div>
    );
}

function ProductSheet({
    product,
    initialVariantId,
    onClose,
    cart,
    onInc,
    onDec,
}: {
    product: Product;
    initialVariantId?: string;
    onClose: () => void;
    cart: Record<string, number>;
    onInc: (variantId: string) => void;
    onDec: (variantId: string) => void;
}) {
    const variants = React.useMemo(
        () => product.variants.slice().sort((a, b) => a.sort_order - b.sort_order),
        [product.variants]
    );

    const [variantId, setVariantId] = React.useState<string>(initialVariantId || variants[0]?.id);
    const v = variants.find((x) => x.id === variantId) || variants[0];

    const [imgIdx, setImgIdx] = React.useState(0);
    const images = product.images?.length ? product.images : ["/product.jpg"];
    const qty = v ? cart[qtyKey(v.id)] || 0 : 0;

    React.useEffect(() => {
        setVariantId(initialVariantId || variants[0]?.id);
    }, [initialVariantId, variants]);

    React.useEffect(() => {
        setImgIdx(0);
    }, [product.id]);

    if (!v) return null;

    const disabled = !v.is_available || v.price_cents <= 0;

    return (
        <Sheet title={product.name} subtitle={product.short_description} onClose={onClose}>
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
                <div className="relative aspect-[4/3] w-full">
                    <Image src={images[imgIdx]} alt={product.name} fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    {images.length > 1 && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setImgIdx((x) => (x - 1 + images.length) % images.length)}
                                className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-black/70 backdrop-blur hover:bg-white"
                            >
                                ←
                            </button>
                            <div className="text-xs font-semibold text-black/55">
                                {imgIdx + 1}/{images.length}
                            </div>
                            <button
                                type="button"
                                onClick={() => setImgIdx((x) => (x + 1) % images.length)}
                                className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-black/70 backdrop-blur hover:bg-white"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
                <div className="p-3">
                    {product.long_description && <div className="text-sm leading-6 text-black/60">{product.long_description}</div>}
                </div>
            </div>

            <div className="mt-4 rounded-3xl border border-black/10 bg-white/70 p-3 backdrop-blur">
                <div className="text-xs font-semibold text-black/60">Presentación</div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {variants.map((x) => {
                        const isSelected = x.id === v.id;
                        const isDisabled = !x.is_available || x.price_cents <= 0;
                        return (
                            <button
                                key={x.id}
                                type="button"
                                onClick={() => setVariantId(x.id)}
                                disabled={isDisabled}
                                className={cn(
                                    "rounded-2xl border px-3 py-2 text-left backdrop-blur transition",
                                    isSelected ? "border-[#E0B05A]/55 bg-[#E0B05A]/20" : "border-black/10 bg-white/70 hover:bg-white/90",
                                    isDisabled && "cursor-not-allowed opacity-45 hover:bg-white/70"
                                )}
                            >
                                <div className="text-sm font-semibold text-black">{x.label}</div>
                                {x.price_cents > 0 && <div className="text-xs text-black/55">{currencyARS(x.price_cents)}</div>}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                        <div className="text-xs text-black/50">Precio</div>
                        <div className="text-[16px] font-semibold text-black">{v.price_cents > 0 ? currencyARS(v.price_cents) : "—"}</div>
                    </div>

                    {qty === 0 ? (
                        <PrimaryButton onClick={() => onInc(v.id)} disabled={disabled} className="min-w-[180px]">
                            Agregar
                        </PrimaryButton>
                    ) : (
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-2 py-2 backdrop-blur">
                            <button
                                type="button"
                                onClick={() => onDec(v.id)}
                                className="h-9 w-9 rounded-2xl border border-black/10 bg-white text-black/70 hover:bg-black/5"
                            >
                                −
                            </button>
                            <div className="px-2 text-center">
                                <div className="text-[14px] font-semibold text-black">{qty}</div>
                                <div className="text-[10px] text-black/45">{v.label}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => onInc(v.id)}
                                className="h-9 w-9 rounded-2xl border border-black/10 bg-white text-black/70 hover:bg-black/5"
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>

                {!v.is_available && <div className="mt-2 text-xs text-black/45">Esta presentación está temporalmente sin stock.</div>}
            </div>
        </Sheet>
    );
}

function CartSheet({
    lines,
    totalCents,
    onClose,
    onRemoveLine,
    onInc,
    onDec,
    onCheckout,
    canCheckout,
}: {
    lines: ReturnType<typeof buildCartLines>;
    totalCents: number;
    onClose: () => void;
    onRemoveLine: (variantId: string) => void;
    onInc: (variantId: string) => void;
    onDec: (variantId: string) => void;
    onCheckout: () => void;
    canCheckout: boolean;
}) {
    return (
        <Sheet title="Carrito" subtitle={lines.length ? "Revisá tu pedido" : "Tu carrito está vacío"} onClose={onClose}>
            <div className="space-y-3">
                {lines.length === 0 ? (
                    <div className="rounded-3xl border border-black/10 bg-white/70 p-4 text-sm text-black/60 backdrop-blur">
                        Agregá productos para continuar.
                    </div>
                ) : (
                    <>
                        {lines.map((l) => (
                            <div key={l.variant.id} className="rounded-3xl border border-black/10 bg-white/70 p-3 backdrop-blur">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-black">{l.product.name}</div>
                                        <div className="text-xs text-black/55">{l.variant.label}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveLine(l.variant.id)}
                                        className="text-xs font-semibold text-black/55 hover:text-black/70"
                                    >
                                        Quitar
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-black">{currencyARS(l.variant.price_cents * l.qty)}</div>

                                    <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-2 py-2 backdrop-blur">
                                        <button
                                            type="button"
                                            onClick={() => onDec(l.variant.id)}
                                            className="h-9 w-9 rounded-2xl border border-black/10 bg-white text-black/70 hover:bg-black/5"
                                        >
                                            −
                                        </button>
                                        <div className="px-2 text-center">
                                            <div className="text-[14px] font-semibold text-black">{l.qty}</div>
                                            <div className="text-[10px] text-black/45">cantidad</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onInc(l.variant.id)}
                                            className="h-9 w-9 rounded-2xl border border-black/10 bg-white text-black/70 hover:bg-black/5"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="rounded-3xl border border-black/10 bg-white/70 p-3 backdrop-blur">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-black/70">Total</div>
                                <div className="text-[16px] font-semibold text-black">{currencyARS(totalCents)}</div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <GhostButton onClick={() => onClose()}>Seguir</GhostButton>
                                <PrimaryButton onClick={() => onCheckout()} disabled={!canCheckout}>
                                    Confirmar
                                </PrimaryButton>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Sheet>
    );
}

function CheckoutSheet({
    lines,
    totalCents,
    onClose,
    onSuccess,
}: {
    lines: ReturnType<typeof buildCartLines>;
    totalCents: number;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [name, setName] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function submit() {
        setError(null);

        const trimmedName = name.trim();
        const trimmedAddress = address.trim();

        if (trimmedName.length < 2 || trimmedName.length > 80) {
            setError("Ingresá tu nombre.");
            return;
        }
        if (trimmedAddress.length < 5 || trimmedAddress.length > 120) {
            setError("Ingresá tu dirección.");
            return;
        }
        if (lines.length === 0) {
            setError("Tu carrito está vacío.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: trimmedName,
                address: trimmedAddress,
                items: lines.map((l) => ({ variant_id: l.variant.id, qty: l.qty })),
            };

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const order_code = mockOrderCode();
                const whatsapp_link = makeWhatsAppDraft(trimmedName, trimmedAddress, order_code, lines, totalCents);
                safeOpen(whatsapp_link);
                onSuccess();
                return;
            }

            const data = (await res.json()) as { order_code: string; whatsapp_link: string };
            if (!data?.whatsapp_link) {
                setError("La respuesta del servidor no es válida.");
                return;
            }

            safeOpen(data.whatsapp_link);
            onSuccess();
        } catch {
            setError("No se pudo generar el pedido. Probá de nuevo.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Sheet title="Confirmar pedido" subtitle="Nombre y dirección" onClose={onClose}>
            <div className="space-y-3">
                <div className="rounded-3xl border border-black/10 bg-white/70 p-3 backdrop-blur">
                    <label className="grid gap-1">
                        <span className="text-xs font-semibold text-black/55">Nombre</span>
                        <input
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            className="h-12 rounded-2xl border border-black/10 bg-white/80 px-4 text-sm text-black outline-none focus:border-[#E0B05A]/60"
                            placeholder="Ej: Sofía"
                            autoComplete="name"
                        />
                    </label>

                    <label className="mt-3 grid gap-1">
                        <span className="text-xs font-semibold text-black/55">Dirección</span>
                        <input
                            value={address}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                            className="h-12 rounded-2xl border border-black/10 bg-white/80 px-4 text-sm text-black outline-none focus:border-[#E0B05A]/60"
                            placeholder="Ej: San Martín 123"
                            autoComplete="street-address"
                        />
                    </label>

                    {error && (
                        <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700">{error}</div>
                    )}
                </div>

                <div className="rounded-3xl border border-black/10 bg-white/70 p-3 backdrop-blur">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-black/70">Total</div>
                        <div className="text-[16px] font-semibold text-black">{currencyARS(totalCents)}</div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <GhostButton onClick={() => onClose()}>Atrás</GhostButton>
                        <PrimaryButton
                            onClick={() => {
                                void submit();
                            }}
                            disabled={loading}
                        >
                            {loading ? "Generando..." : "Enviar WhatsApp"}
                        </PrimaryButton>
                    </div>

                    <div className="mt-2 text-xs text-black/45">Se abrirá WhatsApp con el pedido listo para enviar.</div>
                </div>
            </div>
        </Sheet>
    );
}