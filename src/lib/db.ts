import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME!;

if (!uri) throw new Error("Falta MONGODB_URI en el .env");

let cachedClient: MongoClient | null = null;

export const connectToDatabase = async () => {
    if (!cachedClient) {
        cachedClient = new MongoClient(uri);
        await cachedClient.connect();
        console.log("✅ Conectado a MongoDB Atlas");
    }
    return cachedClient.db(dbName);
};
