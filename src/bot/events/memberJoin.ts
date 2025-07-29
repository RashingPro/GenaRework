import { ArgsOf, Discord, On } from "discordx";
import config from "@/../config.json";
import Logger from "@/logger";

@Discord()
export abstract class MemberJoin {
    @On({ event: "guildMemberAdd" })
    async onMemberAdd([member]: ArgsOf<"guildMemberAdd">) {
        await Logger.log(`Member ${member.displayName} (${member.id}) joined`);

        const channel = member.guild.systemChannel;
        if (!channel || !channel.isSendable()) return;

        const msg = config.messages.join[Math.floor(Math.random() * config.messages.join.length)];
        await channel.send(msg.replace("{0}", `<@${member.id}>`));
    }
}
