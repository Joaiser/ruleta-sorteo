import { connectToDatabase } from "@/lib/db";
import { verifyAdminRequest } from "@/utils/verifyAdminRequest";

export const POST = async ({ request }: { request: Request }) => {
    const errorResponse = await verifyAdminRequest(request);
    if (errorResponse) {
        return errorResponse;
    }

    try {
        const body = await request.json();
        const { phase, questionText, timeLimitSeconds, answers } = body

        if (
            typeof phase !== "number" ||
            !questionText ||
            typeof timeLimitSeconds !== "number" ||
            !Array.isArray(answers) ||
            answers.length < 2
        ) {
            return new Response(JSON.stringify({ error: "Campos inválidos" }), {
                status: 400,
            });
        }

        const db = await connectToDatabase();

        //1. insertar pregunta
        const questionRes = await db.collection("Quizquestions").insertOne({
            phase,
            text: questionText,
            timeLimit: timeLimitSeconds,
            createdAt: new Date()
        });

        const questionId = questionRes.insertedId;

        //2. insertar respuestas
        const answersWithIds = await Promise.all(
            answers.map(async (ans: any, index: number) => {
                const res = await db.collection("Quizanswers").insertOne({
                    questionId,
                    text: ans.text,
                    isCorrect: ans.isCorrect,
                    index,
                })
                return {
                    _id: res.insertedId,
                    ...ans
                }
            })
        )
        //3. Insertar modifiers (si existen)
        for (let i: any; i < answersWithIds.length; i++) {
            const answer = answersWithIds[i];
            if (Array.isArray(answer.chanceModifiers) && answer.chanceModifiers.length > 0) {
                const modifierDocs = answer.chanceModifiers.map((mod: any) => ({
                    questionId,
                    answerId: answer._id,
                    prizeId: mod.prizeId,
                    chanceDelta: mod.chanceDelta,
                }))
                await db.collection("QuizModifiers").insertMany(modifierDocs);
            }
        }

        return new Response(JSON.stringify({
            message: "Pregunta y respuestas añadidas correctamente",
            questionId,
            answers: answersWithIds,
        }), {
            status: 201,
        });

    } catch (err) {
        console.error("❌ Error al insertar pregunta/answers/modifiers:", err);
        return new Response(JSON.stringify({ error: "Error en el servidor" }), {
            status: 500,
        });
    }
};