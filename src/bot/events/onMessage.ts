import config from "@/../config.json";
import Logger from "@/logger";
import type { Message } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";
import assert from "node:assert";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
export class OnMessage {
    constructor(@inject(Logger) private readonly logger: Logger) {}

    @On({ event: "messageCreate" })
    async onMessage([message]: ArgsOf<"messageCreate">, client: Client) {
        assert(client.user);
        if (message.author.id == client.user.id) return;
        await this.handlePostChannels(message);
    }

    async handlePostChannels(message: Message) {
        if (!config.channels.posts.includes(message.channel.id)) return;
        if (message.channel.isDMBased()) return;
        if (!message.member) return;

        await this.logger.log(
            `Member ${message.member.displayName} (${message.author.id}) send message to post channel #${message.channel.name}`
        );

        let flag = false;
        if (!message.messageSnapshots.first()) {
            if (!message.attachments.first()) flag = true;
        } else {
            for (const snapshot of message.messageSnapshots.values()) {
                if (!snapshot.attachments.first()) {
                    flag = true;
                    break;
                }
            }
        }

        if (flag) {
            await message.delete();
            await this.logger.log(
                `Message from user ${message.member.displayName} (${message.author.id}) in post channel #${message.channel.name} deleted`
            );
            return;
        }

        try {
            await message.react(config.emojis.star);
        } catch (error) {
            await this.logger.error("Failed to react with star\n", error);
        }

        await message.react(config.emojis.thumbs_up);
        await message.react(config.emojis.thumbs_down);
        await this.logger.log(
            `Reactions putted on ${message.member.displayName}'s (${message.author.id}) message in post channel #${message.channel.name}`
        );
    }
}
