import type { APIRoute } from "astro";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        const {
            originalPrizeId,
            newPrize,
            phase,
            answerIndex,
            modifierIndex
        } = body;

        if (!originalPrizeId || !newPrize || phase == null || answerIndex == null || modifierIndex == null) {
            return new Response(JSON.stringify({ message: "Faltan datos obligatorios" }), {
                status: 400
            });
        }

        const db = await connectToDatabase();
        const modifierPrizes = db.collection("modifier_prizes");

        const result = await modifierPrizes.insertOne({
            originalPrizeId: new ObjectId(originalPrizeId),
            newPrize,
            context: {
                phase,
                answerIndex,
                modifierIndex
            },
            createdAt: new Date()
        });

        return new Response(JSON.stringify({ id: result.insertedId, message: "Premio modificado correctamente" }), {
            status: 200
        });

    } catch (err: any) {
        console.error("[createModifierPrize]", err);
        return new Response(JSON.stringify({ message: "Error interno del servidor" }), {
            status: 500
        });
    }
};
