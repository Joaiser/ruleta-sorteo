import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST({ request }: { request: Request }) {
    try {
        const { prizeId, chanceDelta = 0 } = await request.json();

        if (!prizeId) {
            return new Response(JSON.stringify({ error: "Falta prizeId" }), { status: 400 });
        }

        let convertedPrizeId;
        try {
            convertedPrizeId = new ObjectId(prizeId);
        } catch {
            return new Response(JSON.stringify({ error: "prizeId inválido" }), { status: 400 });
        }

        const db = await connectToDatabase();
        const result = await db.collection("modifier_prizes").insertOne({
            prizeId: convertedPrizeId,
            chanceDelta,
            createdAt: new Date(),
        });

        return new Response(JSON.stringify({ modifierId: result.insertedId }), { status: 200 });
    } catch (err) {
        console.error("Error en createEmptyModifier:", err);
        return new Response(JSON.stringify({ error: "Error al crear el modificador" }), { status: 500 });
    }
}
