import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Sobre Nüsse Haus — Esperanza, Santa Fe",
    description:
        "Nüsse Haus: frutos secos y productos naturales en Esperanza, Santa Fe, Argentina. Calidad premium y pedidos por WhatsApp o Instagram.",
    alternates: { canonical: "https://nussehaus.com/about" },
};

export default function AboutPage() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-10">
            <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-10">
                <p className="text-xs font-semibold tracking-wide text-black/50">
                    Esperanza, Santa Fe · Argentina
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">
                    Nüsse Haus
                </h1>

                <p className="mt-4 text-base leading-7 text-black/70">
                    Somos un emprendimiento de <strong>frutos secos y productos naturales</strong> en{" "}
                    <strong>Esperanza, Santa Fe</strong>. Seleccionamos productos de primera calidad
                    (importados y nacionales) para que puedas sumar energía y nutrición a tu día con
                    opciones simples, ricas y confiables.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
                        <div className="text-sm font-semibold">Calidad</div>
                        <p className="mt-2 text-sm leading-6 text-black/65">
                            Frutos secos premium y variedad de productos naturales.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
                        <div className="text-sm font-semibold">Variedad</div>
                        <p className="mt-2 text-sm leading-6 text-black/65">
                            Almendras, nueces, mixes, chocolateados y más.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
                        <div className="text-sm font-semibold">Pedidos fáciles</div>
                        <p className="mt-2 text-sm leading-6 text-black/65">
                            Pedí por WhatsApp o Instagram y coordinamos la entrega en la ciudad.
                        </p>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-black/10 bg-white/70 p-5">
                    <h2 className="text-lg font-semibold">¿Buscás dónde comprar frutos secos en Santa Fe?</h2>
                    <p className="mt-2 text-sm leading-6 text-black/70">
                        Si estás en <strong>Esperanza</strong> o en la provincia de <strong>Santa Fe</strong> y querés{" "}
                        <strong>frutos secos</strong> o <strong>productos naturales</strong>, Nüsse Haus es tu lugar:
                        variedad, precios competitivos y atención directa para armar tu pedido.
                    </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        href="/productos"
                        className="rounded-2xl border border-black/10 bg-black px-4 py-2 text-sm font-semibold text-white"
                    >
                        Ver catálogo
                    </Link>
                    <Link
                        href="/contacto"
                        className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black"
                    >
                        Contacto
                    </Link>
                </div>

                <p className="mt-8 text-xs text-black/45">
                    Instagram: @nussehaus · Emprendimiento local en Esperanza, Santa Fe.
                </p>
            </div>
        </main>
    );
}