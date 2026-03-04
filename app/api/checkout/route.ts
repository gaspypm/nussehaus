import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";


const CheckoutSchema = z.object({
    name: z.string().trim().min(2).max(80),
    address: z.string().trim().min(5).max(120),
    items: z
        .array(
            z.object({
                variant_id: z.string().uuid(),
                qty: z.number().int().min(1).max(99),
            })
        )
        .min(1),
    turnstile_token: z.string().min(1).optional(),
});

function getEnv(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

async function verifyTurnstile(token: string, ip?: string) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return true;

    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: form,
    });

    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = CheckoutSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { name, address, items, turnstile_token } = parsed.data;

        if (turnstile_token) {
            const ok = await verifyTurnstile(turnstile_token, req.headers.get("cf-connecting-ip") ?? undefined);
            if (!ok) return NextResponse.json({ error: "Turnstile failed" }, { status: 400 });
        }

        const supabaseUrl = getEnv("SUPABASE_URL");
        const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
        const whatsappNumber = getEnv("WHATSAPP_NUMBER");
        const siteUrl = getEnv("NEXT_PUBLIC_SITE_URL");

        const supabase = createClient(supabaseUrl, serviceKey, {
            auth: { persistSession: false },
            global: { fetch },
        });

        const { data, error } = await supabase.rpc("create_order", {
            p_customer_name: name,
            p_customer_address: address,
            p_items: items.map((i) => ({ variant_id: i.variant_id, qty: i.qty })),
            p_whatsapp_number: whatsappNumber,
            p_site_url: siteUrl,
        });

        if (error) {
            return NextResponse.json(
                { error: error.message ?? "Checkout failed" },
                { status: 400 }
            );
        }

        if (!data?.order_code || !data?.whatsapp_link) {
            return NextResponse.json(
                { error: "Unexpected RPC response" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            order_code: String(data.order_code),
            whatsapp_link: String(data.whatsapp_link),
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Server error" },
            { status: 500 }
        );
    }
}