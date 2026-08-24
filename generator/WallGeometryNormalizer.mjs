export class WallGeometryNormalizer
{
    constructor()
    {
        /*
         * A wall cell is considered a problematic protrusion
         * when it has only one orthogonal wall neighbour.
         *
         * This is intentionally NOT the same as requiring
         * every directional boundary run to have length >= 2.
         *
         * Normal corners and room openings can legitimately
         * contain single directional boundary edges.
         */
        this.minimumWallNeighbours = 1;

        /*
         * Safety limit.
         */
        this.maxIterations = 100;
    }


    generate(grid)
    {
        for(
            let iteration = 0;
            iteration < this.maxIterations;
            iteration++
        )
        {
            const invalid =
                this.findInvalidGeometry(
                    grid
                );


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
                `${invalid.length} invalid protrusions`
            );


            /*
             * Repair the most constrained protrusion first.
             */
            const problem =
                this.selectRepairProblem(
                    invalid
                );


            if(!problem)
                break;


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
                    `protrusion ` +
                    `(${problem.x},${problem.y})`
                );

                break;
            }


            tiled.log(
                `[WALL NORMALIZER] ` +
                `Repairing protrusion ` +
                `(${problem.x},${problem.y}) ` +
                `-> FLOOR at same cell`
            );


            grid.setFloor(
                repair.x,
                repair.y,
                "WALL_NORMALIZER"
            );
        }


        const remaining =
            this.findInvalidGeometry(
                grid
            );


        if(remaining.length === 0)
        {
            tiled.log(
                `[WALL NORMALIZER] ` +
                `Valid after maximum repair pass`
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
     * ---------------------------------------------------------
     * Geometry detection
     * ---------------------------------------------------------
     *
     * We no longer collect directional boundary runs.
     *
     * A single UP/DOWN/LEFT/RIGHT boundary edge is NOT
     * automatically considered invalid.
     *
     * Instead we look for an actual wall cell which sticks
     * out by itself.
     *
     *
     * Example of geometry we want to avoid:
     *
     *      #####
     *      #####
     *      .#...
     *
     *                 ^
     *                 isolated wall cell
     *
     *
     * The problematic wall cell has exactly one orthogonal
     * wall neighbour.
     *
     * This is much closer to the actual visual problem that
     * the tileset cannot represent.
     * ---------------------------------------------------------
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
                /*
                 * Only inspect wall cells.
                 */
                if(grid.isFloor(x,y))
                    continue;


                /*
                 * Do not touch room geometry.
                 *
                 * Room geometry must be corrected by the
                 * room generator rather than by this pass.
                 */
                if(
                    grid.isRoomFloor &&
                    grid.isRoomFloor(x,y)
                )
                {
                    continue;
                }


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
     * ---------------------------------------------------------
     * Protrusion detection
     * ---------------------------------------------------------
     */

    isSingleWallProtrusion(
        grid,
        x,
        y
    )
    {
        /*
         * Determine which neighbouring cells are walls.
         */
        const up =
            !grid.isFloor(
                x,
                y - 1
            );


        const down =
            !grid.isFloor(
                x,
                y + 1
            );


        const left =
            !grid.isFloor(
                x - 1,
                y
            );


        const right =
            !grid.isFloor(
                x + 1,
                y
            );


        const wallNeighbours =
            Number(up) +
            Number(down) +
            Number(left) +
            Number(right);


        /*
         * A wall cell with exactly one wall neighbour is
         * an isolated one-tile protrusion.
         *
         * Example:
         *
         *      #####
         *      #####
         *      .#...
         *
         *          #
         *          ^
         *          only wall neighbour is above
         */
        return (
            wallNeighbours ===
            this.minimumWallNeighbours
        );
    }


    /*
     * ---------------------------------------------------------
     * Select repair
     * ---------------------------------------------------------
     */

    selectRepairProblem(invalid)
    {
        if(invalid.length === 0)
            return null;


        /*
         * Deterministic ordering.
         *
         * Prefer problems closer to the top-left so that
         * repeated generation/debugging is easier to follow.
         */
        invalid.sort(
            (a,b) =>
            {
                if(a.y !== b.y)
                    return a.y - b.y;


                return a.x - b.x;
            }
        );


        return invalid[0];
    }


    /*
     * ---------------------------------------------------------
     * Local repair
     * ---------------------------------------------------------
     */

    findLocalRepair(
        grid,
        problem
    )
    {
        const candidates =
            this.generateLocalCandidates(
                grid,
                problem
            );


        let best = null;


        const before =
            this.findInvalidGeometry(
                grid
            );


        for(
            const candidate of candidates
            )
        {
            /*
             * Must be inside the grid.
             */
            if(
                !this.isInside(
                    grid,
                    candidate.x,
                    candidate.y
                )
            )
            {
                continue;
            }


            /*
             * NEVER modify the outside border.
             */
            if(
                candidate.x === 0 ||
                candidate.y === 0 ||
                candidate.x === grid.width - 1 ||
                candidate.y === grid.height - 1
            )
            {
                continue;
            }


            /*
             * Candidate must currently be wall.
             */
            if(
                grid.isFloor(
                    candidate.x,
                    candidate.y
                )
            )
            {
                continue;
            }


            /*
             * NEVER modify an existing room floor.
             *
             * Room geometry should be fixed at the source.
             */
            if(
                grid.isRoomFloor &&
                grid.isRoomFloor(
                    candidate.x,
                    candidate.y
                )
            )
            {
                continue;
            }


            /*
             * Simulate the repair.
             */
            grid.setFloor(
                candidate.x,
                candidate.y,
                "WALL_NORMALIZER"
            );


            const after =
                this.findInvalidGeometry(
                    grid
                );


            /*
             * Restore the candidate.
             */
            grid.setWall(
                candidate.x,
                candidate.y
            );


            const score =
                this.scoreRepair(
                    problem,
                    candidate,
                    before,
                    after
                );


            if(score === Infinity)
                continue;


            if(
                !best ||
                score < best.score
            )
            {
                best = {
                    x: candidate.x,
                    y: candidate.y,
                    score
                };
            }
        }


        return best;
    }


    /*
     * ---------------------------------------------------------
     * Candidate generation
     * ---------------------------------------------------------
     */

    generateLocalCandidates(
        grid,
        problem
    )
    {
        const candidates = [];

        const x = problem.x;
        const y = problem.y;


        /*
         * Determine the wall neighbours of the protrusion.
         *
         * The protrusion itself has exactly one wall neighbour.
         * We MUST remove the protrusion by extending the floor
         * into the side where that wall neighbour lies.
         *
         * Example:
         *
         *      #####
         *      #####
         *      .#...
         *
         *          ^
         *          protrusion
         *
         * The wall neighbour is above.
         *
         * Therefore the repair cell is the protrusion itself,
         * not an arbitrary neighbouring wall.
         *
         * However, because the current problem coordinates refer
         * to the isolated WALL CELL, the actual repair is simply
         * to turn THAT CELL into floor.
         */


        /*
         * The safest repair is the protrusion itself.
         *
         * We do not carve an adjacent cell.
         */
        candidates.push({
            x,
            y
        });


        return candidates;
    }


    /*
     * ---------------------------------------------------------
     * Repair scoring
     * ---------------------------------------------------------
     */

    scoreRepair(
        problem,
        candidate,
        before,
        after
    )
    {
        /*
         * A repair must NEVER increase the number of
         * problematic protrusions.
         */
        if(
            after.length >
            before.length
        )
        {
            return Infinity;
        }


        let score = 0;


        /*
         * Strongly reward removing the original problem.
         *
         * If the original protrusion still exists after
         * the simulated repair, this candidate is poor.
         */
        let originalStillExists = false;


        for(
            const remaining of after
            )
        {
            if(
                remaining.type ===
                "PROTRUSION" &&
                remaining.x === problem.x &&
                remaining.y === problem.y
            )
            {
                originalStillExists = true;
                break;
            }
        }


        if(originalStillExists)
        {
            score += 10000;
        }
        else
        {
            score -= 10000;
        }


        /*
         * Strongly prefer fewer remaining problems.
         */
        score +=
            after.length * 100;


        /*
         * Prefer candidates close to the original
         * protrusion.
         */
        score +=
            this.distancePenalty(
                candidate,
                problem
            );


        /*
         * Avoid creating another isolated wall cell.
         *
         * This is evaluated against the simulated result.
         */
        for(
            const remaining of after
            )
        {
            if(
                remaining.x === candidate.x &&
                remaining.y === candidate.y
            )
            {
                score += 5000;
            }
        }


        return score;
    }


    /*
     * ---------------------------------------------------------
     * Distance
     * ---------------------------------------------------------
     */

    distancePenalty(
        candidate,
        problem
    )
    {
        return (
            Math.abs(
                candidate.x -
                problem.x
            ) +
            Math.abs(
                candidate.y -
                problem.y
            )
        );
    }


    /*
     * ---------------------------------------------------------
     * Logging
     * ---------------------------------------------------------
     */

    logInvalidGeometry(invalid)
    {
        for(
            const problem of invalid
            )
        {
            tiled.log(
                `[WALL NORMALIZER] INVALID ` +
                `PROTRUSION ` +
                `at (${problem.x},${problem.y})`
            );
        }
    }


    /*
     * ---------------------------------------------------------
     * Helpers
     * ---------------------------------------------------------
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