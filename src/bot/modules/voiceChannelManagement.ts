import Logger from "@/logger";
import config from "config.json";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    MessageActionRowComponentBuilder,
    MessageFlags,
    ModalBuilder,
    ModalSubmitInteraction,
    PermissionOverwriteOptions,
    TextInputBuilder,
    TextInputStyle,
    VoiceBasedChannel,
    VoiceState
} from "discord.js";
import { ArgsOf, ButtonComponent, Discord, ModalComponent, On } from "discordx";
import { inject, injectable } from "tsyringe";
import { ManagementVoiceChannel, Privacy, VoiceChannelsSettingsStorage } from "@/types";

namespace Utils {
    export function optionsToMenu(options: ManagementVoiceChannel) {
        const configShortcut = config.voice_channels_management;

        const privacyValue =
            options.settings.privacy == Privacy.public
                ? configShortcut.settings.privacy.public
                : configShortcut.settings.privacy.private;
        const privacyStyle = options.settings.privacy == Privacy.public ? ButtonStyle.Success : ButtonStyle.Danger;

        const visibilityValue =
            options.settings.visibility == Privacy.public
                ? configShortcut.settings.visibility.public
                : configShortcut.settings.visibility.private;
        const visibilityStyle =
            options.settings.visibility == Privacy.public ? ButtonStyle.Success : ButtonStyle.Danger;

        const isMaxUsersUnlimited = options.settings.maxUsers < 1;

        return [
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new ButtonBuilder()
                    .setLabel(`${configShortcut.settings.privacy.label}: ${privacyValue}`)
                    .setStyle(privacyStyle)
                    .setCustomId("vcm:togglePrivacy"),
                new ButtonBuilder()
                    .setLabel(`${configShortcut.settings.visibility.label}: ${visibilityValue}`)
                    .setStyle(visibilityStyle)
                    .setCustomId("vcm:toggleVisibility")
            ),
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new ButtonBuilder()
                    .setLabel(
                        `Максимальное кол-во участников: ${isMaxUsersUnlimited ? "Не ограничено" : options.settings.maxUsers}`
                    )
                    .setStyle(isMaxUsersUnlimited ? ButtonStyle.Success : ButtonStyle.Primary)
                    .setCustomId("vcm:maxMembers")
            )
        ];
    }

    export function optionsToPermissionsOverwrites(
        options: ManagementVoiceChannel,
        everyoneRoleId: string
    ): Record<string, PermissionOverwriteOptions> {
        const result: Record<string, PermissionOverwriteOptions> = {};
        for (const userId of [options.ownerId, ...options.allowedMembers]) {
            result[userId] = { ViewChannel: true, Connect: true };
        }
        result[everyoneRoleId] = {
            ViewChannel: options.settings.visibility == Privacy.public,
            Connect: options.settings.privacy == Privacy.public
        };
        return result;
    }

    export async function applyOptionsToChannel(channel: VoiceBasedChannel, options: ManagementVoiceChannel) {
        const permissions = optionsToPermissionsOverwrites(options, channel.guildId);

        for (const [key, value] of Object.entries(permissions)) {
            await channel.permissionOverwrites.edit(key, value);
        }

        await channel.setUserLimit(options.settings.maxUsers);
    }
}

@Discord()
@injectable()
export class VoiceChannelManagement {
    public constructor(
        @inject(Logger) private readonly logger: Logger,
        @inject(VoiceChannelsSettingsStorage)
        private readonly voiceChannelsSettingsStorage: VoiceChannelsSettingsStorage
    ) {}

