import * as Discord from "discord.js";
import * as Winston from "winston";

import { Utility } from "../core/Utility";

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
        // todo: remove this junk line. Was used to test random number generation with
        // MT.
        Winston.log("debug", "rn: " + Utility.randomNumber(1, 6));
    }
}