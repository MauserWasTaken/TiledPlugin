export class GenerationStats
{
    constructor()
    {
        this.roomCount = 0;

        this.rectangleRooms = 0;
        this.circleRooms = 0;
        this.crossRooms = 0;

        this.normalRooms = 0;
        this.treasureRooms = 0;
        this.blacksmithRooms = 0;
        this.startRooms = 0;
        this.exitRooms = 0;

        this.corridorCount = 0;
        this.totalCorridorLength = 0;

        this.floorTileCount = 0;

        this.seed = 0;
        this.generationTime = 0;
    }

    get averageCorridorLength()
    {
        if(this.corridorCount === 0)
            return 0;

        return (
            this.totalCorridorLength /
            this.corridorCount
        );
    }
}