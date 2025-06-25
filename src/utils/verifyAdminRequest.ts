import { isAdminToken } from "@/lib/auth/auth";

export async function verifyAdminRequest(request: Request): Promise<Response | null> {
    const cookieHeader = request.headers.get("cookie") || "";

    const cookies: Record<string, string> = Object.fromEntries(
        cookieHeader
            .split(";")
            .map(cookie => cookie.trim().split("="))
            .filter(([key, value]) => key && value)
    );

    const token = cookies["admin_token"];

    if (!isAdminToken(token)) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    return null; // Si todo va bien, devolvemos null (sin error)
}