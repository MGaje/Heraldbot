import * as Discord from "discord.js";
import * as Winston from "winston";

import { Config } from "./Config";
import { MessageHandler } from "../handlers/MessageHandler";

/**
 * Main bot construct.
 */
export class Heraldbot
{
    public botClient: Discord.Client;
    public config: Config;
    public stdin: NodeJS.Socket;
    public msgHandler: MessageHandler;

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
        Winston.log("debug", "Setting up handlers.");
        this.setupHandlers();
        
        Winston.log("debug", "Setting up event listeners.");
        this.setupListeners();

        Winston.log("debug", "Attempting to login.");
        await this.botClient.login(this.config.botToken);

        Winston.log("debug", "Heraldbot is now running.");
    }

    /**
     * Sets up all the handlers.
     */
    private setupHandlers()
    {
        Winston.log("debug", "Setting up Message Handler.");
        this.msgHandler = new MessageHandler();
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

        // Upon Discord server message.
        this.botClient.on("message", message =>
        {
            this.msgHandler.handleMsg(message);
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