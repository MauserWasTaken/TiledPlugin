import { BSPNode } from "./BSPNode.mjs";
import { Room } from "./Room.mjs";

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
                    this.randomRange(0.70,0.95)
                );

            let roomHeight =
                Math.floor(
                    maxRoomHeight *
                    this.randomRange(0.70,0.95)
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


            const room = new Room(
                rooms.length,
                roomX,
                roomY,
                roomWidth,
                roomHeight
            );

            node.room = room;
            rooms.push(room);

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


    randomInt(min,max)
    {
        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;
    }


    randomRange(min,max)
    {
        return Math.random() *
            (max - min) +
            min;
    }
}