import config from "@/../config.json";
import Logger from "@/logger";
import { ArgsOf, Discord, On } from "discordx";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
export class MemberJoin {
    public constructor(@inject(Logger) private readonly logger: Logger) {}

    @On({ event: "guildMemberAdd" })
    public async onMemberAdd([member]: ArgsOf<"guildMemberAdd">) {
        await this.logger.log(`Member ${member.displayName} (${member.id}) joined`);

        const channel = member.guild.systemChannel;
        if (!channel || !channel.isSendable()) return;

        const msg = config.messages.join[Math.floor(Math.random() * config.messages.join.length)];
        await channel.send(msg.replace("{0}", `<@${member.id}>`));
    }
}
