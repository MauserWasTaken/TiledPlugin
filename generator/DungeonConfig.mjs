export class DungeonConfig
{
    constructor()
    {
        /*
         * BSP partitions
         */
        this.minimumPartitionSize = 16;


        /*
         * Rooms
         */
        this.minimumRoomSize = 8;
        this.roomPadding = 2;

        this.minimumRoomFill = 0.70;
        this.maximumRoomFill = 0.95;

        this.maximumRoomAspectRatio = 1.5;


        /*
         * Room shapes
         *
         * Must add up to 100.
         */
        this.rectangleChance = 60;
        this.circleChance = 20;
        this.crossChance = 20;


        /*
         * Corridors
         */
        this.corridorWidth = 2;


        /*
         * Room types
         *
         * Percentages.
         */
        this.treasureChance = 20;
        this.blacksmithChance = 20;


        /*
         * Wall decorations
         *
         * Percentage of eligible wall positions
         * that receive a decoration instead
         * of a normal brick.
         */
        this.wallDecorationChance = 25;


        /*
         * Random seed
         *
         * Will be implemented with a seeded
         * random generator later.
         */
        this.seed = 123456;
    }
}