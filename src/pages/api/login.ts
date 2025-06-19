import jwt from 'jsonwebtoken'

export async function POST({ request, redirect }: any) {

    const form = await request.formData()
    const clave = form.get("clave")

    if (clave !== import.meta.env.ADMIN_SECRET) {
        return redirect("/dashboardAdmin/login?error=1")
    }

    const token = jwt.sign(
        { role: "admin", timestamp: Date.now() },
        import.meta.env.JWT_SECRET!,
        { expiresIn: "2h" }
    )
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 2).toUTCString()

    return new Response(null, {
        status: 302,
        headers: {
            "Set-Cookie": `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires}`,
            Location: "/dashboardAdmin"
        }
    })
}