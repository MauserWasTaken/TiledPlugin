import {WallTile} from "./WallTile.mjs";


export class WallVariantGenerator {


    generate(grid)
    {
        for(let y = 0; y < grid.height; y++)
        {
            for(let x = 0; x < grid.width; x++)
            {
                if(!grid.isWall(x,y))
                    continue;


                const variant =
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
        const up =
            grid.isFloor(x,y-1);

        const down =
            grid.isFloor(x,y+1);

        const left =
            grid.isFloor(x-1,y);

        const right =
            grid.isFloor(x+1,y);


        /*
         * ============================================================
         * OUTSIDE CORNERS
         * ============================================================
         */

        const downRight =
            grid.isFloor(x+1,y+1);

        const downLeft =
            grid.isFloor(x-1,y+1);

        const upRight =
            grid.isFloor(x+1,y-1);

        const upLeft =
            grid.isFloor(x-1,y-1);


        if(
            downRight &&
            !down &&
            !right
        )
        {
            return WallTile.TOP_LEFT;
        }


        if(
            downLeft &&
            !down &&
            !left
        )
        {
            return WallTile.TOP_RIGHT;
        }


        if(
            upRight &&
            !up &&
            !right
        )
        {
            return WallTile.BOTTOM_LEFT;
        }


        if(
            upLeft &&
            !up &&
            !left
        )
        {
            return WallTile.BOTTOM_RIGHT;
        }


        /*
         * ============================================================
         * INSIDE / CONCAVE CORNERS
         * ============================================================
         *
         * IMPORTANT:
         *
         * We do NOT check the diagonal anymore.
         *
         * An inside corner is simply a wall tile with floor on
         * two perpendicular sides.
         *
         *       WALL
         *       WALL
         *       FLOOR
         *       FLOOR FLOOR
         *
         * or the equivalent rotation.
         */


        // Floor below + floor right
        //
        //       W
        //       W
        //       F
        //       F F
        //
        if(
            down &&
            right
        )
        {

            return WallTile.INNER_BOTTOM_LEFT;
        }


        // Floor below + floor left
        if(
            down &&
            left
        )
        {

            return WallTile.INNER_BOTTOM_RIGHT;
        }


        // Floor above + floor right
        if(
            up &&
            right
        )
        {

            return WallTile.INNER_TOP_LEFT;
        }


        // Floor above + floor left
        if(
            up &&
            left
        )
        {

            return WallTile.INNER_TOP_RIGHT;
        }


        /*
         * ============================================================
         * STRAIGHT WALLS
         * ============================================================
         */

        if(down)
        {
            return WallTile.TOP;
        }


        if(up)
        {
            return WallTile.BOTTOM;
        }


        if(right)
        {
            return WallTile.LEFT;
        }


        if(left)
        {
            return WallTile.RIGHT;
        }


        return WallTile.INSIDE;
    }
}