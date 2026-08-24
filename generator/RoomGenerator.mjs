export class RoomGenerator {


    constructor(grid)
    {
        this.grid = grid;
    }


    carveRoom(room)
    {
        switch(room.shape)
        {
            case "RECTANGLE":
                this.carveRectangle(room);
                break;


            case "CIRCLE":
                this.carveCircle(room);
                break;


            case "CROSS":
                this.carveCross(room);
                break;


            default:
                this.carveRectangle(room);
        }
    }



    carveRectangle(room)
    {
        for(
            let y = room.y;
            y < room.y + room.height;
            y++
        )
        {
            for(
                let x = room.x;
                x < room.x + room.width;
                x++
            )
            {
                this.carve(x,y);
            }
        }
    }



    carveCircle(room)
    {
        const centerX =
            (room.x + room.right) / 2;


        const centerY =
            (room.y + room.top) / 2;


        const radiusX =
            Math.max(
                2,
                (room.width - 2) / 2
            );


        const radiusY =
            Math.max(
                2,
                (room.height - 2) / 2
            );


        /*
         * First create the normal ellipse.
         */

        const floor = new Set();


        for(
            let y = room.y + 1;
            y < room.top;
            y++
        )
        {
            for(
                let x = room.x + 1;
                x < room.right;
                x++
            )
            {
                const dx =
                    (x - centerX) /
                    radiusX;


                const dy =
                    (y - centerY) /
                    radiusY;


                if(
                    dx * dx +
                    dy * dy <= 1.0
                )
                {
                    floor.add(
                        `${x},${y}`
                    );
                }
            }
        }


        /*
         * ---------------------------------------------------------
         * Remove isolated one-tile protrusions.
         * ---------------------------------------------------------
         *
         * A tile is suspicious if it sticks out from the room
         * without having a second supporting tile beside it.
         */

        const remove = [];


        for(const key of floor)
        {
            const [x,y] =
                key
                    .split(",")
                    .map(Number);


            const left =
                floor.has(
                    `${x - 1},${y}`
                );


            const right =
                floor.has(
                    `${x + 1},${y}`
                );


            const up =
                floor.has(
                    `${x},${y - 1}`
                );


            const down =
                floor.has(
                    `${x},${y + 1}`
                );


            /*
             * A tile with no horizontal support and no vertical
             * support is isolated.
             */

            if(
                !left &&
                !right &&
                !up &&
                !down
            )
            {
                remove.push(key);
            }
        }


        for(const key of remove)
        {
            floor.delete(key);
        }


        /*
         * ---------------------------------------------------------
         * Apply the room.
         * ---------------------------------------------------------
         */

        for(const key of floor)
        {
            const [x,y] =
                key
                    .split(",")
                    .map(Number);


            this.carve(
                x,
                y
            );
        }
    }




    carveCross(room)
    {
        const centerX =
            Math.floor(
                room.x +
                room.width / 2
            );

        const centerY =
            Math.floor(
                room.y +
                room.height / 2
            );


        /*
         * The cross is built from:
         *
         * 1. A central rectangular body.
         * 2. A two-tile-wide horizontal arm.
         * 3. A two-tile-wide vertical arm.
         *
         * This guarantees that an arm can never be
         * only one tile thick.
         */


        const bodyWidth =
            Math.max(
                4,
                Math.floor(
                    room.width * 0.5
                )
            );


        const bodyHeight =
            Math.max(
                4,
                Math.floor(
                    room.height * 0.5
                )
            );


        const bodyX =
            centerX -
            Math.floor(bodyWidth / 2);


        const bodyY =
            centerY -
            Math.floor(bodyHeight / 2);


        /*
         * ---------------------------------------------------------
         * Central body
         * ---------------------------------------------------------
         */

        for(
            let y = bodyY;
            y < bodyY + bodyHeight;
            y++
        )
        {
            for(
                let x = bodyX;
                x < bodyX + bodyWidth;
                x++
            )
            {
                this.carve(
                    x,
                    y
                );
            }
        }


        /*
         * ---------------------------------------------------------
         * Horizontal arm
         * ---------------------------------------------------------
         *
         * Two tiles high.
         */

        const horizontalWidth =
            room.width -
            2;


        const horizontalStartX =
            room.x + 1;


        const horizontalStartY =
            centerY -
            1;


        for(
            let y = horizontalStartY;
            y < horizontalStartY + 2;
            y++
        )
        {
            for(
                let x = horizontalStartX;
                x < horizontalStartX + horizontalWidth;
                x++
            )
            {
                this.carve(
                    x,
                    y
                );
            }
        }


        /*
         * ---------------------------------------------------------
         * Vertical arm
         * ---------------------------------------------------------
         *
         * Two tiles wide.
         */

        const verticalHeight =
            room.height -
            2;


        const verticalStartX =
            centerX -
            1;


        const verticalStartY =
            room.y + 1;


        for(
            let y = verticalStartY;
            y < verticalStartY + verticalHeight;
            y++
        )
        {
            for(
                let x = verticalStartX;
                x < verticalStartX + 2;
                x++
            )
            {
                this.carve(
                    x,
                    y
                );
            }
        }
    }



    carve(x,y)
    {
        this.grid.setFloor(x,y,"ROOM");
    }
}