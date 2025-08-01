import config from "@/../config.json";
import Logger from "@/logger";
import { ArgsOf, Discord, On } from "discordx";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
export class MemberLeave {
    constructor(@inject(Logger) private readonly logger: Logger) {}

    @On({ event: "guildMemberRemove" })
    async onMemberRemove([member]: ArgsOf<"guildMemberRemove">) {
        await this.logger.log(`Member ${member.displayName} (${member.id}) left`);

        const channel = member.guild.systemChannel;
        if (!channel || !channel.isSendable()) return;

        const msg = config.messages.leave[Math.floor(Math.random() * config.messages.leave.length)];
        await channel.send(msg.replace("{0}", `<@${member.id}>`));
    }
}
