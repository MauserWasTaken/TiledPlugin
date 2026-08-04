import { RoomGenerator } from "../generator/RoomGenerator.mjs";
import { TileWriter } from "../generator/TileWriter.mjs";
import { Grid } from "../generator/Grid.mjs";
import { WallVariantGenerator } from "../generator/WallVariantGenerator.mjs";
import { BrickGenerator } from "../generator/BrickGenerator.mjs";


export function generateDungeon()
{
    let map = tiled.activeAsset;

    let layer = map.layers[0];

    let tileset = map.tilesets[0];


    let floorTile =
        tileset.tiles[48];


    let wallTile =
        tileset.tiles[0];



    let writer =
        new TileWriter(layer);



    // Logical dungeon grid
    let grid =
        new Grid(
            map.width,
            map.height
        );



    // Generate rooms
    let roomGenerator =
        new RoomGenerator(
            grid
        );


    let room =
        {
            id:0,
            x:10,
            y:10,
            width:15,
            height:10,
            shape:"RECTANGLE"
        };


    roomGenerator.carveRoom(room);


    let wallGenerator =
        new WallVariantGenerator();


    wallGenerator.generate(
        grid
    );



    let brickGenerator =
        new BrickGenerator();


    brickGenerator.generate(
        grid
    );


    // Convert grid to Tiled tiles
    for(let y = 0; y < grid.height; y++)
    {
        for(let x = 0; x < grid.width; x++)
        {

            if(grid.isFloor(x,y))
            {
                writer.setTile(
                    x,
                    y,
                    floorTile
                );
            }
            else
            {
                let variant =
                    grid.getWallVariant(
                        x,
                        y
                    );


                writer.setTile(
                    x,
                    y,
                    tileset.tiles[variant]
                );
            }
        }
    }



    writer.apply();
}