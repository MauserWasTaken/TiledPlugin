export class Room {

    constructor(
        id,
        x,
        y,
        width,
        height
    )
    {
        this.id = id;

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.type = "NORMAL";
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
                return [
                    this.right,
                    Math.floor(
                        this.centerY
                    )
                ];
            }
            else
            {
                return [
                    this.left,
                    Math.floor(
                        this.centerY
                    )
                ];
            }
        }
        else
        {
            if(dy > 0)
            {
                return [
                    Math.floor(
                        this.centerX
                    ),
                    this.top
                ];
            }
            else
            {
                return [
                    Math.floor(
                        this.centerX
                    ),
                    this.bottom
                ];
            }
        }
    }

}