import { connectToDatabase } from "@/lib/db";
import { verifyAdminRequest } from "@/utils/verifyAdminRequest";

export const POST = async ({ request }: { request: Request }) => {
    const errorResponse = await verifyAdminRequest(request);
    if (errorResponse) return errorResponse;
    try {
        const body = await request.json();
        const { type, value, code, baseChance } = body;

        if (!type || !value || !code || typeof baseChance !== "number") {
            return new Response(JSON.stringify({ message: "Campos inválidos" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const db = await connectToDatabase();
        const res = await db.collection("prizes").insertOne({
            type,
            value,
            code,
            baseChance,
            createdAt: new Date(),
        });

        return new Response(JSON.stringify({ message: "Premio creado", id: res.insertedId }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("❌ Error al insertar premio:", err);
        return new Response(JSON.stringify({ message: "Error en el servidor" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};