import type { APIRoute } from "astro";
import { connectToDatabase } from "@/lib/db";
import { randomUUID } from "crypto";

export const prerender = false;

// Obtener IP del cliente
function getClientIp(request: Request): string {
    const forwaded = request.headers.get("x-forwared-for")
    if (forwaded) return forwaded.split(",")[0].trim()
    const cf = request.headers.get("cf-connecting-ip")
    if (cf) return cf.trim()
    const real = request.headers.get("x-real-ip")
    if (real) return real.trim()
    return "unknown"
}

// Elegir premio según baseChance
function seleccionarPremio(premios: any[]) {
    const totalChance = premios.reduce((acc, p) => acc + p.baseChance, 0);
    const r = Math.random() * totalChance;
    let acc = 0;
    for (const premio of premios) {
        acc += premio.baseChance;
        if (r <= acc) return premio;
    }
    return premios[0];
}

export const POST: APIRoute = async ({ request }) => {
    const cookieHeader = request.headers.get("cookie") || "null"
    const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));
    const uuid = cookies["uuid"]

    if (!uuid) {
        return new Response("No UUID cookie found", { status: 400 })
    }

    const db = await connectToDatabase()
    const collection = db.collection("lucel-ruleta")

    // ¿Ya participó?
    const existing = await collection.findOne({ uuid })
    if (existing) {
        return new Response(
            JSON.stringify({ error: "Ya has participado en el sorteo", prize: existing.prize, code: existing.code }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        )
    }

    // Cargar premios desde la colección
    const premios = await db.collection("prizes").find().toArray()

    if (premios.length === 0) {
        return new Response(JSON.stringify({ error: "No hay premios configurados" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }

    const { type, value } = seleccionarPremio(premios)
    const code = randomUUID().slice(0, 8).toUpperCase()
    const ip = getClientIp(request)

    // Guardar resultado
    await collection.insertOne({ uuid, prize: { type, value }, code, date: new Date(), ip })

    return new Response(
        JSON.stringify({ prize: { type, value }, code }),
        { status: 200, headers: { "Content-type": "application/json" } }
    )
}
