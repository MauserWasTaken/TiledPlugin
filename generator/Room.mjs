export class Room
{
    constructor(
        id,
        x,
        y,
        width,
        height,
        shape = "RECTANGLE"
    )
    {
        this.id = id;

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.type = "NORMAL";

        this.shape = shape;
    }


    get centerX()
    {
        return this.x +
            Math.floor(this.width / 2);
    }


    get centerY()
    {
        return this.y +
            Math.floor(this.height / 2);
    }


    get left()
    {
        return this.x;
    }


    get right()
    {
        return this.x +
            this.width -
            1;
    }


    get bottom()
    {
        return this.y;
    }


    get top()
    {
        return this.y +
            this.height -
            1;
    }


    /*
     * ---------------------------------------------------------
     * Find a wall opening using the ACTUAL carved room geometry.
     * ---------------------------------------------------------
     *
     * The old implementation assumed that the room occupied
     * the entire rectangular Room bounds.
     *
     * That is not true for CIRCLE and CROSS rooms.
     *
     * We therefore:
     *
     * 1. Find all actual ROOM floor tiles.
     * 2. Keep only tiles on the requested side of the room.
     * 3. Keep only tiles which have a WALL immediately outside.
     * 4. Choose one of the candidates closest to the room centre.
     *
     * The returned point itself is the room floor tile.
     * CorridorGenerator can then move one tile outward.
     */

    /*
     * ---------------------------------------------------------
     * Get actual floor tiles suitable for an opening.
     * ---------------------------------------------------------
     */
    getWallCandidates(grid, direction)
    {
        const candidates = [];


        for(
            let y = this.y;
            y <= this.top;
            y++
        )
        {
            for(
                let x = this.x;
                x <= this.right;
                x++
            )
            {
                /*
                 * The tile must actually belong to the room.
                 *
                 * This is important because corridors may also
                 * have carved floor tiles inside the Room bounds.
                 */
                if(
                    !grid.isRoomFloor(x, y)
                )
                {
                    continue;
                }


                /*
                 * Check whether this tile is on the actual
                 * outside boundary in the requested direction.
                 */
                if(
                    !this.isBoundaryFloor(
                        grid,
                        x,
                        y,
                        direction
                    )
                )
                {
                    continue;
                }


                candidates.push({
                    x,
                    y
                });
            }
        }


        return candidates;
    }


    /*
     * ---------------------------------------------------------
     * Determine whether a ROOM floor tile is actually on the
     * outside boundary in the requested direction.
     * ---------------------------------------------------------
     *
     * Example:
     *
     *     ########
     *     ##....##
     *     #......#
     *     ##....##
     *     ########
     *
     * For RIGHT we only want the rightmost actual floor
     * boundary, not room.right blindly.
     */
    isBoundaryFloor(
        grid,
        x,
        y,
        direction
    )
    {
        let nx = x;
        let ny = y;


        switch(direction)
        {
            case "RIGHT":
                nx++;
                break;

            case "LEFT":
                nx--;
                break;

            case "UP":
                ny++;
                break;

            case "DOWN":
                ny--;
                break;
        }


        /*
         * The neighbouring tile must not be part of the same room.
         *
         * This identifies the actual outer edge of the carved
         * room shape.
         */
        if(
            grid.isRoomFloor(nx, ny)
        )
        {
            return false;
        }


        return true;
    }


    /*
     * ---------------------------------------------------------
     * Fallback for pathological geometry.
     * ---------------------------------------------------------
     *
     * This should rarely be used. It exists so that a malformed
     * room cannot crash corridor generation.
     */

}