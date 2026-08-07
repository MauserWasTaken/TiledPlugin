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
        let centerX = room.centerX;
        let centerY = room.centerY;


        let radius =
            Math.floor(
                Math.min(room.width, room.height) / 2
            ) + 1;


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

                let distance =
                    Math.sqrt(
                        (x-centerX)*(x-centerX) +
                        (y-centerY)*(y-centerY)
                    );


                if(distance <= radius)
                {
                    this.carve(x,y);
                }
            }
        }
    }




    carveCross(room)
    {
        let centerX = room.centerX;
        let centerY = room.centerY;


        for(
            let y = room.y;
            y < room.y + room.height;
            y++
        )
        {
            for(
                let x = room.x;
                x < room.x + room.width;
                x++)
            {

                let horizontal =
                    y >= centerY-2 &&
                    y <= centerY+2;


                let vertical =
                    x >= centerX-2 &&
                    x <= centerX+2;



                if(horizontal || vertical)
                {
                    this.carve(x,y);
                }
            }
        }
    }




    carve(x,y)
    {
        this.grid.setFloor(x,y);
    }
}