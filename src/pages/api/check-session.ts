import { isAdminToken } from "@/lib/auth/auth"
import jwt from "jsonwebtoken";
import { Buffer } from "buffer";

export async function GET({ request }: { request: Request }) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies: Record<string, string> = Object.fromEntries(
        cookieHeader
            .split(';')
            .map(cookie => cookie.trim().split('='))
            .filter(([key, value]) => key && value)
    );

    const token = cookies['admin_token'];


    if (!isAdminToken(token)) {
        return new Response(JSON.stringify({ ok: false }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        })
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    })
}

export function getSessionFromRequest(request: Request): { id: string } | null {
    try {
        const cookieHeader = request.headers.get("cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));

        // 🔍 Opción 1: Google (JWT)
        const jwtToken = cookies.session;
        if (jwtToken) {
            const payload = jwt.verify(jwtToken, import.meta.env.JWT_SECRET!) as any;
            if (payload?.email) {
                return { id: payload.email };
            }
        }

        // 🔍 Opción 2: Facebook (signed request)
        const fbKey = Object.keys(cookies).find(k => k.startsWith("fbsr_"));
        const fbSignedRequest = fbKey ? cookies[fbKey] : null;

        if (fbSignedRequest) {
            const [encodedSig, payload] = fbSignedRequest.split(".");
            if (!encodedSig || !payload) return null;

            const fbPayload = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));

            if (fbPayload?.user_id) {
                return { id: `fb_${fbPayload.user_id}` };
            }
        }

        return null;
    } catch (err) {
        console.error("❌ Sesión inválida:", err);
        return null;
    }
}
//Ahora mismo con facebook, no guarda el email, solo el user_id

