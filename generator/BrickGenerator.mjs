import {WallTile} from "./WallTile.mjs";
import {DetailTile} from "./DetailTile.mjs";

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
                            y + 1
                        );


                        const roll =
                            Math.random();


                        if(roll < 0.05)
                        {
                            grid.setWallVariant(
                                x,
                                y + 1,
                                WallTile.WALL_DECORATION_PILLAR
                            );
                            grid.setWallVariant(
                                x,
                                y ,
                                DetailTile.PILLAR_ABOVE
                            );
                            grid.setDetail(
                                x,
                                y +2 ,
                                DetailTile.PILLAR_BELLOW
                            );

                        }
                        else if(roll < 0.10)
                        {
                            grid.setWallVariant(
                                x,
                                y + 1,
                                WallTile.WALL_DECORATION_FOUNTAIN_OFF
                            );
                            grid.setDetail(
                                x,
                                y + 2,
                                DetailTile.FOUNTAIN_BASE_EMPTY
                            );
                        }
                        else if(roll < 0.15)
                        {
                            grid.setWallVariant(
                                x,
                                y + 1,
                                WallTile.WALL_DECORATION_FOUNTAIN_ON
                            );
                            grid.setDetail(
                                x,
                                y + 2,
                                DetailTile.FOUNTAIN_BASE_FULL
                            );
                        }
                        else if(roll < 0.20)
                        {
                            grid.setWallVariant(
                                x,
                                y + 1,
                                WallTile.WALL_DECORATION_CELL_WINDOW
                            );
                            grid.setDetail(
                                x,
                                y + 2,
                                DetailTile.BOTTOM_OF_WALL
                            );
                        }
                        else if(roll < 0.25)
                        {
                            grid.setWallVariant(
                                x,
                                y + 1,
                                WallTile.WALL_DECORATION_BANNER
                            );
                            grid.setDetail(
                                x,
                                y + 2,
                                DetailTile.BOTTOM_OF_WALL
                            );
                        }
                        else
                        {
                            grid.setWallVariant(
                                x,
                                y + 1,
                                WallTile.BRICK
                            );
                            grid.setDetail(
                                x,
                                y + 2,
                                DetailTile.BOTTOM_OF_WALL
                            );
                        }

                        break;

                    case WallTile.INNER_BOTTOM_LEFT:

                        grid.setWall(
                            x,
                            y+1
                        );

                        grid.setWallVariant(
                            x,
                            y+1,
                            WallTile.BRICK_RIGHT
                        );
                        grid.setDetail(
                            x,
                            y + 2,
                            DetailTile.BOTTOM_OF_WALL
                        );

                        break;


                    case WallTile.INNER_BOTTOM_RIGHT:

                        grid.setWall(
                            x,
                            y+1
                        );

                        grid.setWallVariant(
                            x,
                            y+1,
                            WallTile.BRICK_LEFT
                        );
                        grid.setDetail(
                            x,
                            y + 2,
                            DetailTile.BOTTOM_OF_WALL
                        );

                        break;

                }
            }
        }
    }
}