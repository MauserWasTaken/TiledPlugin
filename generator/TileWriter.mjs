export class TileWriter {

    constructor(layer)
    {
        this.layer = layer;
        this.operations = [];
    }


    setTile(x, y, tile)
    {
        this.operations.push({
            x:x,
            y:y,
            tile:tile
        });
    }


    clear()
    {
        let edit = this.layer.edit();

        for(
            let y = 0;
            y < this.layer.height;
            y++
        )
        {
            for(
                let x = 0;
                x < this.layer.width;
                x++
            )
            {
                edit.setTile(
                    x,
                    y,
                    null
                );
            }
        }

        edit.apply();
    }


    apply()
    {
        let edit = this.layer.edit();

        for(const op of this.operations)
        {
            edit.setTile(
                op.x,
                op.y,
                op.tile
            );
        }

        edit.apply();
    }
}