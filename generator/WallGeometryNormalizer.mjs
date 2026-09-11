export class WallGeometryNormalizer
{
    constructor()
    {
        /*
         * A wall cell with exactly one orthogonal wall neighbour
         * is a classic one-cell protrusion.
         */
        this.minimumWallNeighbours = 1;

        /*
         * Maximum number of normalization passes.
         */
        this.maxIterations = 100;
    }


    /*
     * =========================================================
     * GENERATE
     * =========================================================
     */

    generate(grid)
    {
        for(
            let iteration = 0;
            iteration < this.maxIterations;
            iteration++
        )
        {
            const invalid =
                this.findInvalidGeometry(grid);


            if(invalid.length === 0)
            {
                tiled.log(
                    `[WALL NORMALIZER] ` +
                    `Valid after ${iteration} iterations`
                );

                return true;
            }


            tiled.log(
                `[WALL NORMALIZER] ` +
                `Iteration ${iteration}: ` +
                `${invalid.length} invalid wall geometries`
            );


            const problem =
                this.selectRepairProblem(
                    invalid
                );


            if(!problem)
                break;


            this.logProblemContext(
                grid,
                problem
            );


            const repair =
                this.findLocalRepair(
                    grid,
                    problem
                );


            if(!repair)
            {
                tiled.log(
                    `[WALL NORMALIZER] ` +
                    `No safe repair for ` +
                    `${problem.type} ` +
                    `(${problem.x},${problem.y})`
                );

                break;
            }


            /*
             * A run repair can contain multiple cells.
             */
            if(repair.cells)
            {
                tiled.log(
                    `[WALL NORMALIZER] ` +
                    `Removing ${repair.cells.length} cells ` +
                    `from ${problem.type}`
                );


                for(const cell of repair.cells)
                {
                    grid.setFloor(
                        cell.x,
                        cell.y,
                        "WALL_NORMALIZER"
                    );
                }
            }
            else
            {
                tiled.log(
                    `[WALL NORMALIZER] ` +
                    `Removing ${problem.type} ` +
                    `(${repair.x},${repair.y}) -> FLOOR`
                );


                grid.setFloor(
                    repair.x,
                    repair.y,
                    "WALL_NORMALIZER"
                );
            }
        }


        const remaining =
            this.findInvalidGeometry(grid);


        if(remaining.length === 0)
        {
            tiled.log(
                "[WALL NORMALIZER] " +
                "Valid after maximum repair pass"
            );

            return true;
        }


        tiled.log(
            "[WALL NORMALIZER] " +
            "FAILED: could not normalize geometry."
        );


        this.logInvalidGeometry(
            remaining
        );


        return false;
    }


    /*
     * =========================================================
     * INVALID GEOMETRY
     * =========================================================
     */

    findInvalidGeometry(grid)
    {
        const invalid = [];


        for(
            let y = 1;
            y < grid.height - 1;
            y++
        )
        {
            for(
                let x = 1;
                x < grid.width - 1;
                x++
            )
            {
                if(grid.isFloor(x,y))
                    continue;


                /*
                 * Room floors can never be normalized.
                 */
                if(
                    grid.isRoomFloor &&
                    grid.isRoomFloor(x,y)
                )
                {
                    continue;
                }


                /*
                 * -------------------------------------------------
                 * 1. INTERNAL CORRIDOR WALL
                 * -------------------------------------------------
                 *
                 * This is the important new rule.
                 *
                 * Example:
                 *
                 *     C C C
                 *     C # C
                 *     C C C
                 *
                 * The # is an internal wall in a corridor.
                 *
                 * The old algorithm sees this as a protrusion and
                 * removes it one tile at a time.
                 *
                 * We now detect the complete separator run.
                 */
                if(
                    this.isInternalCorridorWall(
                        grid,
                        x,
                        y
                    )
                )
                {
                    invalid.push({
                        type: "INTERNAL_CORRIDOR_WALL",
                        x,
                        y
                    });

                    continue;
                }


                /*
                 * -------------------------------------------------
                 * 2. SINGLE-TILE INTERNAL WALL
                 * -------------------------------------------------
                 *
                 * Wall between floor on opposite sides.
                 *
                 * We only classify it when corridor geometry is
                 * involved, preventing normal room boundaries from
                 * being destroyed.
                 */
                if(
                    this.isSingleTileInternalWall(
                        grid,
                        x,
                        y
                    )
                )
                {
                    invalid.push({
                        type: "SINGLE_TILE_INTERNAL_WALL",
                        x,
                        y
                    });

                    continue;
                }


                /*
                 * -------------------------------------------------
                 * 3. ISOLATED WALL
                 * -------------------------------------------------
                 */
                if(
                    this.isIsolatedWall(
                        grid,
                        x,
                        y
                    )
                )
                {
                    invalid.push({
                        type: "ISOLATED_WALL",
                        x,
                        y
                    });

                    continue;
                }


                /*
                 * -------------------------------------------------
                 * 4. NORMAL PROTRUSION
                 * -------------------------------------------------
                 */
                if(
                    this.isSingleWallProtrusion(
                        grid,
                        x,
                        y
                    )
                )
                {
                    invalid.push({
                        type: "PROTRUSION",
                        x,
                        y
                    });
                }
            }
        }


        return invalid;
    }


    /*
     * =========================================================
     * INTERNAL CORRIDOR WALL
     * =========================================================
     */

    isInternalCorridorWall(
        grid,
        x,
        y
    )
    {
        if(grid.isFloor(x,y))
            return false;


        /*
         * Horizontal separator:
         *
         *     FLOOR
         *     WALL
         *     FLOOR
         *
         * with corridor involved.
         */
        const horizontal =
            grid.isFloor(x - 1,y) &&
            grid.isFloor(x + 1,y) &&
            (
                this.isCorridor(
                    grid,
                    x - 1,
                    y
                ) ||
                this.isCorridor(
                    grid,
                    x + 1,
                    y
                )
            );


        /*
         * Vertical separator:
         *
         *     FLOOR
         *     WALL
         *     FLOOR
         *
         * vertically.
         */
        const vertical =
            grid.isFloor(x,y - 1) &&
            grid.isFloor(x,y + 1) &&
            (
                this.isCorridor(
                    grid,
                    x,
                    y - 1
                ) ||
                this.isCorridor(
                    grid,
                    x,
                    y + 1
                )
            );


        return horizontal || vertical;
    }


    /*
     * =========================================================
     * SINGLE TILE INTERNAL WALL
     * =========================================================
     */

    isSingleTileInternalWall(
        grid,
        x,
        y
    )
    {
        if(grid.isFloor(x,y))
            return false;


        /*
         * Horizontal separator.
         */
        if(
            grid.isFloor(x - 1,y) &&
            grid.isFloor(x + 1,y)
        )
        {
            /*
             * If both neighbouring cells are also part of a
             * horizontal separator, this is a longer run.
             *
             * It is handled as a run, not as a single tile.
             */
            const leftContinues =
                this.isHorizontalSeparator(
                    grid,
                    x - 1,
                    y
                );


            const rightContinues =
                this.isHorizontalSeparator(
                    grid,
                    x + 1,
                    y
                );


            if(
                !leftContinues &&
                !rightContinues &&
                (
                    this.isCorridor(
                        grid,
                        x - 1,
                        y
                    ) ||
                    this.isCorridor(
                        grid,
                        x + 1,
                        y
                    )
                )
            )
            {
                return true;
            }
        }


        /*
         * Vertical separator.
         */
        if(
            grid.isFloor(x,y - 1) &&
            grid.isFloor(x,y + 1)
        )
        {
            const upContinues =
                this.isVerticalSeparator(
                    grid,
                    x,
                    y - 1
                );


            const downContinues =
                this.isVerticalSeparator(
                    grid,
                    x,
                    y + 1
                );


            if(
                !upContinues &&
                !downContinues &&
                (
                    this.isCorridor(
                        grid,
                        x,
                        y - 1
                    ) ||
                    this.isCorridor(
                        grid,
                        x,
                        y + 1
                    )
                )
            )
            {
                return true;
            }
        }


        return false;
    }


    /*
     * =========================================================
     * SEPARATOR HELPERS
     * =========================================================
     */

    isHorizontalSeparator(
        grid,
        x,
        y
    )
    {
        if(!this.isInside(grid,x,y))
            return false;


        if(grid.isFloor(x,y))
            return false;


        return (
            grid.isFloor(x - 1,y) &&
            grid.isFloor(x + 1,y)
        );
    }


    isVerticalSeparator(
        grid,
        x,
        y
    )
    {
        if(!this.isInside(grid,x,y))
            return false;


        if(grid.isFloor(x,y))
            return false;


        return (
            grid.isFloor(x,y - 1) &&
            grid.isFloor(x,y + 1)
        );
    }


    /*
     * =========================================================
     * ISOLATED WALL
     * =========================================================
     */

    isIsolatedWall(
        grid,
        x,
        y
    )
    {
        const up =
            grid.isWall(x,y - 1);

        const down =
            grid.isWall(x,y + 1);

        const left =
            grid.isWall(x - 1,y);

        const right =
            grid.isWall(x + 1,y);


        const neighbours =
            Number(up) +
            Number(down) +
            Number(left) +
            Number(right);


        return neighbours === 0;
    }


    /*
     * =========================================================
     * PROTRUSION
     * =========================================================
     */

    isSingleWallProtrusion(
        grid,
        x,
        y
    )
    {
        const up =
            grid.isWall(x,y - 1);

        const down =
            grid.isWall(x,y + 1);

        const left =
            grid.isWall(x - 1,y);

        const right =
            grid.isWall(x + 1,y);


        const neighbours =
            Number(up) +
            Number(down) +
            Number(left) +
            Number(right);


        return (
            neighbours ===
            this.minimumWallNeighbours
        );
    }


    /*
     * =========================================================
     * CORRIDOR CHECK
     * =========================================================
     */

    isCorridor(
        grid,
        x,
        y
    )
    {
        if(!grid.isInside(x,y))
            return false;


        if(!grid.isFloor(x,y))
            return false;


        if(
            grid.isCorridorFloor
        )
        {
            return grid.isCorridorFloor(
                x,
                y
            );
        }


        const source =
            grid.getFloorSource(
                x,
                y
            );


        return (
            source === "CORRIDOR" ||
            source === "CORRIDOR_OPENING"
        );
    }


    /*
     * =========================================================
     * SELECT PROBLEM
     * =========================================================
     */

    selectRepairProblem(invalid)
    {
        if(invalid.length === 0)
            return null;


        const priority =
            {
                "INTERNAL_CORRIDOR_WALL": 0,
                "SINGLE_TILE_INTERNAL_WALL": 1,
                "ISOLATED_WALL": 2,
                "PROTRUSION": 3
            };


        invalid.sort(
            (a,b) =>
            {
                const pa =
                    priority[a.type] ?? 99;

                const pb =
                    priority[b.type] ?? 99;


                if(pa !== pb)
                    return pa - pb;


                if(a.y !== b.y)
                    return a.y - b.y;


                return a.x - b.x;
            }
        );


        return invalid[0];
    }


    /*
     * =========================================================
     * REPAIR
     * =========================================================
     */

    findLocalRepair(
        grid,
        problem
    )
    {
        /*
         * Internal corridor wall:
         *
         * remove the COMPLETE contiguous separator.
         */
        if(
            problem.type ===
            "INTERNAL_CORRIDOR_WALL"
        )
        {
            const cells =
                this.findSeparatorRun(
                    grid,
                    problem.x,
                    problem.y
                );


            if(cells.length === 0)
                return null;


            if(
                !this.isSafeRunRepair(
                    grid,
                    cells
                )
            )
            {
                return null;
            }


            return {
                cells
            };
        }


        /*
         * Single-tile internal wall.
         */
        if(
            problem.type ===
            "SINGLE_TILE_INTERNAL_WALL"
        )
        {
            return {
                x: problem.x,
                y: problem.y
            };
        }


        /*
         * Isolated wall/protrusion.
         */
        return {
            x: problem.x,
            y: problem.y
        };
    }


    /*
     * =========================================================
     * FIND COMPLETE SEPARATOR RUN
     * =========================================================
     */

    findSeparatorRun(
        grid,
        startX,
        startY
    )
    {
        const horizontal =
            this.isHorizontalSeparator(
                grid,
                startX,
                startY
            );


        const vertical =
            this.isVerticalSeparator(
                grid,
                startX,
                startY
            );


        /*
         * If both are possible, choose the direction containing
         * corridor geometry.
         */
        if(
            horizontal &&
            !vertical
        )
        {
            return this.collectHorizontalRun(
                grid,
                startX,
                startY
            );
        }


        if(
            vertical &&
            !horizontal
        )
        {
            return this.collectVerticalRun(
                grid,
                startX,
                startY
            );
        }


        if(horizontal)
        {
            const horizontalRun =
                this.collectHorizontalRun(
                    grid,
                    startX,
                    startY
                );


            const verticalRun =
                this.collectVerticalRun(
                    grid,
                    startX,
                    startY
                );


            const horizontalCorridor =
                horizontalRun.filter(
                    cell =>
                        this.hasCorridorNeighbour(
                            grid,
                            cell.x,
                            cell.y
                        )
                ).length;


            const verticalCorridor =
                verticalRun.filter(
                    cell =>
                        this.hasCorridorNeighbour(
                            grid,
                            cell.x,
                            cell.y
                        )
                ).length;


            if(
                horizontalCorridor >=
                verticalCorridor
            )
            {
                return horizontalRun;
            }


            return verticalRun;
        }


        return [];
    }


    /*
     * =========================================================
     * HORIZONTAL RUN
     * =========================================================
     */

    collectHorizontalRun(
        grid,
        x,
        y
    )
    {
        const cells = [];


        let left = x;


        while(
            this.isHorizontalSeparator(
                grid,
                left - 1,
                y
            )
            )
        {
            left--;
        }


        let right = x;


        while(
            this.isHorizontalSeparator(
                grid,
                right + 1,
                y
            )
            )
        {
            right++;
        }


        for(
            let current = left;
            current <= right;
            current++
        )
        {
            if(
                this.isHorizontalSeparator(
                    grid,
                    current,
                    y
                )
            )
            {
                cells.push({
                    x: current,
                    y
                });
            }
        }


        return cells;
    }


    /*
     * =========================================================
     * VERTICAL RUN
     * =========================================================
     */

    collectVerticalRun(
        grid,
        x,
        y
    )
    {
        const cells = [];


        let top = y;


        while(
            this.isVerticalSeparator(
                grid,
                x,
                top - 1
            )
            )
        {
            top--;
        }


        let bottom = y;


        while(
            this.isVerticalSeparator(
                grid,
                x,
                bottom + 1
            )
            )
        {
            bottom++;
        }


        for(
            let current = top;
            current <= bottom;
            current++
        )
        {
            if(
                this.isVerticalSeparator(
                    grid,
                    x,
                    current
                )
            )
            {
                cells.push({
                    x,
                    y: current
                });
            }
        }


        return cells;
    }


    /*
     * =========================================================
     * SAFETY CHECK FOR RUN
     * =========================================================
     */

    isSafeRunRepair(
        grid,
        cells
    )
    {
        if(cells.length === 0)
            return false;


        for(const cell of cells)
        {
            /*
             * Never modify border.
             */
            if(
                cell.x <= 0 ||
                cell.y <= 0 ||
                cell.x >= grid.width - 1 ||
                cell.y >= grid.height - 1
            )
            {
                return false;
            }


            /*
             * Never modify a room floor.
             *
             * This is mostly defensive because cells should
             * already be WALL.
             */
            if(
                grid.isRoomFloor &&
                grid.isRoomFloor(
                    cell.x,
                    cell.y
                )
            )
            {
                return false;
            }


            /*
             * Every cell in an internal corridor wall must
             * actually have corridor involvement.
             */
            if(
                !this.hasCorridorNeighbour(
                    grid,
                    cell.x,
                    cell.y
                )
            )
            {
                return false;
            }
        }


        return true;
    }


    /*
     * =========================================================
     * CORRIDOR NEIGHBOUR
     * =========================================================
     */

    hasCorridorNeighbour(
        grid,
        x,
        y
    )
    {
        return (
            this.isCorridor(
                grid,
                x - 1,
                y
            ) ||
            this.isCorridor(
                grid,
                x + 1,
                y
            ) ||
            this.isCorridor(
                grid,
                x,
                y - 1
            ) ||
            this.isCorridor(
                grid,
                x,
                y + 1
            )
        );
    }


    /*
     * =========================================================
     * CORRIDOR EXPANSION
     * =========================================================
     *
     * Kept for compatibility with the previous implementation.
     */

    getCorridorExpansion(
        grid,
        x,
        y
    )
    {
        let neighbours = 0;


        if(
            this.isCorridor(
                grid,
                x - 1,
                y
            )
        )
        {
            neighbours++;
        }


        if(
            this.isCorridor(
                grid,
                x + 1,
                y
            )
        )
        {
            neighbours++;
        }


        if(
            this.isCorridor(
                grid,
                x,
                y - 1
            )
        )
        {
            neighbours++;
        }


        if(
            this.isCorridor(
                grid,
                x,
                y + 1
            )
        )
        {
            neighbours++;
        }


        if(neighbours <= 2)
            return 0;


        return neighbours - 2;
    }


    /*
     * =========================================================
     * DEBUG
     * =========================================================
     */

    logProblemContext(
        grid,
        problem
    )
    {
        const x = problem.x;
        const y = problem.y;


        const describe =
            (nx,ny) =>
            {
                if(
                    !grid.isInside(
                        nx,
                        ny
                    )
                )
                {
                    return "OUTSIDE";
                }


                if(grid.isFloor(nx,ny))
                {
                    if(
                        this.isCorridor(
                            grid,
                            nx,
                            ny
                        )
                    )
                    {
                        return "FLOOR / CORRIDOR";
                    }


                    if(
                        grid.isRoomFloor &&
                        grid.isRoomFloor(
                            nx,
                            ny
                        )
                    )
                    {
                        return "FLOOR / ROOM";
                    }


                    return (
                        "FLOOR / " +
                        grid.getFloorSource(
                            nx,
                            ny
                        )
                    );
                }


                return "WALL";
            };


        tiled.log(
            `[WALL NORMALIZER] ` +
            `Context for ${problem.type} ` +
            `(${x},${y}):`
        );


        tiled.log(
            `  up    = ${describe(x,y - 1)}`
        );


        tiled.log(
            `  down  = ${describe(x,y + 1)}`
        );


        tiled.log(
            `  left  = ${describe(x - 1,y)}`
        );


        tiled.log(
            `  right = ${describe(x + 1,y)}`
        );


        tiled.log(
            `  source = ${grid.getFloorSource(x,y)}`
        );
    }


    logInvalidGeometry(invalid)
    {
        for(
            const problem of invalid
            )
        {
            tiled.log(
                `[WALL NORMALIZER] ` +
                `INVALID ${problem.type} ` +
                `at (${problem.x},${problem.y})`
            );
        }
    }


    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    isInside(
        grid,
        x,
        y
    )
    {
        return (
            x >= 0 &&
            y >= 0 &&
            x < grid.width &&
            y < grid.height
        );
    }
}