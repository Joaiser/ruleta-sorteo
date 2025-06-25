import { connectToDatabase } from "@/lib/db";
import { verifyAdminRequest } from "@/utils/verifyAdminRequest";
import { ObjectId } from "mongodb";

export const DELETE = async ({ request, params }: { request: Request, params: { id: string } }) => {
    const error = await verifyAdminRequest(request);
    if (error) return error;

    const id = params.id;
    if (!id) {
        return new Response(JSON.stringify({ message: "ID no proporcionado" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const db = await connectToDatabase();
        const res = await db.collection("prizes").deleteOne({ _id: new ObjectId(id) });

        return new Response(JSON.stringify({
            message: "Premio eliminado",
            deletedCount: res.deletedCount,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("❌ Error al borrar premio:", err);
        return new Response(JSON.stringify({ message: "Error interno" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};