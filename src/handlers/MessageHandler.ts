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
        // todo: Update logic to only have a chance of speaking.
        const corpus: string[] = this._dataStore.get(DataStoreKeys.Corpus);
        message.channel.sendMessage(corpus[Utility.randomNumber(0, corpus.length)]);
    }
}