import Bot from "@/bot";
import Logger from "@/logger";
import { tsyringeDependencyRegistryEngine } from "@discordx/di";
import { DIService } from "discordx";
import dotenv from "dotenv";
import { container } from "tsyringe";

dotenv.config();

async function main() {
    const logger = new Logger("./runtime/latest.log");
    container.register(Logger, { useValue: logger });
    DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

    const token = process.env.TOKEN;
    if (!token) {
        throw new Error("Token not found. Please check .env file");
    }

    const bot = new Bot(logger);
    try {
        await bot.start(token);
    } catch (error) {
        await logger.error("Caught runtime error:", error);
    }
}

void main();
