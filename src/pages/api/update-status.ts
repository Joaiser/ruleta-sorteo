import type { APIRoute } from "astro";
import { connectToDatabase } from "../../lib/db";
import { ObjectId } from "mongodb";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return new Response(JSON.stringify({ error: "Faltan datos" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const db = await connectToDatabase();
        const result = await db.collection("lucel-ruleta").updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return new Response(JSON.stringify({ error: "No se encontró el participante" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("❌ Error actualizando status:", err);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};