import Logger from "@/logger";
import { ArgsOf, Discord, On } from "discordx";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
export class Error {
    constructor(@inject(Logger) private readonly logger: Logger) {}

    @On({ event: "error" })
    async onError([error]: ArgsOf<"error">) {
        console.error(error);
        await this.logger.error("Caught runtime error:", error);
    }
}