    @On({ event: "voiceStateUpdate" })
    public async onVoiceStateUpdate([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
        await this.handleChannelCreation(oldState, newState);
    }

    private async handleChannelCreation(_oldState: VoiceState, newState: VoiceState) {
        const channel = newState.channel;
        if (!channel || channel.id !== config.voice_channels_management.create_channel) return;
        const category = channel.parent;
        if (!category) return;
        if (!newState.member) return;

        if (
            this.voiceChannelsSettingsStorage.getChannels(newState.member.id).length >=
            config.voice_channels_management.max_channels_per_user
        ) {
            await newState.disconnect();
            return;
        }

        await this.logger.log(
            `Creating voice channel for user ${newState.member?.displayName} (${newState.member?.id})`
        );

        const options = {
            channelId: "",
            ownerId: newState.member.id,
            allowedMembers: [],
            bannedMembers: [],
            settings: {
                privacy: Privacy.private,
                visibility: Privacy.private,
                maxUsers: 2
            }
        };

        const newChannel = await category.children.create({
            name: `Канал ${newState.member?.user.username}`,
            type: ChannelType.GuildVoice
        });
        options.channelId = newChannel.id;

        await Utils.applyOptionsToChannel(newChannel, options);

        this.voiceChannelsSettingsStorage.addChannel(options);

        await newChannel.send({ components: Utils.optionsToMenu(options) });

        try {
            await newState.setChannel(newChannel);
            await this.logger.log(
                `Successfully created voice channel for user ${newState.member?.displayName} (${newState.member?.id})`
            );
        } catch (err) {
            await this.logger.error(
                `Failed to move user ${newState.member?.displayName} (${newState.member?.id}) in created channel. Error:`,
                err
            );
        }
    }

    private async handleSettingsChange(
        interaction: ButtonInteraction | ModalSubmitInteraction,
        newSettingsFn: (oldSettings: ManagementVoiceChannel) => ManagementVoiceChannel
    ) {
        const channel = interaction.channel;
        if (!channel || !interaction.message) return;
        if (!channel.isVoiceBased()) {
            await interaction.message.delete();
            return;
        }
        let channelSettings;
        try {
            channelSettings = this.voiceChannelsSettingsStorage.getChannel(channel.id);
        } catch {
            await interaction.message.delete();
            return;
        }

        const newSettings = newSettingsFn(channelSettings);

        this.voiceChannelsSettingsStorage.editChannel(channel.id, newSettings);
        await Utils.applyOptionsToChannel(channel, newSettings);
        await interaction.message.edit({ components: Utils.optionsToMenu(newSettings) });
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.deleteReply();
    }

    @ButtonComponent({ id: "vcm:togglePrivacy" })
    public async togglePrivacyHandler(interaction: ButtonInteraction) {
        await this.handleSettingsChange(interaction, oldSettings => {
            return {
                ...oldSettings,
                settings: {
                    ...oldSettings.settings,
                    privacy: oldSettings.settings.privacy == Privacy.public ? Privacy.private : Privacy.public
                }
            };
        });
    }

    @ButtonComponent({ id: "vcm:toggleVisibility" })
    public async toggleVisibilityHandler(interaction: ButtonInteraction) {
        await this.handleSettingsChange(interaction, oldSettings => {
            return {
                ...oldSettings,
                settings: {
                    ...oldSettings.settings,
                    visibility: oldSettings.settings.visibility == Privacy.public ? Privacy.private : Privacy.public
                }
            };
        });
    }

    @ButtonComponent({ id: "vcm:maxMembers" })
    public async maxMembersHandler(interaction: ButtonInteraction) {
        const modal = new ModalBuilder()
            .setTitle("Изменить максимальное кол-во учатсников")
            .setCustomId("vcm:editMaxMembersModal")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId("maxMembersCount")
                        .setLabel("Максимальное кол-во участников (0-99)")
                        .setPlaceholder("0 - неограничено")
                        .setStyle(TextInputStyle.Short)
                )
            );
        await interaction.showModal(modal);
    }

    @ModalComponent({ id: "vcm:editMaxMembersModal" })
    public async editMaxMembersModalHandler(interaction: ModalSubmitInteraction) {
        const value = parseInt(interaction.fields.getTextInputValue("maxMembersCount"));
        if (isNaN(value) || value > 99 || value < 0) {
            await interaction.reply({
                flags: MessageFlags.Ephemeral,
                content: "Пожалуйста, введите число от 0 до 99, где 0 - без ограничений"
            });
            return;
        }
        await this.handleSettingsChange(interaction, oldSettings => {
            return { ...oldSettings, settings: { ...oldSettings.settings, maxUsers: value } };
        });
    }
}
