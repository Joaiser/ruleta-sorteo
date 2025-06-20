import { MongoClient } from "mongodb";
import bycrpt from "bcrypt"
import "dotenv/config"

async function main() {
    const username = process.argv[2];
    const password = process.argv[3]

    if (!username || !password) {
        console.error("❌ Uso: npm run create-admin <usuario> <contraseña>");
        process.exit(1);
    }

    const hash = await bycrpt.hash(password, 10)

    if (!process.env.MONGODB_URI) {
        console.error("❌ La variable de entorno MONGODB_URI no está definida.");
        process.exit(1);
    }
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect()

    const db = client.db(process.env.DB_NAME)
    const admins = db.collection("admins")

    const exists = await admins.findOne({ username })

    if (exists) {
        console.log("El usuario ya existe");
        process.exit(1)
    }

    await admins.insertOne({ username, password: hash })

    console.log("Usuario creado exitosamente");

    await client.close()
}

main()