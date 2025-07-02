import type { APIRoute } from "astro";
import { MongoClient } from "mongodb";
import { verifiAdmin } from "@/utils/verifyAdmin";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.DB_NAME);

export const POST: APIRoute = async ({ request }) => {
    try {
        const { username, password, phase, questionText, timeLimitSeconds, answers } = await request.json();

        // Validar admin
        // const admin = await verifiAdmin(username, password);
        // if (!admin) {
        //     return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
        // }

        //MAS ADELANTE: Descomentar la validación de admin cuando esté implementada

        if (!phase || !questionText || !timeLimitSeconds || !answers || !Array.isArray(answers)) {
            return new Response(JSON.stringify({ error: "Datos incompletos" }), { status: 400 });
        }

        await client.connect();

        // Insertar nueva pregunta
        await db.collection("questions").insertOne({
            phase,
            questionText,
            timeLimitSeconds,
            answers,
        });

        return new Response(JSON.stringify({ message: "Pregunta añadida correctamente" }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Error añadiendo pregunta" }), { status: 500 });
    } finally {
        await client.close();
    }
};
