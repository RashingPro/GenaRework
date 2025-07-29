import { ArgsOf, Client, Discord, On } from "discordx";
import config from "config.json";

@Discord()
export abstract class OnReaction {
    @On({ event: "messageReactionAdd" })
    async onReactionAdd([reaction]: ArgsOf<"messageReactionAdd">) {
        const configChannels = config.channels.roles as Record<string, Record<string, Record<string, string>>>;
        if (!Object.keys(configChannels).includes(reaction.message.channel.id)) return;
        const configMessages = configChannels[reaction.message.channel.id];
        if (!Object.keys(configMessages).includes(reaction.message.id)) return;
        const configRoles = configMessages[reaction.message.id];
        if (!Object.keys(configRoles).includes(reaction.emoji.toString())) return;

        const roleId = configRoles[reaction.emoji.toString()];
        await reaction.message.fetch();
        if (!reaction.message.member) return;
        await reaction.message.member.roles.add(roleId);
    }
}
