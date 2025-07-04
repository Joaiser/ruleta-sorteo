import type { APIRoute } from "astro";
import { MongoClient } from "mongodb";
// import { verifiAdmin } from "@/utils/verifyAdmin"; // Para futuro

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.DB_NAME);

export const POST: APIRoute = async ({ request }) => {
    try {
        const { username, password, phase, questionText, timeLimitSeconds, answers } = await request.json();

        // Validar admin (descomentar cuando implementado)
        // const admin = await verifiAdmin(username, password);
        // if (!admin) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });

        if (!phase || !questionText || !timeLimitSeconds || !answers || !Array.isArray(answers)) {
            return new Response(JSON.stringify({ error: "Datos incompletos" }), { status: 400 });
        }

        // En answers cada chanceModifier debe ser { prizeId: ObjectId, chanceDelta: number }
        // Validar aquí que cada prizeId sea ObjectId válido si quieres.

        await client.connect();

        const sanitizedAnswers = answers.map((answer) => ({
            ...answer,
            chanceModifiers: answer.chanceModifiers.map((mod: any) => ({
                prizeId: mod.prizeId, // solo guardamos el ID
            }))
        }));


        await db.collection("questions").insertOne({
            phase,
            questionText,
            timeLimitSeconds,
            answers: sanitizedAnswers,
        });

        return new Response(JSON.stringify({ message: "Pregunta añadida correctamente" }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Error añadiendo pregunta" }), { status: 500 });
    } finally {
        await client.close();
    }
};
