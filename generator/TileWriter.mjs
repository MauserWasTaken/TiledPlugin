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


    apply()
    {
        let edit = this.layer.edit();

        for(let op of this.operations)
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