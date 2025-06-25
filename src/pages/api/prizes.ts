import { connectToDatabase } from "@/lib/db";
import { verifyAdminRequest } from "@/utils/verifyAdminRequest";

export const GET = async ({ request }: { request: Request }) => {
    const errorResponse = await verifyAdminRequest(request);
    if (errorResponse) return errorResponse;

    try {
        const db = await connectToDatabase();
        const prizes = await db.collection("prizes").find().toArray();

        return new Response(JSON.stringify(prizes), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("❌ Error al obtener premios:", err);
        return new Response(JSON.stringify({ message: "Error al obtener premios" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};