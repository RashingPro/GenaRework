export enum Privacy {
    "public",
    "private"
}

export interface ManagementVoiceChannel {
    ownerId: string;
    channelId: string;
    bannedMembers: string[];
    allowedMembers: string[];
    settings: {
        privacy: Privacy;
        visibility: Privacy;
        maxUsers: number;
    };
}

export class VoiceChannelsSettingsStorage {
    private storage: ManagementVoiceChannel[] = [];

    public addChannel(options: ManagementVoiceChannel) {
        const found = this.storage.find(val => val.channelId === options.channelId);
        if (found) throw new Error("This channel already exists in storage");
        this.storage.push(options);
    }

    public removeChannel(channelId: string) {
        const index = this.storage.findIndex(val => val.channelId === channelId);
        if (index < 0) throw new Error("This channel is not exists in storage");
        this.storage.splice(index, 1);
    }

    public editChannel(channelId: string, overrideOptions: Partial<ManagementVoiceChannel>) {
        const index = this.storage.findIndex(val => val.channelId === channelId);
        if (index < 0) throw new Error("This channel is not exists in storage");
        this.storage[index] = { ...this.storage[index], ...overrideOptions };
    }

    public getChannel(channelId: string) {
        const channel = this.storage.find(val => val.channelId === channelId);
        if (!channel) throw new Error("This channel is not exists in storage");
        return channel;
    }

    public getChannels(ownerId: string) {
        return this.storage.filter(val => val.ownerId === ownerId);
    }
}
