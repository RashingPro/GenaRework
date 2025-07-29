import dotenv from "dotenv";
import Bot from "@/bot";

dotenv.config();

async function main() {
    const token = process.env.TOKEN
    if (!token) {
        throw new Error("Token not found. Please check .env file")
    }

    const bot = new Bot();

    await bot.start(token);
}

void main();
