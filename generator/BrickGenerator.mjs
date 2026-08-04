import {WallTile} from "./WallTile.mjs";


export class BrickGenerator {


    generate(grid)
    {

        for(
            let y=1;
            y<grid.height;
            y++
        )
        {
            for(
                let x=0;
                x<grid.width;
                x++
            )
            {

                let texture =
                    grid.getWallVariant(x,y);


                switch(texture)
                {

                    case WallTile.TOP:

                        grid.setWall(
                            x,
                            y+1
                        );

                        grid.setWallVariant(
                            x,
                            y+1,
                            WallTile.BRICK
                        );

                        break;



                    case WallTile.TOP_LEFT:

                        grid.setWall(
                            x,
                            y+1
                        );

                        grid.setWallVariant(
                            x,
                            y+1,
                            WallTile.BRICK_RIGHT
                        );

                        break;


                    case WallTile.TOP_RIGHT:

                        grid.setWall(
                            x,
                            y+1
                        );

                        grid.setWallVariant(
                            x,
                            y+1,
                            WallTile.BRICK_LEFT
                        );

                        break;
                }
            }
        }
    }
}