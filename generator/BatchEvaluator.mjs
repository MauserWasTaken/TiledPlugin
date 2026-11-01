import { generateDungeonData }
    from "./generateDungeonData.mjs";


export function runBatchEvaluation(
    baseConfig,
    width,
    height,
    runCount
)
{
    const results = [];

    const firstSeed =
        Math.floor(Math.random() * 2147483647);

    for(let i = 0; i < runCount; i++)
    {
        // Copy the configuration.
        const config =
            Object.assign(
                {},
                baseConfig
            );

        config.seed = firstSeed + i;

        const result =
            generateDungeonData(
                config,
                width,
                height
            );

        // Copy the statistics.
        const stats =
            Object.assign(
                {},
                result.stats
            );

        stats.averageCorridorLength =
            result.stats.averageCorridorLength;

        stats.success =
            result.success;

        stats.errorMessage =
            result.errorMessage || "";

        results.push(stats);

        tiled.log(
            "[BATCH] Run " +
            (i + 1) +
            "/" +
            runCount +
            " | Seed: " +
            config.seed +
            " | " +
            (result.success ? "SUCCESS" : "FAILED")
        );
    }

    return results;
}