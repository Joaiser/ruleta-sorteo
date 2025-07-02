import type { APIRoute } from "astro";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.DB_NAME);

export const GET: APIRoute = async () => {
    try {
        await client.connect();
        const questions = await db.collection("questions")
            .find({})
            .sort({ order: 1 })
            // .project({ "answers.isCorrect": 0, "answers.chanceModifiers": 0 }) // quitamos respuestas correctas para que no se vean
            .toArray();

        return new Response(JSON.stringify(questions), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Error obteniendo preguntas" }), { status: 500 });
    } finally {
        await client.close();
    }
};
