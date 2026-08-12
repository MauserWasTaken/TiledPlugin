export class CorridorGenerator {

    connect(grid,a,b,width)
    {
        const start =
            a.wallPointTowards(b);

        const end =
            b.wallPointTowards(a);


        /*
         * Open the entrance into both rooms.
         */

        this.carveOpening(
            grid,
            start.x,
            start.y
        );


        this.carveOpening(
            grid,
            end.x,
            end.y
        );


        this.carvePath(
            grid,
            start,
            end,
            width
        );
    }


    carvePath(grid,start,end,width)
    {
        /*
         * Move one tile outside each room first.
         *
         * This guarantees that the corridor has a
         * straight section before making a turn.
         */

        const startStep =
            this.step(
                start.x,
                start.y,
                start.direction
            );


        const endStep =
            this.step(
                end.x,
                end.y,
                end.direction
            );


        /*
         * If the points are already aligned, we can
         * simply connect them with one straight corridor.
         */

        if(startStep.x === endStep.x)
        {
            this.carveVertical(
                grid,
                startStep.y,
                endStep.y,
                startStep.x,
                width
            );

            return;
        }


        if(startStep.y === endStep.y)
        {
            this.carveHorizontal(
                grid,
                startStep.x,
                endStep.x,
                startStep.y,
                width
            );

            return;
        }


        /*
         * We need an L-shaped corridor.
         *
         * There are two possible bends:
         *
         *     start → horizontal → vertical → end
         *
         * or
         *
         *     start → vertical → horizontal → end
         *
         * We only accept bends that leave at least
         * one tile of straight corridor after leaving
         * each room.
         */


        const candidates = [];


        /*
         * Candidate 1:
         *
         * start
         *   |
         *   |
         *   +────────
         *            |
         *            |
         *           end
         */

        const bend1 = {
            x: startStep.x,
            y: endStep.y
        };


        if(
            this.validBend(
                startStep,
                endStep,
                bend1
            )
        )
        {
            candidates.push({
                bend: bend1,
                firstDirection:
                    this.getDirection(
                        startStep,
                        bend1
                    ),
                secondDirection:
                    this.getDirection(
                        bend1,
                        endStep
                    )
            });
        }


        /*
         * Candidate 2:
         *
         * start ──────+
         *              |
         *              |
         *              |
         *             end
         */

        const bend2 = {
            x: endStep.x,
            y: startStep.y
        };


        if(
            this.validBend(
                startStep,
                endStep,
                bend2
            )
        )
        {
            candidates.push({
                bend: bend2,
                firstDirection:
                    this.getDirection(
                        startStep,
                        bend2
                    ),
                secondDirection:
                    this.getDirection(
                        bend2,
                        endStep
                    )
            });
        }


        /*
         * If both routes are possible, randomly choose
         * between them so the dungeon remains varied.
         */

        if(candidates.length > 0)
        {
            const candidate =
                candidates[
                    Math.floor(
                        Math.random() *
                        candidates.length
                    )
                    ];


            this.carveSegment(
                grid,
                startStep,
                candidate.bend,
                width
            );


            this.carveSegment(
                grid,
                candidate.bend,
                endStep,
                width
            );


            return;
        }


        /*
         * This should be uncommon, but if neither simple
         * L-shaped route is valid, use a safe route with
         * an explicit one-tile straight section.
         */

        this.carveFallback(
            grid,
            startStep,
            endStep,
            width
        );
    }


    /*
     * Move one tile in a direction.
     */

    step(x,y,direction)
    {
        switch(direction)
        {
            case "UP":
                return {
                    x: x,
                    y: y + 1
                };


            case "DOWN":
                return {
                    x: x,
                    y: y - 1
                };


            case "LEFT":
                return {
                    x: x - 1,
                    y: y
                };


            case "RIGHT":
                return {
                    x: x + 1,
                    y: y
                };
        }


        return {
            x: x,
            y: y
        };
    }


    /*
     * A bend is valid only if both segments actually
     * contain at least one tile.
     */

    validBend(start,end,bend)
    {
        const firstLength =
            Math.abs(
                bend.x - start.x
            ) +
            Math.abs(
                bend.y - start.y
            );


        const secondLength =
            Math.abs(
                end.x - bend.x
            ) +
            Math.abs(
                end.y - bend.y
            );


        return (
            firstLength >= 1 &&
            secondLength >= 1
        );
    }


    getDirection(a,b)
    {
        if(b.x > a.x)
            return "RIGHT";

        if(b.x < a.x)
            return "LEFT";

        if(b.y > a.y)
            return "UP";

        if(b.y < a.y)
            return "DOWN";

        return null;
    }


    carveSegment(grid,a,b,width)
    {
        if(a.x === b.x)
        {
            this.carveVertical(
                grid,
                a.y,
                b.y,
                a.x,
                width
            );

            return;
        }


        if(a.y === b.y)
        {
            this.carveHorizontal(
                grid,
                a.x,
                b.x,
                a.y,
                width
            );
        }
    }


    /*
     * Fallback route.
     *
     * This deliberately creates a small straight
     * section before changing direction.
     */

    carveFallback(grid,start,end,width)
    {
        let bendX =
            start.x;

        let bendY =
            start.y;


        /*
         * Move one extra tile in the starting direction.
         */

        const first =
            this.step(
                start.x,
                start.y,
                this.getDirection(
                    start,
                    end
                )
            );


        if(first.x !== start.x)
        {
            bendX = first.x;
        }
        else
        {
            bendY = first.y;
        }


        if(
            bendX !== end.x &&
            bendY !== end.y
        )
        {
            const bend = {
                x: bendX,
                y: end.y
            };


            this.carveSegment(
                grid,
                start,
                first,
                width
            );


            this.carveSegment(
                grid,
                first,
                bend,
                width
            );


            this.carveSegment(
                grid,
                bend,
                end,
                width
            );
        }
        else
        {
            this.carveSegment(
                grid,
                start,
                first,
                width
            );


            this.carveSegment(
                grid,
                first,
                end,
                width
            );
        }
    }


    carveHorizontal(grid,x1,x2,y,width)
    {
        for(
            let x = Math.min(x1,x2);
            x <= Math.max(x1,x2);
            x++
        )
        {
            const startOffset =
                -Math.floor(width / 2);

            const endOffset =
                startOffset + width - 1;


            for(
                let offset = startOffset;
                offset <= endOffset;
                offset++
            )
            {
                grid.setFloor(
                    x,
                    y + offset
                );
            }
        }
    }


    carveVertical(grid,y1,y2,x,width)
    {
        for(
            let y = Math.min(y1,y2);
            y <= Math.max(y1,y2);
            y++
        )
        {
            const startOffset =
                -Math.floor(width / 2);

            const endOffset =
                startOffset + width - 1;


            for(
                let offset = startOffset;
                offset <= endOffset;
                offset++
            )
            {
                grid.setFloor(
                    x + offset,
                    y
                );
            }
        }
    }


    carveOpening(grid,x,y)
    {
        for(let dx = -1; dx <= 1; dx++)
        {
            for(let dy = -1; dy <= 1; dy++)
            {
                grid.setFloor(
                    x + dx,
                    y + dy
                );
            }
        }
    }
}