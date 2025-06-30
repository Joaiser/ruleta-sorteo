import type { APIRoute } from "astro";
import { connectToDatabase } from "@/lib/db";
import jwt from "jsonwebtoken";
import { Buffer } from "buffer";

export const prerender = false;

// Util para Facebook signed request
function parseFacebookSignedRequest(signedRequest: string, appSecret: string) {
    const [encodedSig, payload] = signedRequest.split('.');
    const sig = Buffer.from(encodedSig, 'base64').toString('utf8');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return data;
}

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
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));

    const sessionToken = cookies["session"];
    const fbCookieName = Object.keys(cookies).find(k => k.startsWith("fbsr_"));
    const fbSignedRequest = fbCookieName ? cookies[fbCookieName] : null;

    let identifier: string | null = null;

    // 🔐 Si hay cookie de Google
    if (sessionToken) {
        try {
            const payload = jwt.verify(sessionToken, import.meta.env.JWT_SECRET!) as any;
            identifier = payload.email; // Lo usamos como clave
        } catch (err) {
            console.error("❌ Token de Google inválido", err);
            return new Response(JSON.stringify({ error: "Token inválido o expirado" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    // 🔐 Si hay cookie de Facebook
    if (!identifier && fbSignedRequest) {
        try {
            const fbData = parseFacebookSignedRequest(fbSignedRequest, import.meta.env.FACEBOOK_APP_SECRET!);
            if (!fbData.user_id) throw new Error("No user_id en signed request");
            identifier = `fb_${fbData.user_id}`; // Prefix para evitar colisiones con email
        } catch (err) {
            console.error("❌ Signed Request de Facebook inválido", err);
            return new Response(JSON.stringify({ error: "Sesión de Facebook inválida" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    // ❌ Si no hay ninguna sesión válida
    if (!identifier) {
        return new Response(JSON.stringify({ error: "Sesión no encontrada" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const db = await connectToDatabase();
    const collection = db.collection("lucel-ruleta");

    const existing = await collection.findOne({ user: identifier });
    if (existing) {
        return new Response(
            JSON.stringify({ error: "Ya has participado", prize: existing.prize, code: existing.code }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const premios = await db.collection("prizes").find().toArray();
    if (premios.length === 0) {
        return new Response(JSON.stringify({ error: "No hay premios configurados" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { type, value } = seleccionarPremio(premios);
    const code = crypto.randomUUID().slice(0, 8).toUpperCase();

    await collection.insertOne({
        user: identifier,
        prize: { type, value },
        code,
        date: new Date()
    });

    return new Response(
        JSON.stringify({ prize: { type, value }, code }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};
