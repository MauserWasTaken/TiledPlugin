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
            // Other room is to the RIGHT
            if(dx > 0)
            {
                return [
                    this.right,
                    this.randomInt(
                        this.y + 1,
                        this.top - 1
                    )
                ];
            }

            // Other room is to the LEFT
            else
            {
                return [
                    this.left,
                    this.randomInt(
                        this.y + 1,
                        this.top - 1
                    )
                ];
            }
        }

        // Other room is ABOVE
        else if(dy > 0)
        {
            return [
                this.randomInt(
                    this.x + 1,
                    this.right - 1
                ),
                this.top
            ];
        }

        // Other room is BELOW
        else
        {
            return [
                this.randomInt(
                    this.x + 1,
                    this.right - 1
                ),
                this.bottom
            ];
        }
    }


    randomInt(min, max)
    {
        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;
    }
}