import * as Discord from "discord.js";
import * as Winston from "winston";

/**
 * Main bot construct.
 */
export class Heraldbot
{
    public botClient: Discord.Client;

    /**
     * Run the bot.
     */
    public async run(): Promise<void>
    {
        Winston.log("debug", "Heraldbot is now running");
    }   
}