import * as Discord from "discord.js";
import * as Winston from "winston";

import { Utility } from "./Utility";

/**
 * Handles Discord messages from users.
 */
export class MessageHandler
{
    /**
     * Default constructor.
     * @constructor
     */
    constructor()
    {
        // Empty.
    }

    /**
     * Handle incoming Discord message.
     * @param {Discord.Message} message discord.js message instance.
     */
    public handleMsg(message: Discord.Message)
    {
        Winston.log("debug", "rn: " + Utility.randomNumber(1, 6));
    }
}