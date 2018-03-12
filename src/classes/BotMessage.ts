import * as Discord from "discord.js";

/** 
 * A message received from Discord that has additional metadata.
 */
export class BotMessage
{
    private _pirateMode: boolean;
    private _discordMsg: Discord.Message;

    /**
     * Constructor for BotMessage instances.
     * @constructor
     * @param message 
     * @param pirateMode 
     */
    constructor(message: Discord.Message, pirateMode?: boolean)
    {
        this._discordMsg = message;
        this._pirateMode = pirateMode;
    }

    /** 
     * Get status of pirate mode.
     */
    public isPirateModeEnabled(): boolean
    {
        return this._pirateMode;
    }

    /** 
     * Get Discord.Message instance.
     */
    public getDiscordMessage(): Discord.Message
    {
        return this._discordMsg;
    }
}
