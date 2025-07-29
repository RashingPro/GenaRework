import { ArgsOf, Client, Discord, On } from "discordx";
import type { Message } from "discord.js";
import config from "@/../config.json";

@Discord()
export abstract class OnMessage {
    @On({ event: "messageCreate" })
    async onMessage([message]: ArgsOf<"messageCreate">, client: Client) {
        if (!client.user) return;

        if (message.author.id == client.user.id) return;
        await this.handlePostChannels(message);
    }

    async handlePostChannels(message: Message) {
        if (!config.channels.posts.includes(parseInt(message.channel.id))) return;

        let flag = false;
        if (!message.messageSnapshots.first()) {
            if (!message.attachments.first()) flag = true;
        } else {
            // Мне хочется сделать тут функциональщину,
            // но раз это твой стиль, то не буду
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

        try {
            await message.react(config.emojis.star);
        } catch (e) {
            console.error(`Cannot react with star emoji! ${e}`);
        }
        await message.react("👍");
        await message.react("👎");
    }
}
