export class RoomGenerator
{
    constructor(grid)
    {
        this.grid = grid;
    }


    carveRoom(room)
    {
        /*
         * Choose the shape here rather than relying on the
         * BSP generator to assign one.
         *
         * If a shape was already explicitly assigned, keep it.
         */

        if(
            !room.shape ||
            room.shape === "RANDOM"
        )
        {
            room.shape =
                this.chooseShape(room);
        }


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
                room.shape = "RECTANGLE";

                this.carveRectangle(room);
                break;
        }
    }


    chooseShape(room)
    {
        const minSize =
            Math.min(
                room.width,
                room.height
            );


        const maxSize =
            Math.max(
                room.width,
                room.height
            );


        const aspectRatio =
            maxSize / minSize;


        /*
         * ---------------------------------------------------------
         * Small rooms
         * ---------------------------------------------------------
         *
         * Small rooms don't have enough space for a good circle
         * or cross.
         */

        if(minSize < 7)
        {
            return "RECTANGLE";
        }


        /*
         * ---------------------------------------------------------
         * Very narrow rooms
         * ---------------------------------------------------------
         *
         * A circle/cross in an extremely elongated room tends
         * to produce bad geometry.
         */

        if(aspectRatio > 1.6)
        {
            return "RECTANGLE";
        }


        /*
         * ---------------------------------------------------------
         * Shape probabilities
         * ---------------------------------------------------------
         *
         * 40% rectangle
         * 30% circle
         * 30% cross
         */

        const roll =
            Math.random();


        if(roll < 0.40)
        {
            return "RECTANGLE";
        }


        if(roll < 0.70)
        {
            return "CIRCLE";
        }


        return "CROSS";
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
                this.carve(x, y);
            }
        }
    }


    carveCircle(room)
    {
        const centerX =
            room.x +
            (room.width - 1) / 2;

        const centerY =
            room.y +
            (room.height - 1) / 2;


        /*
         * Leave one tile of margin from the room bounds.
         */

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


        const floor =
            new Set();


        /*
         * ---------------------------------------------------------
         * Create ellipse
         * ---------------------------------------------------------
         */

        for(
            let y = room.y + 1;
            y < room.y + room.height - 1;
            y++
        )
        {
            for(
                let x = room.x + 1;
                x < room.x + room.width - 1;
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
         * Remove isolated cells
         * ---------------------------------------------------------
         */

        const remove = [];


        for(const key of floor)
        {
            const [x, y] =
                key
                    .split(",")
                    .map(Number);


            let neighbours = 0;


            if(
                floor.has(`${x - 1},${y}`)
            )
                neighbours++;


            if(
                floor.has(`${x + 1},${y}`)
            )
                neighbours++;


            if(
                floor.has(`${x},${y - 1}`)
            )
                neighbours++;


            if(
                floor.has(`${x},${y + 1}`)
            )
                neighbours++;


            if(neighbours === 0)
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
         * Apply
         * ---------------------------------------------------------
         */

        for(const key of floor)
        {
            const [x, y] =
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
         * The cross has:
         *
         *       |
         *       |
         *   ----+----
         *       |
         *       |
         *
         * The arms are deliberately wider than corridors.
         */


        const armWidth =
            Math.max(
                3,
                Math.floor(
                    Math.min(
                        room.width,
                        room.height
                    ) / 4
                )
            );


        /*
         * Keep the arm width odd so the cross has a proper
         * central tile.
         */

        const width =
            armWidth % 2 === 0
                ? armWidth + 1
                : armWidth;


        const half =
            Math.floor(
                width / 2
            );


        /*
         * ---------------------------------------------------------
         * Horizontal arm
         * ---------------------------------------------------------
         */

        const horizontalStartX =
            room.x + 1;

        const horizontalEndX =
            room.x +
            room.width -
            2;


        for(
            let y = centerY - half;
            y <= centerY + half;
            y++
        )
        {
            for(
                let x = horizontalStartX;
                x <= horizontalEndX;
                x++
            )
            {
                this.carve(x, y);
            }
        }


        /*
         * ---------------------------------------------------------
         * Vertical arm
         * ---------------------------------------------------------
         */

        const verticalStartY =
            room.y + 1;

        const verticalEndY =
            room.y +
            room.height -
            2;


        for(
            let y = verticalStartY;
            y <= verticalEndY;
            y++
        )
        {
            for(
                let x = centerX - half;
                x <= centerX + half;
                x++
            )
            {
                this.carve(x, y);
            }
        }
    }


    carve(x, y)
    {
        this.grid.setFloor(
            x,
            y,
            "ROOM"
        );
    }
}