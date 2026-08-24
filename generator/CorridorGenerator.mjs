export class CorridorGenerator
{
    constructor()
    {
        /*
         * Corridors are always two tiles wide.
         *
         * Keeping this fixed makes the geometry predictable
         * for the wall tileset.
         */
        this.corridorWidth = 2;


        /*
         * Minimum number of corridor tiles between a room
         * opening and a bend.
         *
         * Therefore an L-shaped corridor must look like:
         *
         * ROOM
         *   |
         *   |  tile 1
         *   |  tile 2
         *   +---------- bend
         *
         * The bend is never allowed immediately beside
         * the room.
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


        /*
         * This generator is designed around a two-tile corridor.
         *
         * Do not silently create a one-tile corridor.
         */
        if(this.corridorWidth !== 2)
        {
            tiled.log(
                `[CORRIDOR] Unsupported corridor width: ${width}`
            );

            return false;
        }


        /*
         * Find an actual floor opening on each room.
         *
         * The connection point is NOT taken from the room's
         * rectangular bounding box.
         *
         * This is important for:
         *
         * RECTANGLE
         * CIRCLE
         * CROSS
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
                `[CORRIDOR] No valid room openings ` +
                `${roomA.id} -> ${roomB.id}`
            );

            return false;
        }


        /*
         * Try every reasonable pair of openings.
         *
         * This is considerably safer than choosing one random
         * wall point and then discovering that no legal route
         * exists.
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


        if(routes.length === 0)
        {
            tiled.log(
                `[CORRIDOR] No legal route ` +
                `${roomA.id} -> ${roomB.id}`
            );

            return false;
        }


        /*
         * Prefer:
         *
         * 1. shortest route
         * 2. fewer bends
         * 3. fewer unnecessary turns
         */
        routes.sort(
            (a,b) =>
                a.score - b.score
        );


        const selected =
            routes[0];


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
            `startOpening=(${selected.start.x},${selected.start.y}) ${selected.start.direction} ` +
            `outside=(${selected.start.outsideX},${selected.start.outsideY}) ` +
            `endOpening=(${selected.end.x},${selected.end.y}) ${selected.end.direction} ` +
            `outside=(${selected.end.outsideX},${selected.end.outsideY})`
        );

        for(const segment of selected.route)
        {
            tiled.log(
                `[CORRIDOR DEBUG] ` +
                `segment (${segment.x1},${segment.y1}) -> ` +
                `(${segment.x2},${segment.y2})`
            );
        }

        /*
         * Only carve after the complete route has been validated.
         */
        this.carveRoute(
            grid,
            selected.route
        );


        return true;
    }


    /*
     * ============================================================
     * ROOM OPENINGS
     * ============================================================
     *
     * Find places where a TWO TILE wide corridor can leave
     * the room.
     *
     * For example, for RIGHT:
     *
     *       ROOM ROOM
     *       ROOM ROOM
     *             ->
     *       CORR CORR
     *
     * Both rows are required.
     */

    findConnectionCandidates(grid, room, other)
    {
        const candidates = [];


        const dx =
            other.centerX -
            room.centerX;


        const dy =
            other.centerY -
            room.centerY;


        let preferredDirections;


        if(Math.abs(dx) >= Math.abs(dy))
        {
            preferredDirections =
                dx >= 0
                    ? ["RIGHT", "UP", "DOWN", "LEFT"]
                    : ["LEFT", "UP", "DOWN", "RIGHT"];
        }
        else
        {
            preferredDirections =
                dy >= 0
                    ? ["UP", "LEFT", "RIGHT", "DOWN"]
                    : ["DOWN", "LEFT", "RIGHT", "UP"];
        }


        /*
         * Search the room's bounding area.
         *
         * We only accept actual ROOM floor.
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
                if(!grid.isRoomFloor(x,y))
                    continue;


                for(
                    let directionIndex = 0;
                    directionIndex < preferredDirections.length;
                    directionIndex++
                )
                {
                    const direction =
                        preferredDirections[
                            directionIndex
                            ];


                    const candidate =
                        this.createOpeningCandidate(
                            grid,
                            x,
                            y,
                            direction
                        );


                    if(!candidate)
                        continue;


                    /*
                     * Distance to the other room is used only
                     * as a preference.
                     */
                    candidate.priority =
                        directionIndex;


                    candidate.distance =
                        this.distance(
                            candidate.outsideX,
                            candidate.outsideY,
                            other.centerX,
                            other.centerY
                        );


                    candidates.push(candidate);
                }
            }
        }


        /*
         * Best side first.
         *
         * Then closest to the target room.
         */
        candidates.sort(
            (a,b) =>
            {
                if(a.priority !== b.priority)
                {
                    return a.priority -
                        b.priority;
                }


                return a.distance -
                    b.distance;
            }
        );


        /*
         * Keep the candidate list reasonably small.
         *
         * We do not need every possible room tile.
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
         * The anchor is the first tile of the two-wide opening.
         *
         * We construct the second tile perpendicular to the
         * direction of travel.
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

                secondY = y + 1;

                outsideX = x + 1;
                outside2X = x + 1;
                outside2Y = y + 1;

                break;


            case "LEFT":

                secondY = y + 1;

                outsideX = x - 1;
                outside2X = x - 1;
                outside2Y = y + 1;

                break;


            case "UP":

                secondX = x + 1;

                outsideY = y + 1;
                outside2X = x + 1;
                outside2Y = y + 1;

                break;


            case "DOWN":

                secondX = x + 1;

                outsideY = y - 1;
                outside2X = x + 1;
                outside2Y = y - 1;

                break;


            default:
                return null;
        }


        /*
         * Both room-mouth tiles must actually be room floor.
         */
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
         * The tiles immediately outside the room must be
         * available for the corridor.
         *
         * They may already be FLOOR if they belong to another
         * corridor, but they must never be another ROOM.
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


    /*
     * ============================================================
     * ROUTE CREATION
     * ============================================================
     */

    createRoutes(start,end)
    {
        const routes = [];


        /*
         * The corridor starts OUTSIDE the room.
         *
         * The room itself already supplies the first two tiles
         * of the opening.
         */
        const startPoint = {
            x: start.outsideX,
            y: start.outsideY
        };


        const endPoint = {
            x: end.outsideX,
            y: end.outsideY
        };


        /*
         * --------------------------------------------------------
         * STRAIGHT
         * --------------------------------------------------------
         */
        if(
            startPoint.x === endPoint.x ||
            startPoint.y === endPoint.y
        )
        {
            routes.push(
                this.makeStraightRoute(
                    startPoint,
                    endPoint
                )
            );
        }


        /*
         * --------------------------------------------------------
         * L: horizontal first
         * --------------------------------------------------------
         */
        const horizontalFirst =
            this.makeHorizontalFirstRoute(
                startPoint,
                endPoint
            );


        if(horizontalFirst)
        {
            routes.push(
                horizontalFirst
            );
        }


        /*
         * --------------------------------------------------------
         * L: vertical first
         * --------------------------------------------------------
         */
        const verticalFirst =
            this.makeVerticalFirstRoute(
                startPoint,
                endPoint
            );


        if(verticalFirst)
        {
            routes.push(
                verticalFirst
            );
        }


        /*
         * --------------------------------------------------------
         * TWO-BEND FALLBACK
         * --------------------------------------------------------
         *
         * Used when a normal L cannot give both rooms enough
         * straight distance.
         */
        const dogLegHorizontal =
            this.makeDogLegHorizontal(
                startPoint,
                endPoint
            );


        if(dogLegHorizontal)
        {
            routes.push(
                dogLegHorizontal
            );
        }


        const dogLegVertical =
            this.makeDogLegVertical(
                startPoint,
                endPoint
            );


        if(dogLegVertical)
        {
            routes.push(
                dogLegVertical
            );
        }


        return routes;
    }


    makeStraightRoute(start,end)
    {
        return [
            {
                x1: start.x,
                y1: start.y,
                x2: end.x,
                y2: end.y
            }
        ];
    }


    /*
     * ============================================================
     * L ROUTES
     * ============================================================
     *
     * Important:
     *
     * The bend coordinate is exactly two tiles away from the
     * outside room opening.
     *
     * Because the outside point itself is already one tile
     * away from the room wall, this produces:
     *
     * ROOM | 1 | 2 | BEND
     *
     * rather than:
     *
     * ROOM | BEND
     */

    makeHorizontalFirstRoute(start,end)
    {
        if(start.x === end.x)
            return null;


        const direction =
            end.x > start.x
                ? 1
                : -1;


        const bendX =
            start.x +
            direction *
            this.minimumStraight;


        /*
         * The bend cannot pass the destination.
         */
        if(
            direction > 0 &&
            bendX > end.x
        )
        {
            return null;
        }


        if(
            direction < 0 &&
            bendX < end.x
        )
        {
            return null;
        }


        /*
         * The final vertical run must also be long enough.
         *
         * If end.y === start.y this is not actually an L and
         * the straight route handles it.
         */
        if(start.y !== end.y)
        {
            if(
                Math.abs(
                    end.y -
                    start.y
                ) < this.minimumStraight
            )
            {
                return null;
            }
        }


        /*
         * The horizontal run from the bend to the destination
         * does not itself represent the final run into the room;
         * the destination room is already adjacent to endPoint.
         *
         * We still require the bend to be separated from the
         * destination horizontally when there is a horizontal
         * final run.
         */
        if(
            Math.abs(
                end.x -
                bendX
            ) < this.minimumStraight &&
            end.x !== bendX
        )
        {
            return null;
        }


        return this.simplifyRoute([
            {
                x1: start.x,
                y1: start.y,
                x2: bendX,
                y2: start.y
            },

            {
                x1: bendX,
                y1: start.y,
                x2: bendX,
                y2: end.y
            },

            {
                x1: bendX,
                y1: end.y,
                x2: end.x,
                y2: end.y
            }
        ]);
    }


    makeVerticalFirstRoute(start,end)
    {
        if(start.y === end.y)
            return null;


        const direction =
            end.y > start.y
                ? 1
                : -1;


        const bendY =
            start.y +
            direction *
            this.minimumStraight;


        if(
            direction > 0 &&
            bendY > end.y
        )
        {
            return null;
        }


        if(
            direction < 0 &&
            bendY < end.y
        )
        {
            return null;
        }


        if(start.x !== end.x)
        {
            if(
                Math.abs(
                    end.x -
                    start.x
                ) < this.minimumStraight
            )
            {
                return null;
            }
        }


        if(
            Math.abs(
                end.y -
                bendY
            ) < this.minimumStraight &&
            end.y !== bendY
        )
        {
            return null;
        }


        return this.simplifyRoute([
            {
                x1: start.x,
                y1: start.y,
                x2: start.x,
                y2: bendY
            },

            {
                x1: start.x,
                y1: bendY,
                x2: end.x,
                y2: bendY
            },

            {
                x1: end.x,
                y1: bendY,
                x2: end.x,
                y2: end.y
            }
        ]);
    }


    /*
     * ============================================================
     * DOG LEG
     * ============================================================
     *
     * Example:
     *
     * ROOM
     *   |
     *   | 2
     *   +-------+
     *           |
     *           |
     *           +------ ROOM
     *
     * This gives us two proper bends when one simple L would
     * produce a very short final run.
     */

    makeDogLegHorizontal(start,end)
    {
        const dx =
            end.x -
            start.x;


        if(dx === 0)
            return null;


        const direction =
            dx > 0
                ? 1
                : -1;


        const firstX =
            start.x +
            direction *
            this.minimumStraight;


        const lastX =
            end.x -
            direction *
            this.minimumStraight;


        /*
         * There must be space between the two protected
         * regions.
         */
        if(
            direction > 0 &&
            firstX >= lastX
        )
        {
            return null;
        }


        if(
            direction < 0 &&
            firstX <= lastX
        )
        {
            return null;
        }


        const middleX =
            Math.floor(
                (firstX + lastX) / 2
            );


        return this.simplifyRoute([
            {
                x1: start.x,
                y1: start.y,
                x2: firstX,
                y2: start.y
            },

            {
                x1: firstX,
                y1: start.y,
                x2: middleX,
                y2: end.y
            },

            {
                x1: middleX,
                y1: end.y,
                x2: lastX,
                y2: end.y
            },

            {
                x1: lastX,
                y1: end.y,
                x2: end.x,
                y2: end.y
            }
        ]);
    }


    makeDogLegVertical(start,end)
    {
        const dy =
            end.y -
            start.y;


        if(dy === 0)
            return null;


        const direction =
            dy > 0
                ? 1
                : -1;


        const firstY =
            start.y +
            direction *
            this.minimumStraight;


        const lastY =
            end.y -
            direction *
            this.minimumStraight;


        if(
            direction > 0 &&
            firstY >= lastY
        )
        {
            return null;
        }


        if(
            direction < 0 &&
            firstY <= lastY
        )
        {
            return null;
        }


        const middleY =
            Math.floor(
                (firstY + lastY) / 2
            );


        return this.simplifyRoute([
            {
                x1: start.x,
                y1: start.y,
                x2: start.x,
                y2: firstY
            },

            {
                x1: start.x,
                y1: firstY,
                x2: end.x,
                y2: middleY
            },

            {
                x1: end.x,
                y1: middleY,
                x2: end.x,
                y2: lastY
            },

            {
                x1: end.x,
                y1: lastY,
                x2: end.x,
                y2: end.y
            }
        ]);
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
        if(!route || route.length === 0)
            return false;


        const segments =
            this.simplifyRoute(route);


        if(segments.length === 0)
            return false;


        /*
         * Every segment must be horizontal or vertical.
         */
        for(const segment of segments)
        {
            const horizontal =
                segment.y1 === segment.y2;


            const vertical =
                segment.x1 === segment.x2;


            if(!horizontal && !vertical)
            {
                return false;
            }
        }


        /*
         * Check every bend.
         *
         * BOTH runs touching a bend must be >= 2.
         */
        for(
            let i = 0;
            i < segments.length - 1;
            i++
        )
        {
            const a = segments[i];
            const b = segments[i + 1];


            const aHorizontal =
                a.y1 === a.y2;


            const bHorizontal =
                b.y1 === b.y2;


            /*
             * Same orientation means this isn't a bend.
             */
            if(aHorizontal === bHorizontal)
                continue;


            const lengthA =
                this.segmentLength(a);


            const lengthB =
                this.segmentLength(b);


            if(
                lengthA <
                this.minimumStraight
            )
            {
                return false;
            }


            if(
                lengthB <
                this.minimumStraight
            )
            {
                return false;
            }
        }


        /*
         * The first run must leave the starting room by at
         * least minimumStraight tiles before a bend.
         */
        if(
            segments.length > 1 &&
            this.segmentLength(
                segments[0]
            ) <
            this.minimumStraight
        )
        {
            return false;
        }


        /*
         * The final run must also be long enough before entering
         * the destination room.
         */
        if(
            segments.length > 1 &&
            this.segmentLength(
                segments[
                segments.length - 1
                    ]
            ) <
            this.minimumStraight
        )
        {
            return false;
        }


        /*
         * Expand the complete route to its actual two-tile
         * corridor geometry and validate that geometry.
         */
        const corridorTiles =
            this.buildCorridorTileSet(
                segments
            );


        if(corridorTiles.size === 0)
            return false;


        /*
         * Every corridor tile must be inside the map.
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
         * The corridor may not cut through another room.
         *
         * Existing corridor floor is okay.
         *
         * Existing room floor is only okay if it belongs to
         * the start or destination room opening.
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
                /*
                 * We only expect room floor immediately at the
                 * two ends of the route.
                 *
                 * Since the route starts outside the room, a
                 * room floor in the middle is invalid.
                 */
                if(
                    !this.isNearRouteEnd(
                        point,
                        segments
                    )
                )
                {
                    return false;
                }
            }
        }


        /*
         * Finally make sure that the corridor geometry itself
         * is genuinely two tiles wide everywhere.
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
     * CORRIDOR GEOMETRY
     * ============================================================
     *
     * A horizontal centerline becomes:
     *
     *     ##
     *     ..
     *
     * A vertical centerline becomes:
     *
     *     #.
     *     #.
     *     ..
     *
     * The exact side is kept consistent for the entire segment.
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
                    /*
                     * Width 2.
                     */
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


                    if(x === segment.x2)
                        break;
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


                    if(y === segment.y2)
                        break;
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
        /*
         * Every centerline point must have its two width tiles.
         *
         * If a bend causes one of them to disappear, reject it.
         */
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
                const required =
                    horizontal
                        ? [
                            this.key(
                                point.x,
                                point.y
                            ),
                            this.key(
                                point.x,
                                point.y + 1
                            )
                        ]
                        : [
                            this.key(
                                point.x,
                                point.y
                            ),
                            this.key(
                                point.x + 1,
                                point.y
                            )
                        ];


                for(const key of required)
                {
                    if(!corridorTiles.has(key))
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


                if(x === segment.x2)
                    break;
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


            if(y === segment.y2)
                break;
        }
    }


    carve(grid,x,y)
    {
        if(
            grid.isInside(x,y)
        )
        {
            /*
             * IMPORTANT:
             *
             * Grid.setFloor() already protects the ROOM
             * source, so corridor carving cannot erase the
             * information that a tile belongs to a room.
             */
            grid.setFloor(
                x,
                y,
                "CORRIDOR"
            );
        }
    }


    /*
     * ============================================================
     * ROUTE HELPERS
     * ============================================================
     */

    simplifyRoute(route)
    {
        if(!route)
            return null;


        const result = [];


        for(const segment of route)
        {
            if(
                segment.x1 === segment.x2 &&
                segment.y1 === segment.y2
            )
            {
                continue;
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
                    segment.y1 === segment.y2;


                /*
                 * Merge collinear connected segments.
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


    segmentLength(segment)
    {
        return Math.abs(
                segment.x2 -
                segment.x1
            ) +
            Math.abs(
                segment.y2 -
                segment.y1
            );
    }


    routeLength(route)
    {
        let result = 0;


        for(const segment of route)
        {
            result +=
                this.segmentLength(
                    segment
                );
        }


        return result;
    }


    routeScore(route,start,end)
    {
        /*
         * Strongly prefer fewer bends.
         */
        const bends =
            Math.max(
                0,
                route.length - 1
            );


        /*
         * Main cost is length.
         *
         * Bend penalty prevents ugly dog-legs from winning
         * against a clean L of similar length.
         */
        return this.routeLength(route) +
            bends * 20;
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


                if(x === segment.x2)
                    break;
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


            if(y === segment.y2)
                break;
        }


        return points;
    }


    isNearRouteEnd(point,segments)
    {
        const first =
            segments[0];


        const last =
            segments[
            segments.length - 1
                ];


        const firstDistance =
            Math.min(
                Math.abs(
                    point.x -
                    first.x1
                ),
                Math.abs(
                    point.x -
                    first.x2
                )
            ) +
            Math.min(
                Math.abs(
                    point.y -
                    first.y1
                ),
                Math.abs(
                    point.y -
                    first.y2
                )
            );


        const lastDistance =
            Math.min(
                Math.abs(
                    point.x -
                    last.x1
                ),
                Math.abs(
                    point.x -
                    last.x2
                )
            ) +
            Math.min(
                Math.abs(
                    point.y -
                    last.y1
                ),
                Math.abs(
                    point.y -
                    last.y2
                )
            );


        return (
            firstDistance <= 1 ||
            lastDistance <= 1
        );
    }


    distance(x1,y1,x2,y2)
    {
        return Math.abs(
                x2 - x1
            ) +
            Math.abs(
                y2 - y1
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