import * as Discord from "discord.js";
import * as Winston from "winston";

import { DataStoreKeys } from "../core/constants";
import { Utility } from "../core/Utility";
import { DataStore } from "../core/DataStore";

/**
 * Handles Discord messages from users.
 */
export class MessageHandler
{
    private _dataStore: DataStore;

    /**
     * Default constructor.
     * @constructor
     */
    constructor(dataStore: DataStore)
    {
        this._dataStore = dataStore;
    }

    /**
     * Handle incoming Discord message.
     * @param {Discord.Message} message discord.js message instance.
     */
    public handleMsg(message: Discord.Message)
    {
        const chance: number = Utility.randomNumber(1, 36);
        Winston.log("debug", "Chance: " + chance);

        if (chance === 1)
        {
            const corpus: string[] = this._dataStore.get(DataStoreKeys.Corpus);
            message.channel.send(corpus[Utility.randomNumber(0, corpus.length)]);
        }        
    }
}