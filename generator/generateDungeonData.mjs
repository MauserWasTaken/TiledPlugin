import { Grid } from "./Grid.mjs";
import { WallGeometryNormalizer } from "./WallGeometryNormalizer.mjs";
import { RoomWallBuilder } from "./RoomWallBuilder.mjs";
import { WallVariantGenerator } from "./WallVariantGenerator.mjs";
import { BrickGenerator } from "./BrickGenerator.mjs";
import { DetailGenerator } from "./DetailGenerator.mjs";
import BSPGenerator from "./BSPGenerator.mjs";

import { SeededRandom } from "./SeededRandom.mjs";
import { GenerationStats } from "./GenerationStats.mjs";
import { DungeonEvaluator } from "./DungeonEvaluator.mjs";


export function generateDungeonData(
    config,
    width,
    height
)
{
    const startTime = Date.now();

    const stats = new GenerationStats();

    stats.seed = config.seed;
    stats.mapWidth = width;
    stats.mapHeight = height;

    try
    {
        const random =
            new SeededRandom(config.seed);

        const grid =
            new Grid(width, height);

        const bsp =
            new BSPGenerator(config, random);

        const result =
            bsp.generate(grid, stats);

        bsp.connectRooms(
            result.root,
            grid,
            stats
        );

        tiled.log(
            "[DEBUG] Seed: " + config.seed
        );

        tiled.log(
            "[DEBUG] Rooms: " + stats.roomCount
        );

        tiled.log(
            "[DEBUG] Corridors: " + stats.corridorCount
        );

        tiled.log(
            "[DEBUG] Corridor length: " +
            stats.totalCorridorLength
        );

        const normalizer =
            new WallGeometryNormalizer();

        const normalized =
            normalizer.generate(grid);

        if(!normalized)
        {
            throw new Error(
                "Wall normalization failed."
            );
        }

        const invalid =
            normalizer.findInvalidGeometry(grid);

        stats.geometryValid =
            invalid.length === 0;

        if(!stats.geometryValid)
        {
            stats.validationErrors =
                invalid;

            throw new Error(
                "Invalid wall geometry."
            );
        }

        const evaluator =
            new DungeonEvaluator();

        evaluator.evaluate(grid, stats);

        const wallBuilder =
            new RoomWallBuilder();

        wallBuilder.generate(grid);

        const wallGenerator =
            new WallVariantGenerator();

        wallGenerator.generate(grid);

        const brickGenerator =
            new BrickGenerator(config, random);

        brickGenerator.generate(grid);

        const detailGenerator =
            new DetailGenerator(random);

        detailGenerator.generate(
            grid,
            result.rooms
        );


        stats.generationTime =
            Date.now() - startTime;

        return {
            success: true,
            grid,
            stats,
            rooms: result.rooms
        };
    }
    catch(error)
    {
        stats.generationTime =
            Date.now() - startTime;

        stats.success = false;
        stats.errorMessage = error.message;

        return {
            success: false,
            grid: null,
            stats,
            error
        };
    }
}