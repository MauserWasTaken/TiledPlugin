import { TileWriter } from "../generator/TileWriter.mjs";
import { Grid } from "../generator/Grid.mjs";
import { WallVariantGenerator } from "../generator/WallVariantGenerator.mjs";
import { BrickGenerator } from "../generator/BrickGenerator.mjs";
import { RoomWallBuilder } from "../generator/RoomWallBuilder.mjs";
import { BSPGenerator } from "../generator/BSPGenerator.mjs";
import { WallGeometryNormalizer } from "../generator/WallGeometryNormalizer.mjs";
import { DetailGenerator } from "../generator/DetailGenerator.mjs";
import { DungeonConfig } from "../generator/DungeonConfig.mjs";


function getOrCreateDetailLayer(map, dungeonLayer)
{
    let detailLayer = null;

    for(const layer of map.layers)
    {
        if(layer.name === "Details")
        {
            detailLayer = layer;
            break;
        }
    }


    if(!detailLayer)
    {
        detailLayer = new TileLayer();

        detailLayer.name = "Details";

        map.addLayer(
            detailLayer
        );

        tiled.log(
            "[DUNGEON] Created Details layer."
        );
    }


    /*
     * Make sure Details is above the dungeon layer.
     */
    const dungeonIndex =
        map.layers.indexOf(
            dungeonLayer
        );

    const detailIndex =
        map.layers.indexOf(
            detailLayer
        );

    if(detailIndex < dungeonIndex)
    {
        map.removeLayer(
            detailLayer
        );

        map.insertLayer(
            dungeonIndex + 1,
            detailLayer
        );
    }


    return detailLayer;
}


export function generateDungeon(config)
{
    let map = tiled.activeAsset;

    let dungeonLayer =
        map.layers[0];


    let detailLayer =
        getOrCreateDetailLayer(
            map,
            dungeonLayer
        );


    let tileset =
        map.tilesets[0];


    let floorTile =
        tileset.tiles[48];


    /*
     * Separate writers:
     *
     * dungeonWriter -> floor + walls
     * detailWriter  -> details only
     */
    let dungeonWriter =
        new TileWriter(
            dungeonLayer
        );


    let detailWriter =
        new TileWriter(
            detailLayer
        );

    dungeonWriter.clear();
    detailWriter.clear();

    /*
     * Logical dungeon grid
     */
    let grid =
        new Grid(
            map.width,
            map.height
        );


    /*
     * Generate BSP dungeon
     */
    const bsp =
        new BSPGenerator(config);


    const result =
        bsp.generate(
            grid
        );


    bsp.connectRooms(
        result.root,
        grid
    );


    tiled.log(
        "[DEBUG] FLOOR MAP BEFORE NORMALIZER"
    );


    for(let y = 0; y < grid.height; y++)
    {
        let row = "";

        for(let x = 0; x < grid.width; x++)
        {
            row +=
                grid.isFloor(x,y)
                    ? "."
                    : "#";
        }

        tiled.log(row);
    }


    /*
     * Normalize wall geometry
     */
    const normalizer =
        new WallGeometryNormalizer();


    const normalized =
        normalizer.generate(
            grid
        );


    if(!normalized)
    {
        tiled.log(
            "[DUNGEON] Wall normalization failed."
        );

        return;
    }


    /*
     * Validate final geometry
     */
    const invalid =
        normalizer.findInvalidGeometry(
            grid
        );


    if(invalid.length !== 0)
    {
        tiled.log(
            "[DUNGEON] FINAL WALL VALIDATION FAILED."
        );

        normalizer.logInvalidGeometry(
            invalid
        );

        return;
    }


    /*
     * Build walls
     */
    let wallBuilder =
        new RoomWallBuilder();


    wallBuilder.generate(
        grid
    );


    /*
     * Generate wall variants
     */
    let wallGenerator =
        new WallVariantGenerator();


    wallGenerator.generate(
        grid
    );


    /*
     * Generate bricks
     */
    let brickGenerator =
        new BrickGenerator(
            config
        );


    brickGenerator.generate(
        grid
    );


    /*
     * Generate details
     */
    const detailGenerator =
        new DetailGenerator();


    detailGenerator.generate(
        grid,
        result.rooms
    );


    /*
     * Write dungeon and details
     * to separate layers.
     */
    for(let y = 0; y < grid.height; y++)
    {
        for(let x = 0; x < grid.width; x++)
        {
            /*
             * DUNGEON LAYER
             *
             * Always write floor/wall here.
             */
            if(grid.isFloor(x,y))
            {
                dungeonWriter.setTile(
                    x,
                    y,
                    floorTile
                );
            }
            else
            {
                const variant =
                    grid.getWallVariant(
                        x,
                        y
                    );

                dungeonWriter.setTile(
                    x,
                    y,
                    tileset.tiles[variant]
                );
            }


            /*
             * DETAILS LAYER
             *
             * Only write something when
             * a detail exists.
             */
            const detail =
                grid.getDetail(
                    x,
                    y
                );


            if(detail !== null)
            {
                detailWriter.setTile(
                    x,
                    y,
                    tileset.tiles[detail]
                );
            }
        }
    }


    /*
     * Apply both layers.
     */
    dungeonWriter.apply();

    detailWriter.apply();
}