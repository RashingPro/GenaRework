import Logger from "@/logger";
import config from "config.json";
import { MessageReaction, PartialMessageReaction } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
export class OnReaction {
    constructor(@inject(Logger) private readonly logger: Logger) {}

    @On({ event: "messageReactionAdd" })
    async onReactionAdd([reaction]: ArgsOf<"messageReactionAdd">) {
        const roleId = await this.handleReaction(reaction);
        if (!roleId) return;
        await reaction.message.fetch();
        if (!reaction.message.member) return;
        await reaction.message.member.roles.add(roleId);
    }

    @On({ event: "messageReactionRemove" })
    async onReactionRemove([reaction]: ArgsOf<"messageReactionRemove">) {
        const roleId = await this.handleReaction(reaction);
        if (!roleId) return;
        await reaction.message.fetch();
        if (!reaction.message.member) return;
        await reaction.message.member.roles.remove(roleId);
    }

    private async handleReaction(reaction: MessageReaction | PartialMessageReaction) {
        const configChannels = config.channels.roles as Record<string, Record<string, Record<string, string>>>;
        if (!Object.keys(configChannels).includes(reaction.message.channel.id)) return;
        const configMessages = configChannels[reaction.message.channel.id];
        if (!Object.keys(configMessages).includes(reaction.message.id)) return;
        const configRoles = configMessages[reaction.message.id];
        if (!Object.keys(configRoles).includes(reaction.emoji.toString())) return;

        return configRoles[reaction.emoji.toString()];
    }
}
