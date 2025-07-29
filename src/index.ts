import dotenv from "dotenv";
import Bot from "@/bot";
import Logger from "@/logger";

dotenv.config();

async function main() {
    const token = process.env.TOKEN;
    if (!token) {
        throw new Error("Token not found. Please check .env file");
    }

    const bot = new Bot();
    try {
        await bot.start(token);
    } catch (error) {
        await Logger.error("Caught runtime error:", error);
    }
}

void main();
