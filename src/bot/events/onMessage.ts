import { ArgsOf, Client, Discord, On } from "discordx";
import type { Message } from "discord.js";
import config from "@/../config.json";
import assert from "node:assert";
import Logger from "@/logger";

@Discord()
export abstract class OnMessage {
    @On({ event: "messageCreate" })
    async onMessage([message]: ArgsOf<"messageCreate">, client: Client) {
        assert(client.user);
        if (message.author.id == client.user.id) return;
        await this.handlePostChannels(message, client);
    }

    async handlePostChannels(message: Message, client: Client) {
        if (!config.channels.posts.includes(message.channel.id)) return;
        if (message.channel.isDMBased()) return;
        if (!message.member) return;

        await Logger.log(
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
            await Logger.log(
                `Message from user ${message.member.displayName} (${message.author.id}) in post channel #${message.channel.name} deleted`
            );
            return;
        }

        await message.react(config.emojis.star);
        await message.react(config.emojis.thumbs_up);
        await message.react(config.emojis.thumbs_down);
        await Logger.log(
            `Reactions putted successfully on ${message.member.displayName}'s (${message.author.id}) message in post channel #${message.channel.name}`
        );
    }
}
