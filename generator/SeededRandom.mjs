export class SeededRandom
{
    constructor(seed)
    {
        this.seed = seed >>> 0;
    }

    next()
    {
        /*
         * Linear Congruential Generator.
         *
         * Produces a deterministic sequence of
         * values in the range [0, 1).
         */
        this.seed =
            (
                1664525 * this.seed +
                1013904223
            ) >>> 0;

        return this.seed / 4294967296;
    }

    randomInt(min,max)
    {
        return Math.floor(
            this.next() * (max - min + 1)
        ) + min;
    }

    randomFloat(min,max)
    {
        return (
            min +
            this.next() * (max - min)
        );
    }

    chance(percent)
    {
        return this.next() < percent / 100;
    }

    pick(array)
    {
        if(array.length === 0)
            return null;

        return array[
            this.randomInt(0,array.length - 1)
            ];
    }
}