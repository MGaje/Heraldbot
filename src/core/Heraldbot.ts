import * as Discord from "discord.js";
import * as Winston from "winston";

import { Config } from "./Config";

/**
 * Main bot construct.
 */
export class Heraldbot
{
    public botClient: Discord.Client;
    public config: Config;
    public stdin: NodeJS.Socket;

    /**
     * Default constructor.
     * @constructor
     */
    constructor()
    {
        this.botClient = new Discord.Client();
        this.config = require("../../config.json");
    }

    /**
     * Run the bot.
     */
    public async run(): Promise<void>
    {
        Winston.log("debug", "Setting up event listeners.");
        this.setupListeners();

        Winston.log("debug", "Attempting to login.");
        await this.botClient.login(this.config.botToken);

        Winston.log("debug", "Heraldbot is now running.");
    }
    
    /**
     * Sets up discord.js event listeners.
     */
    private setupListeners()
    {
        this.stdin = process.openStdin();

        // Upon successful Discord connection.
        this.botClient.on('ready', () =>
        {
            Winston.log("debug", "Connected to Discord.");
        });

        // Upon user elected termination.
        this.stdin.addListener("data", d =>
        {
            const input: string = d.toString().trim();
            if (input === "quit")
            {
                this.stdin.removeAllListeners();
                this.botClient.destroy();

                process.exit();
            }
        });
    }
}