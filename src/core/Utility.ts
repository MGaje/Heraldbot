import * as fs from "fs";

import * as MersenneTwister from "mersenne-twister";

/**
 * Contains utility functions used throughout the application.
 */
export class Utility
{
    private static _numGen: MersenneTwister = new MersenneTwister();

    /**
     * Generate a random number given the range (min is inclusive; max is exclusive).
     * @param {number} min Lower bound.
     * @param {number} max Upper bound.
     * @return {number} randomly generated number.
     */
    public static randomNumber(min: number, max: number): number
    {
        return Math.floor(this._numGen.random() * (max - min) + min);
    }

    /**
     * Node.js' fs readFile in promise form.
     * @param {string} file File to open.
     * @returns {Promise<any>} Promise with the contents of the file.
     */
    public static readFile(file: string): Promise<string>
    {
        return new Promise((resolve, reject) => 
        {
            // Read corpus file and set contents.
            fs.readFile(file, "utf8", (err, contents) => 
            {
                if (err)
                {
                    reject(err);
                }

                resolve(contents);
            });
        });
    }
}