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
        let up =
            grid.isFloor(x,y-1);

        let down =
            grid.isFloor(x,y+1);

        let left =
            grid.isFloor(x-1,y);

        let right =
            grid.isFloor(x+1,y);


        let upLeft =
            grid.isFloor(x-1,y-1);

        let upRight =
            grid.isFloor(x+1,y-1);

        let downLeft =
            grid.isFloor(x-1,y+1);

        let downRight =
            grid.isFloor(x+1,y+1);



        // corners
        if(downRight && !down && !right)
            return WallTile.TOP_LEFT;


        if(downLeft && !down && !left)
            return WallTile.TOP_RIGHT;


        if(upRight && !up && !right)
            return WallTile.BOTTOM_RIGHT;


        if(upLeft && !up && !left)
            return WallTile.BOTTOM_LEFT;



        // straight walls
        if(down)
            return WallTile.TOP;


        if(up)
            return WallTile.BOTTOM;


        if(right)
            return WallTile.LEFT;


        if(left)
            return WallTile.RIGHT;


        return WallTile.INSIDE;
    }
}