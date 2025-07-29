import { ArgsOf, Client, Discord, On } from "discordx";
import type { Message } from "discord.js";
import config from "@/../config.json";
import assert from "node:assert";

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
            return;
        }

        await message.react(config.emojis.star);
        await message.react(config.emojis.thumbs_up);
        await message.react(config.emojis.thumbs_down);
    }
}
