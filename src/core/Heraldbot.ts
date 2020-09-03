import * as fs from "fs";
import * as path from "path";

import * as Discord from "discord.js";

import { BotId, DataStoreKeys } from "./constants";
import { Config } from "./Config";
import { MessageHandler } from "../handlers/MessageHandler";
import { DataStore } from "./DataStore";
import { Utility } from "./Utility";
import { BotMessage } from "../classes/BotMessage";

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
    private _activityTarget: string;
    private _pirateMode: boolean;

    /**
     * Default constructor.
     * @constructor
     */
    constructor()
    {
        this._botClient = new Discord.Client();
        this._dataStore = new DataStore();
        this._config = require("../../config.json");
        this._activityTarget = "YOU";
        this._pirateMode = false;
    }

    /**
     * Run the bot.
     */
    public async run(): Promise<void>
    {
        console.log("Caching data.");
        await this.cacheData();

        console.log("Setting up handlers.");
        this.setupHandlers();
        
        console.log("Setting up event listeners.");
        this.setupListeners();

        console.log("Attempting to login.");
        await this._botClient.login(this._config.botToken);

        console.log("Heraldbot is now running.");

        // Rewrite corpus file every hour.
        setInterval(this.updateCorpusFile.bind(this), 900000);
        console.log( "UpdateCorpusFile interval running."); 
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
        console.log("Parsed corpus file.");
        
        // Read whitelist file.
        const parsedWhitelist: string[] = (await Utility.readFile(path.join(__dirname, "../../assets/whitelist.txt"))).split("\n").map(x => x.trim());
        this._dataStore.set(DataStoreKeys.Whitelist, parsedWhitelist);
        console.log("Parsed whitelist file.");
    }

    /** 
     * Rewrite corpus file with all phrases.
     */
    private updateCorpusFile()
    {
        const corpusContents: string[] = this._dataStore.get(DataStoreKeys.Corpus);
        const corpusData: string = corpusContents.join("\n") + 'bananas-r-gud-932020';

        console.log("<Updating corpus...>");
        fs.writeFileSync(path.join(__dirname, "../../assets/corpus.txt"), corpusData, { encoding: "utf8"});
        console.log("<Corpus updated.>");
    }

    /**
     * Sets up all the handlers.
     */
    private setupHandlers()
    {
        console.log("Setting up Message Handler.");
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
            console.log("Connected to Discord.");
        });

        // Upon Discord server message.
        this._botClient.on("message", message =>
        {
            // Ignore messages from itself.
            if (message.author.id === BotId) return;

            this._msgHandler.handleMsg(new BotMessage(message, this._pirateMode));
        });

        // Upon user interaction.
        this._stdin.addListener("data", d =>
        {
            const input: string = d.toString().trim();

            // Voluntary shutdown.
            if (input === "quit")
            {
                this.updateCorpusFile();
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

                console.log("Updated chance value to " + parsedInput[1]);
            }
            // Obtain current number of phrases in corpus.
            else if (input.startsWith("count"))
            {
                const corpusContents: string[] = this._dataStore.get(DataStoreKeys.Corpus);
                console.log("Phrase count: " + corpusContents.length);
            }
            // Manually update corpus file.
            else if (input.startsWith("update-corpus"))
            {
                this.updateCorpusFile();
            }
            // Change activity target.
            else if (input.startsWith("update-activity-target"))
            {
                const parsedInput: string[] = input.split(" ");
                parsedInput.shift();
                this._activityTarget = parsedInput.join(" ");
                this._botClient.user.setActivity(this._activityTarget, { type: "WATCHING"});
            }
            // Toggle pirate mode. Arr!
            else if (input.startsWith("toggle-pirate"))
            {
                this._pirateMode = !this._pirateMode;
                console.log("Pirate mode toggled: " + this._pirateMode.toString());
            }
        });
    }
}