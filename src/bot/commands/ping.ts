import { IsOnAllowedGuild } from "@/bot/guards";
import config from "config.json";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Client, Discord, Guard, Slash } from "discordx";

@Discord()
export class Ping {
    @Slash({ name: "ping", description: "Some cool text goes here" })
    @Guard(IsOnAllowedGuild)
    async ping(interaction: CommandInteraction, client: Client) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${config.emojis.ping_pong} Pong!`)
            .setDescription(`Bot latency: ${client.ws.ping}ms`);
        await interaction.reply({ embeds: [embed] });
    }
}
