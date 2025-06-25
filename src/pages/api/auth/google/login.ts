import type { APIRoute } from "astro";

const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = "http://localhost:4321/api/auth/google/callback" //Desarrollo
const SCOPE = "openid email profile"

export const GET: APIRoute = () => {
    const state = crypto.randomUUID();

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");


    url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", SCOPE);
    url.searchParams.set("state", state);

    console.log("Redirecting to:", url.toString());

    return new Response(null, {
        status: 302,
        headers: { Location: url.toString() },
    });
};