import type { APIRoute } from "astro";
import { connectToDatabase } from "@/lib/db";
import { randomUUID } from "crypto"

export const prerender = false;


interface Prize {
    type: string;
    value: string | number;
}

export const prizes: Prize[] = [
    { type: "discount", value: 5 },
    { type: "discount", value: 10 },
    { type: "discount", value: 15 },
    { type: "discount", value: 20 },
    { type: "discount", value: 50 },
    { type: "product", value: "Producto Categoria A" },
    { type: "product", value: "Producto Categoria B" },
    //hablar con la jefa
]

// Probabilidades (deben sumar 1)
const probabilities = [
    0.5, // 5%
    0.25, // 10%
    0.1, // 15%
    0.08, // 20%
    0.03, // 50%
    0.03, // Producto A
    0.01, // Producto B
];

//Function para obtener ip
function getClientIp(request: Request): string {
    const forwaded = request.headers.get("x-forwared-for")
    if (forwaded) return forwaded.split(",")[0].trim()

    const cf = request.headers.get("cf-connecting-ip")
    if (cf) return cf.trim()

    const real = request.headers.get("x-real-ip")
    if (real) return real.trim()
    return "unknow"
}

function getPrize() {
    const r = Math.random()
    let acc = 0;
    for (let i = 0; i < prizes.length; i++) {
        acc += probabilities[i]
        if (r <= acc) return prizes[i]
    }
    return prizes[0]
}

export const POST: APIRoute = async ({ request }) => {
    const cookieHeader = request.headers.get("cookie") || "null"
    const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));
    const uuid = cookies["uuid"]

    if (!uuid) return new Response("No UUID cookie found", { status: 400 })

    const db = await connectToDatabase()
    const collection = db.collection("lucel-ruleta")

    //verificar si ya participò
    const existing = await collection.findOne({ uuid })
    if (existing) {
        return new Response(
            JSON.stringify({ error: "Ya has participado en el sorteo", prize: existing.prize, code: existing.code }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        )
    }

    //obtener premio

    const prize = getPrize()


    //generamos uuid
    const code = randomUUID().slice(0, 8).toUpperCase()
    const ip = getClientIp(request)

    //guardamos bd
    await collection.insertOne({ uuid, prize, code, date: new Date(), ip })

    return new Response(
        JSON.stringify({ prize, code }),
        { status: 200, headers: { "Content-type": "application/json" } }
    )
}