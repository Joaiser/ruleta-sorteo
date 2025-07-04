import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { modifierId, chanceDelta, prizeId } = body;

        if (!modifierId) {
            return new Response(JSON.stringify({ error: "Falta modifierId" }), { status: 400 });
        }

        const updateFields: Record<string, any> = {};

        if (chanceDelta !== undefined) updateFields.chanceDelta = chanceDelta;
        if (prizeId !== undefined) updateFields.prizeId = new ObjectId(prizeId);

        if (Object.keys(updateFields).length === 0) {
            return new Response(JSON.stringify({ error: "Nada que actualizar" }), { status: 400 });
        }

        const db = await connectToDatabase();
        const result = await db
            .collection("modifier_prizes")
            .updateOne({ _id: new ObjectId(modifierId) }, { $set: updateFields });

        if (result.modifiedCount === 0) {
            return new Response(JSON.stringify({ error: "No se pudo actualizar" }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "Actualizado con éxito" }), { status: 200 });
    } catch (err) {
        console.error("Error en updateModifierPrize:", err);
        return new Response(JSON.stringify({ error: "Error del servidor" }), { status: 500 });
    }
};
