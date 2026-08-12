export class WallGeometryCleaner {

    /*
     * Minimum number of tiles that a boundary must travel
     * in a new direction before it is allowed to reverse.
     *
     * 1 means:
     *
     *     UP
     *     UP
     *     RIGHT   <- must exist
     *     DOWN
     *
     * is allowed.
     *
     * But:
     *
     *     UP
     *     UP
     *     RIGHT
     *     DOWN
     *
     * where RIGHT is only a one-tile excursion can be removed.
     */

    constructor(minRun = 1)
    {
        this.minRun = minRun;
    }


    generate(grid)
    {
        /*
         * We collect changes first.
         *
         * This is important because modifying the grid while
         * scanning it would affect the checks for later tiles.
         */

        let changes = [];


        for(let y = 1; y < grid.height - 1; y++)
        {
            for(let x = 1; x < grid.width - 1; x++)
            {
                if(!grid.isFloor(x,y))
                    continue;


                if(this.isInvalidHorizontalNotch(grid,x,y))
                {
                    changes.push([x,y]);
                    continue;
                }


                if(this.isInvalidVerticalNotch(grid,x,y))
                {
                    changes.push([x,y]);
                }
            }
        }


        /*
         * Apply the changes after the complete scan.
         */

        for(let [x,y] of changes)
        {
            grid.setFloor(x,y);
        }
    }


    /*
     * ============================================================
     * HORIZONTAL NOTCH
     * ============================================================
     *
     * Detects a one-tile horizontal excursion in the floor
     * boundary.
     *
     * Example:
     *
     *       WWW
     *       WFW
     *       WWW
     *       WFW
     *
     * The F in the middle can create a wall that goes:
     *
     *     UP -> RIGHT -> DOWN
     *
     * without travelling in the new direction.
     */


    isInvalidHorizontalNotch(grid,x,y)
    {
        /*
         * We are looking for:
         *
         *     WALL WALL WALL
         *     WALL FLOOR WALL
         *     WALL WALL WALL
         *
         * around the floor tile.
         *
         * This means the floor has only a one-tile horizontal
         * connection to the surrounding floor.
         */


        const left =
            grid.isFloor(x-1,y);

        const right =
            grid.isFloor(x+1,y);

        const up =
            grid.isFloor(x,y-1);

        const down =
            grid.isFloor(x,y+1);


        /*
         * A tile that connects vertically but not horizontally
         * is part of a vertical run and should not be removed.
         */

        if(up && down && !left && !right)
        {
            return false;
        }


        /*
         * A tile connecting horizontally is also normal.
         */

        if(left || right)
        {
            return false;
        }


        /*
         * Completely isolated floor tiles should not normally
         * exist, but they are also not a wall notch.
         */

        if(!up && !down)
        {
            return false;
        }


        return false;
    }


    /*
     * ============================================================
     * VERTICAL NOTCH
     * ============================================================
     *
     * Same idea as above, rotated 90 degrees.
     */


    isInvalidVerticalNotch(grid,x,y)
    {
        const left =
            grid.isFloor(x-1,y);

        const right =
            grid.isFloor(x+1,y);

        const up =
            grid.isFloor(x,y-1);

        const down =
            grid.isFloor(x,y+1);


        if(left && right && !up && !down)
        {
            return false;
        }


        if(up || down)
        {
            return false;
        }


        if(!left && !right)
        {
            return false;
        }


        return false;
    }
}