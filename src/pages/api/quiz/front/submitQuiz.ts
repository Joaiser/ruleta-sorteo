import type { APIRoute } from "astro";
import { MongoClient, ObjectId } from "mongodb";

type PersonalizedChance = {
    userId: string;
    prizeId: ObjectId;
    baseChance: number;
    chanceDelta: number;
    modifiedChance: number;
    source: "quiz";
    updatedAt: Date;
};

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.DB_NAME);

export const POST: APIRoute = async ({ request }) => {
    try {
        const { userId, answers } = await request.json();

        if (!userId || !Array.isArray(answers)) {
            return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
        }

        await client.connect();

        for (const { questionId, selectedAnswerIndex } of answers) {
            const question = await db.collection("questions").findOne({ _id: new ObjectId(questionId) });

            if (!question || !question.answers || !question.answers[selectedAnswerIndex]) continue;

            const selected = question.answers[selectedAnswerIndex];

            if (!selected.isCorrect) continue; // Si la respuesta es incorrecta, no hacemos nada

            for (const modifier of selected.chanceModifiers || []) {
                if (!modifier.prizeId) continue;

                const prize = await db.collection("prizes").findOne({ _id: new ObjectId(modifier.prizeId) });
                if (!prize) continue;

                const existing = await db.collection("personalizedChances").findOne({
                    userId,
                    prizeId: prize._id,
                });

                const baseChance = prize.baseChance;
                const newChanceDelta = (existing?.chanceDelta || 0) + modifier.chanceDelta;

                const personalizedChance: PersonalizedChance = {
                    userId,
                    prizeId: prize._id,
                    baseChance,
                    chanceDelta: newChanceDelta,
                    modifiedChance: baseChance + newChanceDelta,
                    source: "quiz",
                    updatedAt: new Date(),
                };

                await db.collection("personalizedChances").updateOne(
                    { userId, prizeId: prize._id },
                    { $set: personalizedChance },
                    { upsert: true }
                );
            }
        }

        return new Response(JSON.stringify({ message: "Quiz procesado correctamente" }), { status: 200 });
    } catch (error) {
        console.error("Error en submitQuiz", error);
        return new Response(JSON.stringify({ error: "Error procesando quiz" }), { status: 500 });
    } finally {
        await client.close();
    }
};
