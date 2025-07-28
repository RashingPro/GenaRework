import { Client } from "discordx";
import { importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";

export default class Bot {
    constructor() {
        this.client = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildMembers
            ],
            silent: false
        });

        this.client.once("ready", async () => {
            await this.client.initApplicationCommands();
            console.log("✅ Bot is ready!");
        });

        this.client.on("interactionCreate", async (interaction) => {
            await this.client.executeInteraction(interaction);
        });
    }

    public readonly client;

    async start(token: string) {
        await importx(`${__dirname}/bot/commands/**/*.{js,ts}`);
        await importx(`${__dirname}/bot/events/**/*.{js,ts}`);
        await this.client.login(token);
    }
}
