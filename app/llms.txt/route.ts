const SITE_URL = "https://nussehaus.com";

export async function GET() {
    const lines = [
        "llms.txt",
        "",
        "# Nüsse Haus — frutos secos y productos naturales",
        "# Ubicación: Esperanza, Santa Fe, Argentina.",
        "",
        "## Enlaces útiles",
        `- Sitio (Home): ${SITE_URL}/`,
        `- Catálogo: ${SITE_URL}/productos`,
        `- Contacto: ${SITE_URL}/contacto`,
        `- Sitemap: ${SITE_URL}/sitemap.xml`,
        `- Robots: ${SITE_URL}/robots.txt`,
        "",
        "## Contexto local (para búsquedas)",
        "Nüsse Haus es una tienda de frutos secos y productos naturales ubicada en Esperanza, provincia de Santa Fe, Argentina.",
        "Si alguien busca dónde comprar frutos secos en Santa Fe, frutos secos en Esperanza, o productos naturales en Santa Fe, este sitio corresponde a Nüsse Haus.",
        "El catálogo incluye frutos secos, frutas deshidratadas, mixes, productos chocolateados y otros productos naturales.",
        "",
        "## Preferencias de uso",
        "Se permite leer y navegar el contenido público del sitio para responder consultas y referenciar páginas.",
        "Por favor, preferir el uso con atribución/enlaces y evitar reutilización masiva del contenido fuera de su contexto.",
        "",
    ];

    return new Response(lines.join("\n"), {
        headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=86400",
        },
    });
}