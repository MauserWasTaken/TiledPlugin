import { BSPNode } from "./BSPNode.mjs";
import { Room } from "./Room.mjs";
import { CorridorGenerator } from "./CorridorGenerator.mjs";
import {RoomGenerator} from "./RoomGenerator.mjs";

export class BSPGenerator
{
    generate(grid)
    {
        const root = new BSPNode(
            0,
            0,
            grid.width,
            grid.height
        );


        this.split(root);


        const rooms = [];


        this.createRooms(
            root,
            rooms,
            grid
        );


        // Assign START, EXIT and TREASURE
        this.assignRoomTypes(
            rooms
        );


        return {
            root,
            rooms
        };
    }


    split(node)
    {
        const minSize = 16;


        if(
            node.width <= minSize ||
            node.height <= minSize
        )
        {
            return;
        }


        const splitHorizontal =
            node.width > node.height
                ? false
                : true;


        if(splitHorizontal)
        {
            const split =
                this.randomInt(
                    Math.floor(node.height / 3),
                    Math.floor(node.height * 2 / 3)
                );


            node.left = new BSPNode(
                node.x,
                node.y,
                node.width,
                split
            );


            node.right = new BSPNode(
                node.x,
                node.y + split,
                node.width,
                node.height - split
            );
        }
        else
        {
            const split =
                this.randomInt(
                    Math.floor(node.width / 3),
                    Math.floor(node.width * 2 / 3)
                );


            node.left = new BSPNode(
                node.x,
                node.y,
                split,
                node.height
            );


            node.right = new BSPNode(
                node.x + split,
                node.y,
                node.width - split,
                node.height
            );
        }


        this.split(node.left);
        this.split(node.right);
    }


    createRooms(node, rooms, grid)
    {
        if(node.isLeaf())
        {
            const padding = 2;
            const minRoomSize = 8;
            const maxAspectRatio = 1.5;


            const maxRoomWidth =
                node.width - padding * 2;


            const maxRoomHeight =
                node.height - padding * 2;


            if(
                maxRoomWidth < minRoomSize ||
                maxRoomHeight < minRoomSize
            )
            {
                return;
            }


            let roomWidth =
                Math.floor(
                    maxRoomWidth *
                    this.randomRange(0.70, 0.95)
                );


            let roomHeight =
                Math.floor(
                    maxRoomHeight *
                    this.randomRange(0.70, 0.95)
                );


            roomWidth =
                Math.max(
                    roomWidth,
                    minRoomSize
                );


            roomHeight =
                Math.max(
                    roomHeight,
                    minRoomSize
                );


            if(roomWidth > roomHeight * maxAspectRatio)
            {
                roomWidth =
                    Math.floor(
                        roomHeight * maxAspectRatio
                    );
            }


            if(roomHeight > roomWidth * maxAspectRatio)
            {
                roomHeight =
                    Math.floor(
                        roomWidth * maxAspectRatio
                    );
            }


            const xOffsetMax =
                node.width - roomWidth;


            const yOffsetMax =
                node.height - roomHeight;


            const roomX =
                node.x +
                (
                    xOffsetMax <= padding
                        ? padding
                        : this.randomInt(
                            padding,
                            xOffsetMax - padding
                        )
                );


            const roomY =
                node.y +
                (
                    yOffsetMax <= padding
                        ? padding
                        : this.randomInt(
                            padding,
                            yOffsetMax - padding
                        )
                );


            let shape;

            const shapeRoll = this.randomInt(0, 99);

            if(shapeRoll <= 60)
            {
                shape = "RECTANGLE";
            }
            else if(shapeRoll <= 80)
            {
                shape = "CIRCLE";
            }
            else
            {
                shape = "CROSS";
            }

            const room = new Room(
                rooms.length,
                roomX,
                roomY,
                roomWidth,
                roomHeight,
                shape
            );


            node.room = room;
            rooms.push(room);

            const generator = new RoomGenerator(grid);
            generator.carveRoom(room);


            return;
        }


        if(node.left)
        {
            this.createRooms(
                node.left,
                rooms,
                grid
            );
        }


        if(node.right)
        {
            this.createRooms(
                node.right,
                rooms,
                grid
            );
        }
    }


    assignRoomTypes(rooms)
    {
        if(rooms.length === 0)
            return;


        // First room = START
        rooms[0].type = "START";


        // Last room = EXIT
        if(rooms.length > 1)
        {
            rooms[rooms.length - 1].type = "EXIT";
        }


        // Middle rooms have a 20% chance
        // of becoming TREASURE rooms
        for(
            let i = 1;
            i < rooms.length - 1;
            i++
        )
        {
            if(Math.random() < 0.2)
            {
                rooms[i].type = "TREASURE";
            }
        }
    }


    randomInt(min, max)
    {
        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;
    }


    randomRange(min, max)
    {
        return Math.random() *
            (max - min) +
            min;
    }


    connectRooms(node, grid)
    {
        if(node.isLeaf())
            return;


        /*
         * First connect the two child subtrees internally.
         */
        if(node.left)
        {
            this.connectRooms(
                node.left,
                grid
            );
        }


        if(node.right)
        {
            this.connectRooms(
                node.right,
                grid
            );
        }


        /*
         * Now connect the two BSP partitions.
         *
         * This is the important BSP property:
         *
         *     left subtree
         *          |
         *          +---- corridor ----+
         *                                 |
         *                           right subtree
         *
         * We do NOT connect arbitrary rooms globally.
         */
        if(
            node.left &&
            node.right
        )
        {
            const roomA =
                this.findConnectionRoom(
                    node.left,
                    node.right
                );


            const roomB =
                this.findConnectionRoom(
                    node.right,
                    node.left
                );


            if(roomA && roomB)
            {
                const corridor =
                    new CorridorGenerator();


                corridor.connect(
                    grid,
                    roomA,
                    roomB,
                    2
                );
            }
        }
    }


    findConnectionRoom(node, otherNode)
    {
        /*
         * Collect all rooms in this BSP subtree.
         */
        const rooms = [];


        this.collectRooms(
            node,
            rooms
        );


        if(rooms.length === 0)
            return null;


        /*
         * Find rooms whose centers are closest to the
         * opposite BSP region.
         *
         * This produces much more sensible BSP corridors
         * than completely random room selection.
         */
        const otherCenter = {
            x:
                otherNode.x +
                Math.floor(
                    otherNode.width / 2
                ),

            y:
                otherNode.y +
                Math.floor(
                    otherNode.height / 2
                )
        };


        rooms.sort(
            (a,b) =>
            {
                const distanceA =
                    Math.abs(
                        a.centerX -
                        otherCenter.x
                    ) +
                    Math.abs(
                        a.centerY -
                        otherCenter.y
                    );


                const distanceB =
                    Math.abs(
                        b.centerX -
                        otherCenter.x
                    ) +
                    Math.abs(
                        b.centerY -
                        otherCenter.y
                    );


                return distanceA -
                    distanceB;
            }
        );


        /*
         * Add a little randomness among the best candidates.
         *
         * This keeps the dungeon from becoming completely
         * deterministic while still respecting BSP structure.
         */
        const candidateCount =
            Math.min(
                3,
                rooms.length
            );


        return rooms[
            Math.floor(
                Math.random() *
                candidateCount
            )
            ];
    }


    collectRooms(node, rooms)
    {
        if(!node)
            return;


        if(node.room)
        {
            rooms.push(
                node.room
            );
        }


        if(node.left)
        {
            this.collectRooms(
                node.left,
                rooms
            );
        }


        if(node.right)
        {
            this.collectRooms(
                node.right,
                rooms
            );
        }
    }
}