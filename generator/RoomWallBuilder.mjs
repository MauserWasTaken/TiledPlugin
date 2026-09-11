export class RoomWallBuilder
{
    generate(grid)
    {
        /*
         * ---------------------------------------------------------
         * Build walls around the FINAL floor geometry.
         * ---------------------------------------------------------
         *
         * At this stage rooms and corridors should already have
         * been carved.
         *
         * We first collect all current floor tiles so that
         * changing a tile to WALL cannot affect the rest of the
         * generation pass.
         */

        const floors = [];


        for(let y = 0; y < grid.height; y++)
        {
            for(let x = 0; x < grid.width; x++)
            {
                if(grid.isFloor(x,y))
                {
                    floors.push({
                        x,
                        y
                    });
                }
            }
        }


        /*
         * ---------------------------------------------------------
         * Create walls around every floor tile.
         * ---------------------------------------------------------
         *
         * Only actual WALL tiles are changed.
         *
         * Existing floor tiles are NEVER touched.
         *
         * This is important for corridor openings:
         *
         * ROOM FLOOR -> CORRIDOR FLOOR
         *
         * must remain open.
         */

        for(const floor of floors)
        {
            this.makeWall(
                grid,
                floor.x + 1,
                floor.y
            );

            this.makeWall(
                grid,
                floor.x - 1,
                floor.y
            );

            this.makeWall(
                grid,
                floor.x,
                floor.y + 1
            );

            this.makeWall(
                grid,
                floor.x,
                floor.y - 1
            );
        }
    }


    makeWall(grid,x,y)
    {
        /*
         * Never create walls outside the map.
         */

        if(!grid.isInside(x,y))
        {
            return;
        }


        /*
         * NEVER replace an existing floor.
         *
         * This protects both room floors and corridor floors.
         */

        if(grid.isFloor(x,y))
        {
            return;
        }


        /*
         * Only actual map WALL cells can become visual walls.
         */

        if(!grid.isWall(x,y))
        {
            return;
        }


        grid.setWall(
            x,
            y
        );
    }
}