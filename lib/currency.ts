export function formatARSFromCents(cents: number) {
    const value = (cents ?? 0) / 100;
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(value);
}