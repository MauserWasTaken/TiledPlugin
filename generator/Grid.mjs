import {WallTile} from "./WallTile.mjs";

export class Grid {

    constructor(width,height)
    {
        this.width = width;
        this.height = height;


        // Actual map geometry.
        this.tiles =
            Array.from(
                {length:height},
                () =>
                    Array(width).fill("WALL")
            );


        /*
         * Records what generated each floor tile.
         *
         * WALL
         * ROOM
         * CORRIDOR
         * CORRIDOR_OPENING
         */
        this.floorSources =
            Array.from(
                {length:height},
                () =>
                    Array(width).fill("WALL")
            );


        // Visual wall variants.
        this.wallTiles =
            Array.from(
                {length:height},
                () =>
                    Array(width).fill(WallTile.INSIDE)
            );
    }


    setFloor(x,y,source = "UNKNOWN")
    {
        if(!this.isInside(x,y))
            return;


        /*
         * Remember if this tile was originally part
         * of a room.
         */
        const wasRoom =
            this.floorSources[y][x] === "ROOM";


        if(this.tiles[y][x] !== "FLOOR")
        {/*
            tiled.log(
                `[setFloor] ${source} -> (${x},${y})`
            );
            */
        }


        this.tiles[y][x] = "FLOOR";


        /*
         * Never allow corridor carving to erase
         * the fact that this tile belongs to a room.
         */
        if(!wasRoom)
        {
            this.floorSources[y][x] = source;
        }
    }


    isInside(x,y)
    {
        return x >= 0 &&
            y >= 0 &&
            x < this.width &&
            y < this.height;
    }


    isWall(x,y)
    {
        if(!this.isInside(x,y))
            return true;

        return this.tiles[y][x] === "WALL";
    }


    isFloor(x,y)
    {
        return this.isInside(x,y) &&
            this.tiles[y][x] === "FLOOR";
    }


    getTile(x,y)
    {
        if(!this.isInside(x,y))
            return "WALL";

        return this.tiles[y][x];
    }


    getFloorSource(x,y)
    {
        if(!this.isInside(x,y))
            return "WALL";

        return this.floorSources[y][x];
    }


    isRoomFloor(x,y)
    {
        return this.isInside(x,y) &&
            this.floorSources[y][x] === "ROOM";
    }


    isCorridorFloor(x,y)
    {
        return this.isInside(x,y) &&
            (
                this.floorSources[y][x] === "CORRIDOR" ||
                this.floorSources[y][x] === "CORRIDOR_OPENING"
            );
    }


    setWallVariant(x,y,variant)
    {
        if(this.isInside(x,y))
        {
            this.wallTiles[y][x] = variant;
        }
    }


    setWall(x,y)
    {
        if(this.isInside(x,y))
        {
            this.tiles[y][x] = "WALL";
            this.floorSources[y][x] = "WALL";
        }
    }


    getWallVariant(x,y)
    {
        return this.wallTiles[y][x];
    }
}