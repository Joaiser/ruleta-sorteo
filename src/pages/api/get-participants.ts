import type { APIRoute } from "astro";
import { connectToDatabase } from "@/lib/db";


export const prerender = false;

export const GET: APIRoute = async () => {
    const db = await connectToDatabase();
    const collection = db.collection("lucel-ruleta")

    const participants = await collection.find().toArray();

    return new Response(JSON.stringify(participants), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

