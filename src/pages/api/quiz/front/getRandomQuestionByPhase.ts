import type { APIRoute } from "astro";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.DB_NAME);

export const GET: APIRoute = async ({ url }) => {
    try {
        await client.connect();

        // Obtener phase del query param y convertir a número
        const phaseParam = url.searchParams.get("phase");
        const phase = phaseParam ? parseInt(phaseParam, 10) : null;

        if (!phase) {
            return new Response(JSON.stringify({ error: "Falta parámetro 'phase'" }), { status: 400 });
        }

        // Obtener 1 pregunta random de esa fase (cambiar size si quieres más)
        const pipeline = [
            { $match: { phase } },
            { $sample: { size: 1 } },
            { $project: { "answers.chanceModifiers": 0 } }
        ];

        const questions = await db.collection("questions").aggregate(pipeline).toArray();

        if (questions.length === 0) {
            return new Response(JSON.stringify({ error: "No hay preguntas para esta fase" }), { status: 404 });
        }

        return new Response(JSON.stringify(questions), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Error obteniendo preguntas" }), { status: 500 });
    } finally {
        await client.close();
    }
};
