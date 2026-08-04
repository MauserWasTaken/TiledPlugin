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
            }
        }
    }



    calculateVariant(grid,x,y)
    {

        let up =
            grid.isWall(x,y-1);

        let down =
            grid.isWall(x,y+1);

        let left =
            grid.isWall(x-1,y);

        let right =
            grid.isWall(x+1,y);



        if(!down && !left)
            return WallTile.BOTTOM_RIGHT;


        if(!down && !right)
            return WallTile.BOTTOM_LEFT;


        if(!down)
            return WallTile.BOTTOM;



        if(!up && !left)
            return WallTile.TOP_RIGHT;


        if(!up && !right)
            return WallTile.TOP_LEFT;


        if(!up)
            return WallTile.TOP;



        if(!left)
            return WallTile.RIGHT;


        if(!right)
            return WallTile.LEFT;



        return WallTile.INSIDE;
    }
}