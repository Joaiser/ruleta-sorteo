import type { APIRoute } from "astro";
import { connectToDatabase } from "@/lib/db";
import jwt from "jsonwebtoken";


const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:4321/api/auth/google/callback";

export const GET: APIRoute = async ({ request, redirect }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) return new Response("No code provided", { status: 400 });

    //1. Intercambiar el código por un token de acceso
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
        }),
    });

    const token = await tokenRes.json();
    const idToken = token.id_token;

    //2. Verificar el token de ID
    const user: any = jwt.decode(idToken);


    //3. Guardar sesion
    const db = await connectToDatabase();
    const sessionToken = jwt.sign(
        { uuid: crypto.randomUUID(), email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "2h" }
    );

    await db.collection("sessions").insertOne({
        uuid: user.email,
        email: user.email,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 horas
        sessionToken,
    });

    //4. set cookie y regirigir
    return new Response(null, {
        status: 302,
        headers: {
            "Set-Cookie": `session=${sessionToken}; Path=/; HttpOnly`,
            Location: "/",
        },
    });
};

