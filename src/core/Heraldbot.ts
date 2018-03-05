import * as Discord from "discord.js";
import * as Winston from "winston";

import { BotId, DataStoreKeys } from "./constants";
import { Config } from "./Config";
import { MessageHandler } from "../handlers/MessageHandler";
import { DataStore } from "./DataStore";

/**
 * Main bot construct.
 */
export class Heraldbot
{
    private _botClient: Discord.Client;
    private _config: Config;
    private _stdin: NodeJS.Socket;
    private _msgHandler: MessageHandler;
    private _dataStore: DataStore;

    /**
     * Default constructor.
     * @constructor
     */
    constructor()
    {
        this._botClient = new Discord.Client();
        this._dataStore = new DataStore();
        this._config = require("../../config.json");
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
        await this._botClient.login(this._config.botToken);

        Winston.log("debug", "Heraldbot is now running.");
    }

    /**
     * Sets up all the handlers.
     */
    private setupHandlers()
    {
        Winston.log("debug", "Setting up Message Handler.");
        this._msgHandler = new MessageHandler(this._dataStore);
    }
    
    /**
     * Sets up discord.js event listeners.
     */
    private setupListeners()
    {
        this._stdin = process.openStdin();

        // Upon successful Discord connection.
        this._botClient.on('ready', () =>
        {
            const testCorpus: string[] = ["Statement 1", "Statement 2", "Statement 3", "Statement 4", "Statement 5"];
            this._dataStore.set(DataStoreKeys.Corpus, testCorpus);

            Winston.log("debug", "Connected to Discord.");
        });

        // Upon Discord server message.
        this._botClient.on("message", message =>
        {
            // Ignore messages from itself.
            if (message.author.id === BotId) return;
            
            this._msgHandler.handleMsg(message);
        });

        // Upon user elected termination.
        this._stdin.addListener("data", d =>
        {
            const input: string = d.toString().trim();
            if (input === "quit")
            {
                this._stdin.removeAllListeners();
                this._botClient.destroy();

                process.exit();
            }
        });
    }
}