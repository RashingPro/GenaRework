import dotenv from "dotenv";
import Bot from "@/bot";

dotenv.config();

async function main() {
    const bot = new Bot();
    const TOKEN = process.env.TOKEN;

    if (!TOKEN) throw new Error("No token provided, check your dotenv file!");

    await bot.start(TOKEN);
}

void main();
