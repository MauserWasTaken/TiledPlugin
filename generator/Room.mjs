export class Room {

    constructor(
        id,
        x,
        y,
        width,
        height,
        shape = "RECTANGLE"
    )
    {
        this.id = id;

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.type = "NORMAL";

        this.shape = shape;
    }


    get centerX()
    {
        return this.x + Math.floor(this.width / 2);
    }


    get centerY()
    {
        return this.y + Math.floor(this.height / 2);
    }


    get left()
    {
        return this.x;
    }


    get right()
    {
        return this.x + this.width - 1;
    }


    get bottom()
    {
        return this.y;
    }


    get top()
    {
        return this.y + this.height - 1;
    }


    wallPointTowards(other)
    {
        const dx =
            other.centerX - this.centerX;

        const dy =
            other.centerY - this.centerY;


        if(Math.abs(dx) > Math.abs(dy))
        {
            if(dx > 0)
            {
                return {
                    x: this.right,

                    y: this.randomInt(
                        this.y + 2,
                        this.top - 2
                    ),

                    direction: "RIGHT"
                };
            }


            return {
                x: this.left,

                y: this.randomInt(
                    this.y + 2,
                    this.top - 2
                ),

                direction: "LEFT"
            };
        }


        if(dy > 0)
        {
            return {
                x: this.randomInt(
                    this.x + 2,
                    this.right - 2
                ),

                y: this.top,

                direction: "UP"
            };
        }


        return {
            x: this.randomInt(
                this.x + 2,
                this.right - 2
            ),

            y: this.bottom,

            direction: "DOWN"
        };
    }


    randomInt(min,max)
    {
        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;
    }
}