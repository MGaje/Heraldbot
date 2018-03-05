import * as Discord from "discord.js";
import * as Winston from "winston";

import { DataStoreKeys, BotName } from "../core/constants";
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
        const normalizedContent: string = message.content.toLowerCase();
        if (normalizedContent === "hi heraldbot!")
        {
            // If someone is greeting heraldbot.
            const guildMember: Discord.GuildMember = message.guild.members.find(x => x.id === message.author.id);
            message.channel.send("hi " +  guildMember.displayName.toLowerCase() + "!");

            return;
        }
        else if (message.content.toLowerCase().includes(BotName))
        {
            // If someone directly mentions heraldbot.
            this.sayRandomPhrase(message.channel as Discord.TextChannel);
            
            return;
        }

        // Otherwise, there's a chance of heraldbot speaking regardless.
        const chanceBound: number = this._dataStore.get(DataStoreKeys.Chance);
        const chance: number = Utility.randomNumber(1, chanceBound);
        const chancePer: number = Math.round(100 * (1 / (chanceBound - 1)));

        Winston.log("debug", "Chance: " + chance + " (about " + chancePer + "%).");

        if (chance === 1)
        {
            // HeraldBot speaks!
            this.sayRandomPhrase(message.channel as Discord.TextChannel);
        }
        else
        {
            // Potentially absorb new phrase.
            const absorbChance: number = Utility.randomNumber(1, 5);
            const absorbPer: number = Math.round(100 * (1 / 4));
            Winston.log("debug", "Absorb chance: " + absorbChance + " (about " + absorbPer + "%).");

            if (message.content.length > 0 && absorbChance === 1)
            {
                this.absorbPhrase(message.content);
                Winston.log("debug", "Absorbed new phrase: " + message.content);
            }
        }        
    }

    /**
     * Say a random phrase in the specified channel.
     * @param {Discord.TextChannel} channel The Discord channel to say a random phrase in.
     */
    private sayRandomPhrase(channel: Discord.TextChannel)
    {
        const corpus: string[] = this._dataStore.get(DataStoreKeys.Corpus);
        let randomPhrase: string = corpus[Utility.randomNumber(0, corpus.length)];

        if (Utility.randomNumber(1, 11) === 1)
        {
            randomPhrase = randomPhrase.toUpperCase();
        }

        channel.send(randomPhrase);
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
        }
    }
}