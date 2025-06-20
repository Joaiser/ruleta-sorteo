import jwt from 'jsonwebtoken';
import { verifiAdmin } from "@/utils/verifyAdmin"

export async function POST({ request, redirect }: any) {
    const form = await request.formData();
    const username = form.get("username")?.toString().trim();
    const password = form.get("password")?.toString();

    const user = await verifiAdmin(username, password)
    if (!user) {
        return redirect("/dashboardAdmin/login?error=1")
    }


    const token = jwt.sign(
        { role: "admin", username },
        process.env.JWT_SECRET!,
        { expiresIn: "2h" }
    );

    const expires = new Date(Date.now() + 1000 * 60 * 60 * 2).toUTCString();

    return new Response(null, {
        status: 302,
        headers: {
            "Set-Cookie": `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires}`,
            Location: "/dashboardAdmin"
        }
    });
}
