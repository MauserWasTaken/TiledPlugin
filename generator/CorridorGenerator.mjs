export class CorridorGenerator
{
    constructor()
    {
        /*
         * Corridors are always two tiles wide.
         */
        this.corridorWidth = 2;


        /*
         * A corridor must travel at least this many tiles
         * before it is allowed to turn.
         *
         * This is also required before entering the destination
         * room.
         */
        this.minimumStraight = 2;
    }


    /*
     * ============================================================
     * PUBLIC ENTRY POINT
     * ============================================================
     */

    connect(grid, roomA, roomB, width = 2)
    {
        this.corridorWidth = width;


        if(this.corridorWidth !== 2)
        {
            tiled.log(
                `[CORRIDOR] Unsupported corridor width: ${width}`
            );

            return false;
        }


        /*
         * ---------------------------------------------------------
         * Find actual openings.
         * ---------------------------------------------------------
         *
         * These are based on the actual ROOM floor geometry,
         * rather than the rectangular Room bounds.
         */
        const startCandidates =
            this.findConnectionCandidates(
                grid,
                roomA,
                roomB
            );


        const endCandidates =
            this.findConnectionCandidates(
                grid,
                roomB,
                roomA
            );


        if(
            startCandidates.length === 0 ||
            endCandidates.length === 0
        )
        {
            tiled.log(
                `[CORRIDOR] No valid openings ` +
                `${roomA.id} -> ${roomB.id}`
            );

            return false;
        }


        /*
         * ---------------------------------------------------------
         * Try every combination of openings.
         * ---------------------------------------------------------
         */
        const routes = [];


        for(const start of startCandidates)
        {
            for(const end of endCandidates)
            {
                const generated =
                    this.createRoutes(
                        start,
                        end
                    );


                for(const route of generated)
                {
                    if(
                        this.isRouteValid(
                            grid,
                            route,
                            start,
                            end
                        )
                    )
                    {
                        routes.push({
                            route,
                            start,
                            end,

                            score:
                                this.routeScore(
                                    route,
                                    start,
                                    end
                                )
                        });
                    }
                }
            }
        }


        /*
         * ---------------------------------------------------------
         * No valid route.
         * ---------------------------------------------------------
         */
        if(routes.length === 0)
        {
            tiled.log(
                `[CORRIDOR] No legal route ` +
                `${roomA.id} -> ${roomB.id}`
            );

            return false;
        }


        /*
         * ---------------------------------------------------------
         * Select the best route.
         * ---------------------------------------------------------
         */
        routes.sort(
            (a,b) =>
                a.score - b.score
        );


        const selected =
            routes[0];


        /*
         * ---------------------------------------------------------
         * Debug information.
         * ---------------------------------------------------------
         */
        tiled.log(
            `[CORRIDOR] ${roomA.id} -> ${roomB.id} ` +
            `start=(${selected.start.x},${selected.start.y}) ` +
            `${selected.start.direction} ` +
            `end=(${selected.end.x},${selected.end.y}) ` +
            `${selected.end.direction} ` +
            `segments=${selected.route.length} ` +
            `length=${this.routeLength(selected.route)}`
        );


        tiled.log(
            `[CORRIDOR DEBUG] ` +
            `startOutside=(` +
            `${selected.start.outsideX},` +
            `${selected.start.outsideY}` +
            `) ` +
            `${selected.start.direction} ` +
            `endOutside=(` +
            `${selected.end.outsideX},` +
            `${selected.end.outsideY}` +
            `) ` +
            `${selected.end.direction}`
        );


        for(const segment of selected.route)
        {
            tiled.log(
                `[CORRIDOR DEBUG] ` +
                `segment (` +
                `${segment.x1},${segment.y1}` +
                `) -> (` +
                `${segment.x2},${segment.y2}` +
                `)`
            );
        }


        /*
         * ---------------------------------------------------------
         * Carve only after complete validation.
         * ---------------------------------------------------------
         */
        this.carveRoute(
            grid,
            selected.route
        );


        return true;
    }


    /*
     * ============================================================
     * OPENING DETECTION
     * ============================================================
     */

    findConnectionCandidates(
        grid,
        room,
        other
    )
    {
        const candidates = [];


        const dx =
            other.centerX -
            room.centerX;


        const dy =
            other.centerY -
            room.centerY;


        let preferredDirections;


        /*
         * Prefer the side facing the other room.
         */
        if(Math.abs(dx) >= Math.abs(dy))
        {
            preferredDirections =
                dx >= 0
                    ? [
                        "RIGHT",
                        "UP",
                        "DOWN",
                        "LEFT"
                    ]
                    : [
                        "LEFT",
                        "UP",
                        "DOWN",
                        "RIGHT"
                    ];
        }
        else
        {
            preferredDirections =
                dy >= 0
                    ? [
                        "UP",
                        "LEFT",
                        "RIGHT",
                        "DOWN"
                    ]
                    : [
                        "DOWN",
                        "LEFT",
                        "RIGHT",
                        "UP"
                    ];
        }


        /*
         * Search the actual carved room geometry.
         */
        for(
            let y = room.y;
            y <= room.top;
            y++
        )
        {
            for(
                let x = room.x;
                x <= room.right;
                x++
            )
            {
                if(
                    !grid.isRoomFloor(x,y)
                )
                {
                    continue;
                }


                for(
                    let i = 0;
                    i < preferredDirections.length;
                    i++
                )
                {
                    const direction =
                        preferredDirections[i];


                    const candidate =
                        this.createOpeningCandidate(
                            grid,
                            x,
                            y,
                            direction
                        );


                    if(!candidate)
                    {
                        continue;
                    }


                    candidate.priority = i;


                    candidate.distance =
                        this.distance(
                            candidate.outsideX,
                            candidate.outsideY,
                            other.centerX,
                            other.centerY
                        );


                    candidates.push(
                        candidate
                    );
                }
            }
        }


        /*
         * Prefer the side facing the other room.
         * Within that side prefer the closest opening.
         */
        candidates.sort(
            (a,b) =>
            {
                if(
                    a.priority !==
                    b.priority
                )
                {
                    return (
                        a.priority -
                        b.priority
                    );
                }


                return (
                    a.distance -
                    b.distance
                );
            }
        );


        /*
         * Avoid generating hundreds of route combinations.
         */
        return candidates.slice(
            0,
            24
        );
    }


    createOpeningCandidate(
        grid,
        x,
        y,
        direction
    )
    {
        /*
         * The opening is two tiles wide.
         *
         * Example for RIGHT:
         *
         *       ROOM
         *       ROOM -> corridor
         *
         * The second opening tile is vertically adjacent.
         */
        let secondX = x;
        let secondY = y;


        let outsideX = x;
        let outsideY = y;


        let outside2X = x;
        let outside2Y = y;


        switch(direction)
        {
            case "RIGHT":

                secondX = x;
                secondY = y + 1;

                outsideX = x + 1;
                outsideY = y;

                outside2X = x + 1;
                outside2Y = y + 1;

                break;


            case "LEFT":

                secondX = x;
                secondY = y + 1;

                outsideX = x - 1;
                outsideY = y;

                outside2X = x - 1;
                outside2Y = y + 1;

                break;


            case "UP":

                secondX = x + 1;
                secondY = y;

                outsideX = x;
                outsideY = y + 1;

                outside2X = x + 1;
                outside2Y = y + 1;

                break;


            case "DOWN":

                secondX = x + 1;
                secondY = y;

                outsideX = x;
                outsideY = y - 1;

                outside2X = x + 1;
                outside2Y = y - 1;

                break;


            default:
                return null;
        }


        /*
         * Both tiles making the room opening must actually
         * belong to the room.
         */
        if(
            !grid.isRoomFloor(
                x,
                y
            )
        )
        {
            return null;
        }


        if(
            !grid.isRoomFloor(
                secondX,
                secondY
            )
        )
        {
            return null;
        }


        /*
         * Both tiles immediately outside must be inside
         * the map.
         */
        if(
            !grid.isInside(
                outsideX,
                outsideY
            ) ||
            !grid.isInside(
                outside2X,
                outside2Y
            )
        )
        {
            return null;
        }


        /*
         * They may not be another room.
         *
         * Existing corridor floor is allowed.
         */
        if(
            grid.isRoomFloor(
                outsideX,
                outsideY
            ) ||
            grid.isRoomFloor(
                outside2X,
                outside2Y
            )
        )
        {
            return null;
        }


        /*
         * Make sure the opening really is on the room boundary.
         *
         * At least the anchor tile must have no room floor
         * immediately beyond it.
         */
        if(
            this.isRoomBoundary(
                grid,
                x,
                y,
                direction
            ) === false
        )
        {
            return null;
        }


        return {
            x,
            y,

            secondX,
            secondY,

            outsideX,
            outsideY,

            outside2X,
            outside2Y,

            direction
        };
    }


    isRoomBoundary(
        grid,
        x,
        y,
        direction
    )
    {
        const outside =
            this.movePoint(
                {x,y},
                direction
            );


        return !grid.isRoomFloor(
            outside.x,
            outside.y
        );
    }


    /*
     * ============================================================
     * ROUTE CREATION
     * ============================================================
     *
     * The critical rule here is:
     *
     * START:
     *
     * room -> outside -> outside -> outside -> bend
     *
     * END:
     *
     * bend -> outside -> outside -> room
     *
     * Therefore the corridor cannot immediately turn after
     * leaving a circle/cross/rectangle.
     */

    createRoutes(start,end)
    {
        const routes = [];


        /*
         * Start one tile outside the room.
         */
        const startOutside = {
            x: start.outsideX,
            y: start.outsideY
        };


        const endOutside = {
            x: end.outsideX,
            y: end.outsideY
        };


        /*
         * Extend the starting corridor in the direction of
         * the selected opening.
         */
        const startRun =
            this.movePoint(
                startOutside,
                start.direction
            );


        const startRun2 =
            this.movePoint(
                startRun,
                start.direction
            );


        /*
         * The destination must be approached from the opposite
         * direction of its opening.
         *
         * Example:
         *
         * destination opening = LEFT
         *
         * corridor approaches from RIGHT.
         */
        const endApproachDirection =
            this.oppositeDirection(
                end.direction
            );


        const endRun =
            this.movePoint(
                endOutside,
                endApproachDirection
            );


        const endRun2 =
            this.movePoint(
                endRun,
                endApproachDirection
            );


        /*
         * ---------------------------------------------------------
         * Straight route.
         * ---------------------------------------------------------
         */
        if(
            startRun2.x === endRun2.x ||
            startRun2.y === endRun2.y
        )
        {
            const straight =
                this.makeStraightRoute(
                    startOutside,
                    endOutside,
                    startRun2,
                    endRun2
                );


            if(straight)
            {
                routes.push(straight);
            }
        }


        /*
         * ---------------------------------------------------------
         * One-bend routes.
         * ---------------------------------------------------------
         */
        const horizontalFirst =
            this.makeOneBendRoute(
                startOutside,
                startRun2,
                endRun2,
                endOutside,
                "HORIZONTAL_FIRST"
            );


        if(horizontalFirst)
        {
            routes.push(
                horizontalFirst
            );
        }


        const verticalFirst =
            this.makeOneBendRoute(
                startOutside,
                startRun2,
                endRun2,
                endOutside,
                "VERTICAL_FIRST"
            );


        if(verticalFirst)
        {
            routes.push(
                verticalFirst
            );
        }


        /*
         * ---------------------------------------------------------
         * Two-bend routes.
         * ---------------------------------------------------------
         *
         * These are useful when an L would make one of the
         * middle runs too short.
         */
        const dogLegs =
            this.makeDogLegRoutes(
                startOutside,
                startRun2,
                endRun2,
                endOutside
            );


        for(const route of dogLegs)
        {
            routes.push(route);
        }


        /*
         * Remove duplicate routes.
         */
        return this.removeDuplicateRoutes(
            routes
        );
    }


    /*
     * ============================================================
     * STRAIGHT ROUTE
     * ============================================================
     */

    makeStraightRoute(
        startOutside,
        endOutside,
        startRun,
        endRun
    )
    {
        /*
         * If the extended points are aligned, the whole route
         * can remain straight.
         */
        if(
            startRun.x === endRun.x
        )
        {
            return this.simplifyRoute([
                {
                    x1: startOutside.x,
                    y1: startOutside.y,
                    x2: startRun.x,
                    y2: startRun.y
                },

                {
                    x1: startRun.x,
                    y1: startRun.y,
                    x2: endRun.x,
                    y2: endRun.y
                },

                {
                    x1: endRun.x,
                    y1: endRun.y,
                    x2: endOutside.x,
                    y2: endOutside.y
                }
            ]);
        }


        if(
            startRun.y === endRun.y
        )
        {
            return this.simplifyRoute([
                {
                    x1: startOutside.x,
                    y1: startOutside.y,
                    x2: startRun.x,
                    y2: startRun.y
                },

                {
                    x1: startRun.x,
                    y1: startRun.y,
                    x2: endRun.x,
                    y2: endRun.y
                },

                {
                    x1: endRun.x,
                    y1: endRun.y,
                    x2: endOutside.x,
                    y2: endOutside.y
                }
            ]);
        }


        return null;
    }


    /*
     * ============================================================
     * ONE-BEND ROUTE
     * ============================================================
     */

    makeOneBendRoute(
        startOutside,
        startRun,
        endRun,
        endOutside,
        mode
    )
    {
        let bend;


        if(mode === "HORIZONTAL_FIRST")
        {
            bend = {
                x: endRun.x,
                y: startRun.y
            };
        }
        else
        {
            bend = {
                x: startRun.x,
                y: endRun.y
            };
        }


        /*
         * A bend cannot be identical to either endpoint.
         */
        if(
            (
                bend.x === startRun.x &&
                bend.y === startRun.y
            ) ||
            (
                bend.x === endRun.x &&
                bend.y === endRun.y
            )
        )
        {
            return null;
        }


        const route = [
            {
                x1: startOutside.x,
                y1: startOutside.y,
                x2: startRun.x,
                y2: startRun.y
            },

            {
                x1: startRun.x,
                y1: startRun.y,
                x2: bend.x,
                y2: bend.y
            },

            {
                x1: bend.x,
                y1: bend.y,
                x2: endRun.x,
                y2: endRun.y
            },

            {
                x1: endRun.x,
                y1: endRun.y,
                x2: endOutside.x,
                y2: endOutside.y
            }
        ];


        return this.simplifyRoute(route);
    }


    /*
     * ============================================================
     * TWO-BEND ROUTES
     * ============================================================
     *
     * We deliberately construct these only with horizontal and
     * vertical segments.
     */

    makeDogLegRoutes(
        startOutside,
        startRun,
        endRun,
        endOutside
    )
    {
        const routes = [];


        /*
         * ---------------------------------------------------------
         * Horizontal dog-leg
         * ---------------------------------------------------------
         *
         *     start
         *       |
         *       +--------+
         *                |
         *                +-------- end
         *
         * The middle vertical run is created between two
         * horizontal runs.
         */
        if(
            startRun.x !== endRun.x
        )
        {
            const minX =
                Math.min(
                    startRun.x,
                    endRun.x
                );


            const maxX =
                Math.max(
                    startRun.x,
                    endRun.x
                );


            const middleX =
                Math.floor(
                    (minX + maxX) / 2
                );


            const route = [
                {
                    x1: startOutside.x,
                    y1: startOutside.y,
                    x2: startRun.x,
                    y2: startRun.y
                },

                {
                    x1: startRun.x,
                    y1: startRun.y,
                    x2: middleX,
                    y2: startRun.y
                },

                {
                    x1: middleX,
                    y1: startRun.y,
                    x2: middleX,
                    y2: endRun.y
                },

                {
                    x1: middleX,
                    y1: endRun.y,
                    x2: endRun.x,
                    y2: endRun.y
                },

                {
                    x1: endRun.x,
                    y1: endRun.y,
                    x2: endOutside.x,
                    y2: endOutside.y
                }
            ];


            routes.push(
                this.simplifyRoute(route)
            );
        }


        /*
         * ---------------------------------------------------------
         * Vertical dog-leg
         * ---------------------------------------------------------
         */
        if(
            startRun.y !== endRun.y
        )
        {
            const minY =
                Math.min(
                    startRun.y,
                    endRun.y
                );


            const maxY =
                Math.max(
                    startRun.y,
                    endRun.y
                );


            const middleY =
                Math.floor(
                    (minY + maxY) / 2
                );


            const route = [
                {
                    x1: startOutside.x,
                    y1: startOutside.y,
                    x2: startRun.x,
                    y2: startRun.y
                },

                {
                    x1: startRun.x,
                    y1: startRun.y,
                    x2: startRun.x,
                    y2: middleY
                },

                {
                    x1: startRun.x,
                    y1: middleY,
                    x2: endRun.x,
                    y2: middleY
                },

                {
                    x1: endRun.x,
                    y1: middleY,
                    x2: endRun.x,
                    y2: endRun.y
                },

                {
                    x1: endRun.x,
                    y1: endRun.y,
                    x2: endOutside.x,
                    y2: endOutside.y
                }
            ];


            routes.push(
                this.simplifyRoute(route)
            );
        }


        return routes;
    }


    /*
     * ============================================================
     * ROUTE VALIDATION
     * ============================================================
     */

    isRouteValid(
        grid,
        route,
        start,
        end
    )
    {
        if(
            !route ||
            route.length === 0
        )
        {
            return false;
        }


        const segments =
            this.simplifyRoute(route);


        if(
            !segments ||
            segments.length === 0
        )
        {
            return false;
        }


        /*
         * ---------------------------------------------------------
         * Every segment must be horizontal or vertical.
         * ---------------------------------------------------------
         */
        for(const segment of segments)
        {
            const horizontal =
                segment.y1 === segment.y2;


            const vertical =
                segment.x1 === segment.x2;


            if(
                !horizontal &&
                !vertical
            )
            {
                return false;
            }
        }


        /*
         * ---------------------------------------------------------
         * Validate every segment length around bends.
         * ---------------------------------------------------------
         *
         * The first and final runs are especially important:
         *
         * ROOM -> 1 -> 2 -> BEND
         *
         * and:
         *
         * BEND -> 2 -> 1 -> ROOM
         */
        for(
            let i = 0;
            i < segments.length;
            i++
        )
        {
            const length =
                this.segmentLength(
                    segments[i]
                );


            if(length === 0)
            {
                return false;
            }


            /*
             * If this segment touches a bend, it must have
             * minimumStraight length.
             */
            const touchesPreviousBend =
                i > 0;


            const touchesNextBend =
                i <
                segments.length - 1;


            if(
                (
                    touchesPreviousBend ||
                    touchesNextBend
                ) &&
                length <
                this.minimumStraight
            )
            {
                return false;
            }
        }


        /*
         * ---------------------------------------------------------
         * Validate that the first segment actually leaves the
         * room in the selected opening direction.
         * ---------------------------------------------------------
         */
        if(
            !this.segmentMatchesDirection(
                segments[0],
                start.direction
            )
        )
        {
            return false;
        }


        /*
         * ---------------------------------------------------------
         * Validate the final segment.
         *
         * The corridor must travel toward the destination room.
         */
        if(
            !this.segmentMatchesDirection(
                segments[
                segments.length - 1
                    ],
                this.oppositeDirection(
                    end.direction
                )
            )
        )
        {
            return false;
        }


        /*
         * ---------------------------------------------------------
         * Build the actual two-tile-wide corridor geometry.
         * ---------------------------------------------------------
         */
        const corridorTiles =
            this.buildCorridorTileSet(
                segments
            );


        if(
            corridorTiles.size === 0
        )
        {
            return false;
        }


        /*
         * ---------------------------------------------------------
         * Every corridor tile must be inside the map.
         * ---------------------------------------------------------
         */
        for(const key of corridorTiles)
        {
            const point =
                this.parseKey(key);


            if(
                !grid.isInside(
                    point.x,
                    point.y
                )
            )
            {
                return false;
            }
        }


        /*
         * ---------------------------------------------------------
         * Do not cut through rooms.
         * ---------------------------------------------------------
         *
         * The route starts outside and ends outside, so normally
         * there should be no ROOM tiles in the corridor geometry.
         */
        for(const key of corridorTiles)
        {
            const point =
                this.parseKey(key);


            if(
                grid.isRoomFloor(
                    point.x,
                    point.y
                )
            )
            {
                return false;
            }
        }


        /*
         * ---------------------------------------------------------
         * Make sure the corridor remains two tiles wide.
         * ---------------------------------------------------------
         */
        if(
            !this.hasContinuousWidth(
                corridorTiles,
                segments
            )
        )
        {
            return false;
        }


        return true;
    }


    /*
     * ============================================================
     * DIRECTION VALIDATION
     * ============================================================
     */

    segmentMatchesDirection(
        segment,
        direction
    )
    {
        switch(direction)
        {
            case "RIGHT":
                return (
                    segment.y1 === segment.y2 &&
                    segment.x2 > segment.x1
                );


            case "LEFT":
                return (
                    segment.y1 === segment.y2 &&
                    segment.x2 < segment.x1
                );


            case "UP":
                return (
                    segment.x1 === segment.x2 &&
                    segment.y2 > segment.y1
                );


            case "DOWN":
                return (
                    segment.x1 === segment.x2 &&
                    segment.y2 < segment.y1
                );


            default:
                return false;
        }
    }


    oppositeDirection(direction)
    {
        switch(direction)
        {
            case "RIGHT":
                return "LEFT";

            case "LEFT":
                return "RIGHT";

            case "UP":
                return "DOWN";

            case "DOWN":
                return "UP";

            default:
                return null;
        }
    }


    movePoint(point,direction)
    {
        switch(direction)
        {
            case "RIGHT":
                return {
                    x: point.x + 1,
                    y: point.y
                };


            case "LEFT":
                return {
                    x: point.x - 1,
                    y: point.y
                };


            case "UP":
                return {
                    x: point.x,
                    y: point.y + 1
                };


            case "DOWN":
                return {
                    x: point.x,
                    y: point.y - 1
                };


            default:
                return {
                    x: point.x,
                    y: point.y
                };
        }
    }


    /*
     * ============================================================
     * CORRIDOR GEOMETRY
     * ============================================================
     *
     * Every horizontal centerline tile produces:
     *
     *     ##
     *
     * vertically adjacent.
     *
     * Every vertical centerline tile produces:
     *
     *     ##
     *     ##
     *
     * with the second tile horizontally adjacent.
     *
     * The exact convention matches the carving code below.
     */

    buildCorridorTileSet(segments)
    {
        const tiles =
            new Set();


        for(const segment of segments)
        {
            const horizontal =
                segment.y1 === segment.y2;


            if(horizontal)
            {
                const step =
                    segment.x2 >= segment.x1
                        ? 1
                        : -1;


                for(
                    let x = segment.x1;
                    ;
                    x += step
                )
                {
                    tiles.add(
                        this.key(
                            x,
                            segment.y1
                        )
                    );


                    tiles.add(
                        this.key(
                            x,
                            segment.y1 + 1
                        )
                    );


                    if(
                        x === segment.x2
                    )
                    {
                        break;
                    }
                }
            }
            else
            {
                const step =
                    segment.y2 >= segment.y1
                        ? 1
                        : -1;


                for(
                    let y = segment.y1;
                    ;
                    y += step
                )
                {
                    tiles.add(
                        this.key(
                            segment.x1,
                            y
                        )
                    );


                    tiles.add(
                        this.key(
                            segment.x1 + 1,
                            y
                        )
                    );


                    if(
                        y === segment.y2
                    )
                    {
                        break;
                    }
                }
            }
        }


        return tiles;
    }


    hasContinuousWidth(
        corridorTiles,
        segments
    )
    {
        for(const segment of segments)
        {
            const horizontal =
                segment.y1 === segment.y2;


            const points =
                this.getSegmentPoints(
                    segment
                );


            for(const point of points)
            {
                if(horizontal)
                {
                    if(
                        !corridorTiles.has(
                            this.key(
                                point.x,
                                point.y
                            )
                        )
                    )
                    {
                        return false;
                    }


                    if(
                        !corridorTiles.has(
                            this.key(
                                point.x,
                                point.y + 1
                            )
                        )
                    )
                    {
                        return false;
                    }
                }
                else
                {
                    if(
                        !corridorTiles.has(
                            this.key(
                                point.x,
                                point.y
                            )
                        )
                    )
                    {
                        return false;
                    }


                    if(
                        !corridorTiles.has(
                            this.key(
                                point.x + 1,
                                point.y
                            )
                        )
                    )
                    {
                        return false;
                    }
                }
            }
        }


        return true;
    }


    /*
     * ============================================================
     * CARVING
     * ============================================================
     */

    carveRoute(grid,route)
    {
        const segments =
            this.simplifyRoute(route);


        for(const segment of segments)
        {
            this.carveSegment(
                grid,
                segment
            );
        }
    }


    carveSegment(grid,segment)
    {
        const horizontal =
            segment.y1 === segment.y2;


        if(horizontal)
        {
            const step =
                segment.x2 >= segment.x1
                    ? 1
                    : -1;


            for(
                let x = segment.x1;
                ;
                x += step
            )
            {
                this.carve(
                    grid,
                    x,
                    segment.y1
                );


                this.carve(
                    grid,
                    x,
                    segment.y1 + 1
                );


                if(
                    x === segment.x2
                )
                {
                    break;
                }
            }


            return;
        }


        const step =
            segment.y2 >= segment.y1
                ? 1
                : -1;


        for(
            let y = segment.y1;
            ;
            y += step
        )
        {
            this.carve(
                grid,
                segment.x1,
                y
            );


            this.carve(
                grid,
                segment.x1 + 1,
                y
            );


            if(
                y === segment.y2
            )
            {
                break;
            }
        }
    }


    carve(grid,x,y)
    {
        if(
            !grid.isInside(x,y)
        )
        {
            return;
        }


        grid.setFloor(
            x,
            y,
            "CORRIDOR"
        );
    }


    /*
     * ============================================================
     * ROUTE HELPERS
     * ============================================================
     */

    simplifyRoute(route)
    {
        if(!route)
        {
            return null;
        }


        const result = [];


        for(const segment of route)
        {
            /*
             * Ignore zero-length segments.
             */
            if(
                segment.x1 === segment.x2 &&
                segment.y1 === segment.y2
            )
            {
                continue;
            }


            const horizontal =
                segment.y1 === segment.y2;


            const vertical =
                segment.x1 === segment.x2;


            /*
             * Never allow diagonal segments into the route.
             */
            if(
                !horizontal &&
                !vertical
            )
            {
                return null;
            }


            const last =
                result[
                result.length - 1
                    ];


            if(last)
            {
                const lastHorizontal =
                    last.y1 === last.y2;


                const currentHorizontal =
                    horizontal;


                /*
                 * Merge only collinear connected segments.
                 */
                if(
                    lastHorizontal ===
                    currentHorizontal &&
                    last.x2 === segment.x1 &&
                    last.y2 === segment.y1
                )
                {
                    last.x2 =
                        segment.x2;

                    last.y2 =
                        segment.y2;

                    continue;
                }
            }


            result.push({
                x1: segment.x1,
                y1: segment.y1,
                x2: segment.x2,
                y2: segment.y2
            });
        }


        return result;
    }


    getSegmentPoints(segment)
    {
        const points = [];


        if(
            segment.y1 === segment.y2
        )
        {
            const step =
                segment.x2 >= segment.x1
                    ? 1
                    : -1;


            for(
                let x = segment.x1;
                ;
                x += step
            )
            {
                points.push({
                    x,
                    y: segment.y1
                });


                if(
                    x === segment.x2
                )
                {
                    break;
                }
            }


            return points;
        }


        const step =
            segment.y2 >= segment.y1
                ? 1
                : -1;


        for(
            let y = segment.y1;
            ;
            y += step
        )
        {
            points.push({
                x: segment.x1,
                y
            });


            if(
                y === segment.y2
            )
            {
                break;
            }
        }


        return points;
    }


    segmentLength(segment)
    {
        return (
            Math.abs(
                segment.x2 -
                segment.x1
            ) +
            Math.abs(
                segment.y2 -
                segment.y1
            )
        );
    }


    routeLength(route)
    {
        let length = 0;


        for(const segment of route)
        {
            length +=
                this.segmentLength(
                    segment
                );
        }


        return length;
    }


    routeScore(
        route,
        start,
        end
    )
    {
        const bends =
            Math.max(
                0,
                route.length - 1
            );


        /*
         * Prefer shorter routes.
         *
         * Strong penalty for additional bends.
         */
        return (
            this.routeLength(route) +
            bends * 20
        );
    }


    removeDuplicateRoutes(routes)
    {
        const result = [];
        const seen = new Set();


        for(const route of routes)
        {
            if(!route)
            {
                continue;
            }


            const key =
                route
                    .map(
                        segment =>
                            `${segment.x1},${segment.y1}` +
                            `:${segment.x2},${segment.y2}`
                    )
                    .join("|");


            if(
                seen.has(key)
            )
            {
                continue;
            }


            seen.add(key);


            result.push(route);
        }


        return result;
    }


    distance(
        x1,
        y1,
        x2,
        y2
    )
    {
        return (
            Math.abs(
                x2 - x1
            ) +
            Math.abs(
                y2 - y1
            )
        );
    }


    key(x,y)
    {
        return `${x},${y}`;
    }


    parseKey(key)
    {
        const parts =
            key
                .split(",")
                .map(Number);


        return {
            x: parts[0],
            y: parts[1]
        };
    }
}