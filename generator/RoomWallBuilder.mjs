export class RoomWallBuilder {


    generate(grid)
    {
        let floors = [];


        for(let y=0;y<grid.height;y++)
        {
            for(let x=0;x<grid.width;x++)
            {
                if(grid.isFloor(x,y))
                {
                    floors.push([x,y]);
                }
            }
        }


        for(let [x,y] of floors)
        {
            this.makeWall(grid,x+1,y);
            this.makeWall(grid,x-1,y);
            this.makeWall(grid,x,y+1);
            this.makeWall(grid,x,y-1);
        }
    }



    makeWall(grid,x,y)
    {
        if(grid.isInside(x,y) && !grid.isFloor(x,y))
        {
            grid.setWall(x,y);
        }
    }
}