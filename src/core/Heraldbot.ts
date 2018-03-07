import * as fs from "fs";
import * as path from "path";

import * as Discord from "discord.js";
import * as Winston from "winston";

import { BotId, DataStoreKeys } from "./constants";
import { Config } from "./Config";
import { MessageHandler } from "../handlers/MessageHandler";
import { DataStore } from "./DataStore";
import { Utility } from "./Utility";

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

        // Rewrite corpus file every hour.
        setInterval(this.updateCorpusFile.bind(this), 3600000);
        Winston.log("debug", "UpdateCorpusFile interval running."); 
    }

    /** 
     * Cache some data (probably just the corpus text). 
     */
    private async cacheData(): Promise<void>
    {
        // Set static values.
        this._dataStore.set(DataStoreKeys.Chance, 36);

        // Read corpus file.
        const parsedContents: string[] = (await Utility.readFile(path.join(__dirname, "../../assets/corpus.txt"))).split("\n");
        this._dataStore.set(DataStoreKeys.Corpus, parsedContents);
        Winston.log("debug", "Parsed corpus file.");
        
        // Read whitelist file.
        const parsedWhitelist: string[] = (await Utility.readFile(path.join(__dirname, "../../assets/whitelist.txt"))).split("\n").map(x => x.trim());
        this._dataStore.set(DataStoreKeys.Whitelist, parsedWhitelist);
        Winston.log("debug", "Parsed whitelist file.");
    }

    /** 
     * Rewrite corpus file with all phrases.
     */
    private updateCorpusFile()
    {
        const corpusContents: string[] = this._dataStore.get(DataStoreKeys.Corpus);
        const corpusData: string = corpusContents.join("\n");

        fs.writeFile(path.join(__dirname, "../../assets/corpus.txt"), corpusData, "utf8", err => 
        {
            if (err)
            {
                Winston.log("error", "An error occurred writing the corpus file.");
            }

            Winston.log("debug", "Corpus file written.");
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
            this._botClient.user.setActivity("YOU", { type: "WATCHING"});
            Winston.log("debug", "Connected to Discord.");
        });

        // Upon Discord server message.
        this._botClient.on("message", message =>
        {
            // Ignore messages from itself.
            if (message.author.id === BotId) return;
            
            this._msgHandler.handleMsg(message);
        });

        // Upon user interaction.
        this._stdin.addListener("data", d =>
        {
            const input: string = d.toString().trim();

            // Voluntary shutdown.
            if (input === "quit")
            {
                this._stdin.removeAllListeners();
                this._botClient.destroy();

                process.exit();
            }
            // Setting the "chance" value, which determines how often HeraldBot will speak
            // unprovoked directly.
            else if (input.startsWith("chance"))
            {
                // Assumed format: "chance 35".
                const parsedInput: string[] = input.split(" ");
                this._dataStore.set(DataStoreKeys.Chance, parseInt(parsedInput[1]));
                
                Winston.log("debug", "Updated chance value to " + parsedInput[1]);
            }
            // Obtain current number of phrases in corpus.
            else if (input.startsWith("count"))
            {
                const corpusContents: string[] = this._dataStore.get(DataStoreKeys.Corpus);
                Winston.log("debug", "Phrase count: " + corpusContents.length);
            }
            // Manually update corpus file.
            else if (input.startsWith("update-corpus"))
            {
                this.updateCorpusFile();
            }
        });
    }
}