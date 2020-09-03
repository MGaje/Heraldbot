import * as Discord from "discord.js";
import pirateSpeak = require("pirate-speak");

import { DataStoreKeys, BotName } from "../core/constants";
import { Utility } from "../core/Utility";
import { DataStore } from "../core/DataStore";
import { BotMessage } from "../classes/BotMessage";

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
     * @param {BotMessage} message A message that the bot has received from Discord with additional metadata.
     */
    public handleMsg(message: BotMessage)
    {
        // If the message wasn't sent in a whitelisted channel, don't bother doing anything else.
        const whitelist: string[] = this._dataStore.get(DataStoreKeys.Whitelist);
        if (!whitelist.some(x => x === message.getDiscordMessage().channel.id))
        {
            return;
        }

        const normalizedContent: string = message.getDiscordMessage().content.toLowerCase();
        if (normalizedContent === "hi heraldbot!")
        {
            // If someone is greeting heraldbot.
            const guildMember: Discord.GuildMember = message.getDiscordMessage().guild.members.find(x => x.id === message.getDiscordMessage().author.id);
            let greeting: string = "hi " +  guildMember.displayName.toLowerCase() + "!"
            if (message.isPirateModeEnabled())
            {
                greeting = pirateSpeak.translate(greeting);
            }

            message.getDiscordMessage().channel.send(greeting);

            return;
        }
        else if (normalizedContent.includes(BotName))
        {
            // If someone directly mentions heraldbot.
            this.sayRandomPhrase(message);
            
            return;
        }

        // Otherwise, there's a chance of heraldbot speaking regardless.
        const chanceBound: number = this._dataStore.get(DataStoreKeys.Chance);
        const chance: number = Utility.randomNumber(1, chanceBound);
        const chancePer: number = Math.round(100 * (1 / (chanceBound - 1)));

        console.log("Chance: " + chance + " (about " + chancePer + "%).");

        if (chance === 1)
        {
            // HeraldBot speaks!
            this.sayRandomPhrase(message);
        }
        else
        {
            // Potentially absorb new phrase.
            const absorbChance: number = Utility.randomNumber(1, 5);
            const absorbPer: number = Math.round(100 * (1 / 4));
            console.log("Absorb chance: " + absorbChance + " (about " + absorbPer + "%).");

            if (absorbChance === 1 && message.getDiscordMessage().content.length > 0 && message.getDiscordMessage().content.length <= 150)
            {
                this.absorbPhrase(message.getDiscordMessage().content);
            }
        }        
    }

    /**
     * Say a random phrase in the specified channel.
     * @param {BotMessage} message The message from Discord the bot has received.
     */
    private sayRandomPhrase(message: BotMessage)
    {
        const corpus: string[] = this._dataStore.get(DataStoreKeys.Corpus);
        const rNum: number = Utility.randomNumber(0, corpus.length);

        let randomPhrase: string = corpus[rNum];

        if (message.isPirateModeEnabled())
        {
            randomPhrase = pirateSpeak.translate(randomPhrase);
        }

        if (Utility.randomNumber(1, 11) === 1)
        {
            randomPhrase = randomPhrase.toUpperCase();
        }

        message.getDiscordMessage().channel.send(randomPhrase);
    }

    /**
     * Add specified phrase to corpus.
     * @param {string} phrase Phrase to be added to the corpus.
     */
    private absorbPhrase(phrase: string)
    {
        // Only update corpus contents if the phrase doesn't currently exist in it yet.
        const corpusContents: string[] = this._dataStore.get(DataStoreKeys.Corpus);
        if (!corpusContents.some(x => x.toLowerCase() === phrase.toLowerCase()))
        {
            corpusContents.push(phrase);
            this._dataStore.set(DataStoreKeys.Corpus, corpusContents);
            console.log("Absorbed new phrase: " + phrase);
        }
    }
}