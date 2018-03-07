import * as Discord from "discord.js";
import * as Winston from "winston";
import nodespeak = require("nodespeak");

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
    public async handleMsg(message: Discord.Message)
    {
        // Ignore DMs.
        if (!message.guild) return;

        // If the message wasn't sent in a whitelisted channel, don't bother doing anything else.
        const whitelist: string[] = this._dataStore.get(DataStoreKeys.Whitelist);
        if (!whitelist.some(x => x === message.channel.id))
        {
            return;
        }

        const normalizedContent: string = message.content.toLowerCase();

        // Check if voice channel join request.
        if (normalizedContent === "hb join me")
        {
            if (message.member.voiceChannel)
            {
                //const connection: Discord.VoiceConnection = await message.member.voiceChannel.join();
                new nodespeak()
                    .text("hello i am heraldbot")
                    .voice("Dave")
                    .render("heraldbot.wav");
                
                //connection.playStream(url as any);
            }

            return;
        }
        else if (normalizedContent === "hi heraldbot!")
        {
            // If someone is greeting heraldbot.
            message.channel.send("hi " +  message.member.displayName.toLowerCase() + "!");

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
            Winston.log("debug", "Absorbed new phrase: " + phrase);
        }
    }
}