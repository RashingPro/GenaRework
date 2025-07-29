import config from "config.json";
import { CommandInteraction } from "discord.js";
import { ArgsOf, GuardFunction } from "discordx";

export function IsOnGuild(guildId: string) {
    const guard: GuardFunction<CommandInteraction> = async (interaction, client, next) => {
        if (!interaction.guild) return;
        if (interaction.guild.id === guildId) await next();
    };

    return guard;
}

export const IsOnAllowedGuild: GuardFunction<CommandInteraction> = async (interaction, client, next) => {
    if (!interaction.guild) return;
    if (config.guilds.includes(interaction.guild.id)) await next();
};
