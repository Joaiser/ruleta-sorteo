//Verificacion de usuarios normales

import { randomUUID } from "crypto"
import type { APIRoute } from "astro"

export const prerender = false;


export const GET: APIRoute = async ({ request }): Promise<Response> => {
    const cookieHeader = request.headers.get("cookie") || ""


    const cookies = Object.fromEntries(cookieHeader.split("; ").map((c: string) => c.split("=")))


    let userUUID = cookies["uuid"]

    const headers = new Headers()

    if (!userUUID) {
        userUUID = randomUUID()

        headers.append("Set-Cookie", `uuid=${userUUID}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`)
    }

    return new Response(JSON.stringify({ uuid: userUUID }), {
        headers: {
            ...Object.fromEntries(headers.entries()),
            "Content-Type": "application/json",
        }
    })
}