export class CorridorGenerator {


    connect(grid,a,b,width)
    {

        const start =
            a.wallPointTowards(b);


        const end =
            b.wallPointTowards(a);



        this.carveOpening(
            grid,
            start[0],
            start[1]
        );


        this.carveOpening(
            grid,
            end[0],
            end[1]
        );


        this.carvePath(
            grid,
            start,
            end,
            width
        );
    }



    carvePath(grid,start,end,width)
    {

        if(Math.random() < 0.5)
        {

            this.carveHorizontal(
                grid,
                start[0],
                end[0],
                start[1],
                width
            );


            this.carveVertical(
                grid,
                start[1],
                end[1],
                end[0],
                width
            );

        }
        else
        {

            this.carveVertical(
                grid,
                start[1],
                end[1],
                start[0],
                width
            );


            this.carveHorizontal(
                grid,
                start[0],
                end[0],
                end[1],
                width
            );
        }
    }



    carveHorizontal(grid,x1,x2,y,width)
    {

        for(
            let x=Math.min(x1,x2);
            x<=Math.max(x1,x2);
            x++
        )
        {

            const half =
                Math.floor(width/2);


            for(
                let offset=-half;
                offset<=half;
                offset++
            )
            {

                grid.setFloor(
                    x,
                    y+offset
                );

            }
        }
    }




    carveVertical(grid,y1,y2,x,width)
    {

        for(
            let y=Math.min(y1,y2);
            y<=Math.max(y1,y2);
            y++
        )
        {

            const half =
                Math.floor(width/2);


            for(
                let offset=-half;
                offset<=half;
                offset++
            )
            {

                grid.setFloor(
                    x+offset,
                    y
                );

            }
        }
    }



    carveOpening(grid,x,y)
    {

        for(let dx=-1;dx<=1;dx++)
        {
            for(let dy=-1;dy<=1;dy++)
            {

                grid.setFloor(
                    x+dx,
                    y+dy
                );

            }
        }
    }
}