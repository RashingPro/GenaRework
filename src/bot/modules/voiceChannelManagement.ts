import Logger from "@/logger";
import config from "config.json";
import { VoiceState, ChannelType } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
export class VoiceChannelManagement {
    constructor(@inject(Logger) private readonly logger: Logger) {}

    @On({ event: "voiceStateUpdate" })
    async onVoiceStateUpdate([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
        await this.handleChannelCreation(oldState, newState);
    }

    async handleChannelCreation(oldState: VoiceState, newState: VoiceState) {
        await newState.fetch();
        await newState.member?.fetch();

        const channel = newState.channel;
        if (!channel || channel.id !== config.voice_channels_management.create_channel) return;
        const category = channel.parent;
        if (!category) return;

        await this.logger.log(
            `Creating voice channel for user ${newState.member?.displayName} (${newState.member?.id})`
        );

        const newChannel = await category.children.create({
            name: `Канал ${newState.member?.user.username}`,
            type: ChannelType.GuildVoice
        });
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
}
