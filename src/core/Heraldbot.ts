import * as fs from "fs";
import * as path from "path";

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
        Winston.log("debug", "Caching data.");
        await this.cacheData();

        Winston.log("debug", "Setting up handlers.");
        this.setupHandlers();
        
        Winston.log("debug", "Setting up event listeners.");
        this.setupListeners();

        Winston.log("debug", "Attempting to login.");
        await this._botClient.login(this._config.botToken);

        Winston.log("debug", "Heraldbot is now running.");
    }

    /** 
     * Cache some data (probably just the corpus text). 
     */
    private cacheData(): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            fs.readFile(path.join(__dirname, "../../assets/corpus.txt"), "utf8", (err, contents) => 
            {
                if (err)
                {
                    reject(err);
                }

                const parsedContents: string[] = contents.split("\n");
                this._dataStore.set(DataStoreKeys.Corpus, parsedContents);
                resolve();
            });
        });
        
        
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