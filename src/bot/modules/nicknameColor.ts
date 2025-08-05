import { Discord, Slash, SlashGroup, SlashOption, Client } from "discordx";
import { inject, injectable } from "tsyringe";
import Logger from "@/logger";
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
    MessageFlags,
    ColorResolvable,
    EmbedBuilder
} from "discord.js";

@Discord()
@injectable()
@SlashGroup({ name: "color", description: "Настройка цвета никнейма" })
@SlashGroup("color")
export class NicknameColor {
    public constructor(@inject(Logger) private readonly logger: Logger) {}

    @Slash({ name: "change", description: "Поменять цвет ника" })
    public async change(
        @SlashOption({
            name: "color",
            description: "hex или r,g,b",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        color: string,
        interaction: CommandInteraction,
        client: Client
    ) {
        if (!interaction.guild) return;
        const member = interaction.member as GuildMember | null;
        if (!member) return;

        const isHex = color.match(/^#?(\d|[a-f]){6}$/);
        if (!(isHex || color.match(/^\d{1,3},\d{1,3},\d{1,3}$/))) {
            await interaction.reply({
                content: `Некорректный цвет: \`${color}\`. Пожалуйста укажите цвет в формате hex или r,g,b`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        let colorResolvable: ColorResolvable;
        if (isHex) colorResolvable = "#" + color.replace("#", "");
        else {
            const arr = color.split(",").map(val => parseInt(val));

            if (arr.filter(val => val >= 0 && val <= 255).length < arr.length) {
                await interaction.reply({
                    content: `Некорректный цвет: \`${color}\`. Пожалуйста укажите цвет в формате hex или r,g,b`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            colorResolvable = [arr[0], arr[1], arr[2]];
        }

        await member.fetch();
        const roleExists = member.roles.cache.find(val => val.name == "Кастомный цвет");
        if (roleExists) await roleExists.edit({ color: colorResolvable });
        else {
            if (!client.user) return;
            const botRole = interaction.guild.members.resolve(client.user.id)?.roles.highest;
            if (!botRole) return;
            const role = await interaction.guild.roles.create({
                name: "Кастомный цвет",
                color: colorResolvable,
                position: botRole.position
            });
            await member.roles.add(role);
        }
        const embed = new EmbedBuilder().setColor(colorResolvable).setTitle("Цвет изменен успешно!");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    @Slash({ name: "delete", description: "Удалить цвет ника" })
    public async delete(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember | null;
        const guild = interaction.guild;
        if (!member || !guild) return;
        await member.fetch();
        member.roles.cache
            .filter(role => role.name === "Кастомный цвет")
            .map(async role => await guild.roles.delete(role.id));
        await interaction.reply({
            content: "Цвет удален! Если он остался – пожалуйста обратитесь к админам",
            flags: MessageFlags.Ephemeral
        });
    }
}
