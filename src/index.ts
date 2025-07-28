import dotenv from "dotenv";
import Bot from "@/bot";

dotenv.config();

async function main() {
    const bot = new Bot();

    if (!process.env.TOKEN) throw new Error();

    await bot.start(process.env.TOKEN);
}

void main();
