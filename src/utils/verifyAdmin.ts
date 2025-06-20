import { MongoClient } from "mongodb";
import bcrypt from "bcrypt"
import "dotenv/config"

const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db(process.env.DB_NAME);
const admins = db.collection("admins")

export async function verifiAdmin(username: string, password: string) {
    const user = await admins.findOne({ username })
    if (!user) return false

    const match = await bcrypt.compare(password, user.password)
    return match ? user : false
}