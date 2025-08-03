import { IsOnAllowedGuild } from "@/bot/guards";
import config from "config.json";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Client, Discord, Guard, Slash } from "discordx";

@Discord()
export class Ping {
    @Slash({ name: "ping", description: "Some cool text goes here" })
    @Guard(IsOnAllowedGuild)
    public async ping(interaction: CommandInteraction, client: Client) {
        let websocketPing: string | number = Math.round(client.ws.ping);
        const interactionPing = Date.now() - interaction.createdTimestamp;

        websocketPing =
            websocketPing < 0 ? "WebSocket connection is not established yet. Check logs for details" : websocketPing;

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${config.emojis.ping_pong} Pong!`)
            .addFields(
                { name: "WebSocket ping", value: `${websocketPing}ms` },
                { name: "Interaction delay (may be wrong)", value: `${interactionPing}ms` }
            );
        await interaction.reply({ embeds: [embed] });
    }
}
