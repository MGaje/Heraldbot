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
    static randomNumber(min: number, max: number): number
    {
        return this._numGen.random() * (max - min) + min;
    }
}