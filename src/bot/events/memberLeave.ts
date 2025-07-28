import { ArgsOf, Client, Discord, On } from "discordx";
import config from "@/../config.json";

@Discord()
export abstract class MemberLeave {
    @On({ event: "guildMemberRemove" })
    async onMemberRemove([member]: ArgsOf<"guildMemberRemove">) {
        if (!member.guild.systemChannelId) return;
        const channel = await member.guild.channels.fetch(member.guild.systemChannelId);
        const msg = config.messages.leave[Math.floor(Math.random() * config.messages.leave.length)];
        if (!channel || !channel.isSendable()) return;
        await channel.send(msg.replace("{0}", `<@${member.id}>`));
    }
}
