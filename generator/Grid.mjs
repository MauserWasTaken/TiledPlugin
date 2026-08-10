import {WallTile} from "./WallTile.mjs";

export class Grid {

    constructor(width,height)
    {
        this.width = width;
        this.height = height;


        // actual map
        this.tiles =
            Array.from(
                {length:height},
                () =>
                    Array(width).fill("WALL")
            );


        // visual wall variants
        this.wallTiles =
            Array.from(
                {length:height},
                () =>
                    Array(width).fill(WallTile.INSIDE)
            );
    }


    setFloor(x,y)
    {
        if(this.isInside(x,y))
        {
            this.tiles[y][x] = "FLOOR";
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
        }
    }

    getWallVariant(x,y)
    {
        return this.wallTiles[y][x];
    }
}