import Logger from "@/logger";
import { importx } from "@discordx/importer";
import config from "config.json";
import { IntentsBitField, Partials } from "discord.js";
import { Client } from "discordx";

export default class Bot {
    constructor(public logger: Logger) {
        this.client = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.MessageContent
            ],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember],
            silent: false
        });

        this.client.once("ready", async () => {
            await this.client.initApplicationCommands();
            await this.logger.log(`${config.emojis.tick} Bot is running`);
            await this.logger.log(`${config.emojis.blue_triangle_right} Waiting for WebSocket connection...`);
            await new Promise(resolve => {
                const check = () => {
                    if (this.client.ws.ping > 0) {
                        if (interval) clearInterval(interval);
                        resolve(null);
                    }
                };
                check();
                const interval = setInterval(check, 1000);
            });
            await this.logger.log(
                `${config.emojis.tick} WebSocket connection established with ping ${this.client.ws.ping}ms`
            );
            this.isReady = true;
        });

        this.client.on("interactionCreate", async interaction => {
            await this.client.executeInteraction(interaction);
        });
    }

    public readonly client;
    private _isReady: boolean = false; // isn't in use now, for later use

    public get isReady() {
        return this._isReady;
    }
    private set isReady(value: boolean) {
        this._isReady = value;
    }

    async start(token: string) {
        await importx(`${__dirname}/bot/commands/**/*.{js,ts}`);
        await importx(`${__dirname}/bot/modules/**/*.{js,ts}`);
        await this.client.login(token);
    }
}
