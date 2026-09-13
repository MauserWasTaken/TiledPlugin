import { DetailTile } from "./DetailTile.mjs";

export class DetailGenerator
{
    generate(grid, rooms)
    {
        for(const room of rooms)
        {
            switch(room.type)
            {
                case "TREASURE":
                    this.generateTreasureRoom(
                        grid,
                        room
                    );
                    break;

                case "START":
                    this.generateStartRoom(
                        grid,
                        room
                    );
                    break;

                case "EXIT":
                    this.generateExitRoom(
                        grid,
                        room
                    );
                    break;

                case "NORMAL":
                default:
                    this.generateNormalRoom(
                        grid,
                        room
                    );
                    break;
            }
        }
    }

    findRoomCenter(grid, room)
    {
        const centerX = room.centerX;
        const centerY = room.centerY;

        if(
            grid.isRoomFloor(centerX, centerY)
        )
        {
            return {
                x: centerX,
                y: centerY
            };
        }

        return null;
    }

    findRoomPosition(grid, room)
    {
        const candidates = [];

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

                if(grid.isCorridorFloor(x,y))
                    continue;

                if(grid.hasDetail(x,y))
                    continue;

                candidates.push({
                    x,
                    y
                });
            }
        }

        if(candidates.length === 0)
            return null;

        return candidates[
            Math.floor(
                Math.random() *
                candidates.length
            )
            ];
    }

    generateTreasureRoom(grid, room)
    {
        const position =
            this.findRoomPosition(
                grid,
                room
            );

        if(!position)
            return;

        grid.setDetail(
            position.x,
            position.y,
            DetailTile.CHEST_CLOSED
        );
    }


    generateStartRoom(grid, room)
    {
        // Start room logic.
    }


    generateExitRoom(grid, room)
    {
        // Exit room logic.
    }


    generateNormalRoom(grid, room)
    {
        // Normal room logic.
    }
}