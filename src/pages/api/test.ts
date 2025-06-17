import type { APIRoute } from "astro";
import { connectToDatabase } from "../../lib/db";

export const GET: APIRoute = async () => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("participaciones");

        const total = await collection.countDocuments();

        return new Response(
            JSON.stringify({ status: "ok", participaciones: total }),
            { status: 200 }
        );
    } catch (err) {
        console.error("❌ Error de conexión:", err);
        return new Response(JSON.stringify({ status: "error", error: err }), {
            status: 500,
        });
    }
};
