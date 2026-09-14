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

                case "BLACKSMITH":
                    this.generateBlacksmithRoom(
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
            grid.isRoomFloor(
                centerX,
                centerY
            )
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


    placeDetail(grid, room, tile)
    {
        const position =
            this.findRoomPosition(
                grid,
                room
            );

        if(!position)
            return false;

        grid.setDetail(
            position.x,
            position.y,
            tile
        );

        return true;
    }

    randomInt(min, max)
    {
        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;
    }

    generateTreasureRoom(grid, room)
    {
        this.placeDetail(
            grid,
            room,
            DetailTile.CHEST_CLOSED
        );

        const count =
            this.randomInt(1, 2);

        for(let i = 0; i < count; i++)
        {
            this.placeDetail(
                grid,
                room,
                DetailTile.BOX
            );
        }
    }


    generateStartRoom(grid, room)
    {
        this.placeDetail(
            grid,
            room,
            DetailTile.TABLE
        );

        this.placeDetail(
            grid,
            room,
            DetailTile.STOOL
        );
    }

    generateBlacksmithRoom(grid, room)
    {
        this.placeDetail(
            grid,
            room,
            DetailTile.ANVIL
        );

        this.placeDetail(
            grid,
            room,
            DetailTile.TABLE
        );
    }


    generateExitRoom(grid, room)
    {
        const center =
            this.findRoomCenter(
                grid,
                room
            );

        if(!center)
            return;

        grid.setDetail(
            center.x,
            center.y,
            DetailTile.TOMBSTONE_CROSS
        );
    }


    generateNormalRoom(grid, room)
    {
        const roll = Math.random();

        if(roll < 0.20)
        {
            this.placeDetail(
                grid,
                room,
                DetailTile.BARREL
            );
        }
        else if(roll < 0.35)
        {
            this.placeDetail(
                grid,
                room,
                DetailTile.BOX
            );
        }
        else if(roll < 0.45)
        {
            this.placeDetail(
                grid,
                room,
                DetailTile.SACK
            );
        }
    }
}