import {WallTile} from "./WallTile.mjs";


export class WallVariantGenerator {


    generate(grid)
    {

        for(let y=0;y<grid.height;y++)
        {
            for(let x=0;x<grid.width;x++)
            {

                if(!grid.isWall(x,y))
                    continue;


                let variant =
                    this.calculateVariant(
                        grid,
                        x,
                        y
                    );


                grid.setWallVariant(
                    x,
                    y,
                    variant
                );

                if(
                    variant === WallTile.TOP_LEFT ||
                    variant === WallTile.TOP_RIGHT ||
                    variant === WallTile.BOTTOM_LEFT ||
                    variant === WallTile.BOTTOM_RIGHT
                )
                {
                    tiled.log(
                        "CORNER FOUND",
                        x,
                        y,
                        variant
                    );
                }
            }
        }
    }



    calculateVariant(grid,x,y)
    {
        const floorUp =
            grid.isFloor(x,y-1);

        const floorDown =
            grid.isFloor(x,y+1);

        const floorLeft =
            grid.isFloor(x-1,y);

        const floorRight =
            grid.isFloor(x+1,y);


        const floorUpLeft =
            grid.isFloor(x-1,y-1);

        const floorUpRight =
            grid.isFloor(x+1,y-1);

        const floorDownLeft =
            grid.isFloor(x-1,y+1);

        const floorDownRight =
            grid.isFloor(x+1,y+1);


        // outside corners

        if(floorDownRight && !floorDown && !floorRight)
            return WallTile.TOP_LEFT;


        if(floorDownLeft && !floorDown && !floorLeft)
            return WallTile.TOP_RIGHT;


        if(floorUpRight && !floorUp && !floorRight)
            return WallTile.BOTTOM_LEFT;


        if(floorUpLeft && !floorUp && !floorLeft)
            return WallTile.BOTTOM_RIGHT;


        // straight walls

        if(floorDown)
            return WallTile.TOP;


        if(floorUp)
            return WallTile.BOTTOM;


        if(floorRight)
            return WallTile.LEFT;


        if(floorLeft)
            return WallTile.RIGHT;


        return WallTile.INSIDE;
    }
}