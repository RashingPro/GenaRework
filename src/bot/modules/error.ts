import Logger from "@/logger";
import { ArgsOf, Discord, On } from "discordx";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
export class Error {
    public constructor(@inject(Logger) private readonly logger: Logger) {}

    @On({ event: "error" })
    public async onError([error]: ArgsOf<"error">) {
        await this.logger.error("Caught runtime error:", error);
    }
}
