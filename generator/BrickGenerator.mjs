import {WallTile} from "./WallTile.mjs";
import {DetailTile} from "./DetailTile.mjs";

export class BrickGenerator
{
    constructor(config)
    {
        this.config = config;
    }

    generate(grid)
    {
        for(
            let y = 1;
            y < grid.height;
            y++
        )
        {
            for(
                let x = 0;
                x < grid.width;
                x++
            )
            {
                const texture =
                    grid.getWallVariant(x,y);

                switch(texture)
                {
                    case WallTile.TOP:

                        grid.setWall(
                            x,
                            y + 1
                        );

                        this.generateTopWall(
                            grid,
                            x,
                            y
                        );

                        break;


                    case WallTile.INNER_BOTTOM_LEFT:

                        grid.setWall(
                            x,
                            y + 1
                        );

                        grid.setWallVariant(
                            x,
                            y + 1,
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
                            y + 1
                        );

                        grid.setWallVariant(
                            x,
                            y + 1,
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


    generateTopWall(grid, x, y)
    {
        const decorationChance =
            this.config.wallDecorationChance / 100;

        const roll =
            Math.random();


        /*
         * Normal brick
         */
        if(roll >= decorationChance)
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

            return;
        }


        /*
         * Decoration.
         *
         * Choose one decoration from the
         * decoration pool.
         */
        const decorationRoll =
            Math.random();


        if(decorationRoll < 0.25)
        {
            /*
             * Pillar
             */
            grid.setDetail(
                x,
                y,
                DetailTile.PILLAR_ABOVE
            );

            grid.setDetail(
                x,
                y + 1,
                WallTile.WALL_DECORATION_PILLAR
            );

            grid.setDetail(
                x,
                y + 2,
                DetailTile.PILLAR_BELLOW
            );
        }
        else if(decorationRoll < 0.50)
        {
            /*
             * Fountain OFF
             */
            grid.setDetail(
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
        else if(decorationRoll < 0.75)
        {
            /*
             * Fountain ON
             */
            grid.setDetail(
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
        else if(decorationRoll < 0.875)
        {
            /*
             * Cell window
             */
            grid.setDetail(
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
        else
        {
            /*
             * Banner
             */
            grid.setDetail(
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
    }
}