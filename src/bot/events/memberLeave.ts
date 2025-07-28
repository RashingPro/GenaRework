import { ArgsOf, Discord, On } from 'discordx';
import config from '@/../config.json';

@Discord()
export abstract class MemberLeave {
    @On({ event: 'guildMemberRemove' })
    async onMemberRemove([member]: ArgsOf<'guildMemberRemove'>) {
        const channel = member.guild.systemChannel;
        if (!channel || !channel.isSendable()) return;

        const msg = config.messages.leave[Math.floor(Math.random() * config.messages.leave.length)];
        await channel.send(msg.replace('{0}', `<@${member.id}>`));
    }
}
