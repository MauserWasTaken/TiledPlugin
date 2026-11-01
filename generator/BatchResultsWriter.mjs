export function saveBatchResults(results)
{
    const filePath =
        tiled.promptSaveFile(
            "",
            "CSV files (*.csv)",
            "Save Batch Evaluation Results"
        );

    if(!filePath)
    {
        tiled.log(
            "[BATCH] Export cancelled."
        );

        return;
    }

    const file =
        new TextFile(
            filePath,
            TextFile.WriteOnly
        );

    const headers = [
        "seed",
        "mapWidth",
        "mapHeight",
        "success",
        "roomCount",
        "rectangleRooms",
        "circleRooms",
        "crossRooms",
        "corridorCount",
        "averageCorridorLength",
        "floorTileCount",
        "floorPercentage",
        "generationTime",
        "connectedFloorComponents",
        "isConnected",
        "geometryValid",
        "errorMessage"
    ];

    file.writeLine(headers.join(","));

    for(const stats of results)
    {
        const values = [
            stats.seed,
            stats.mapWidth,
            stats.mapHeight,
            stats.success,
            stats.roomCount,
            stats.rectangleRooms,
            stats.circleRooms,
            stats.crossRooms,
            stats.corridorCount,
            stats.averageCorridorLength,
            stats.floorTileCount,
            stats.floorPercentage,
            stats.generationTime,
            stats.connectedFloorComponents,
            stats.isConnected,
            stats.geometryValid,
            stats.errorMessage
        ];

        const row = values.map(value =>
        {
            if(value === undefined || value === null)
                return "";

            const text = String(value);

            return '"' +
                text.replace(/"/g, '""') +
                '"';
        });

        file.writeLine(row.join(","));
    }

    file.commit();

    tiled.log(
        "[BATCH] Results saved to: " +
        filePath
    );

    tiled.alert(
        "Batch evaluation completed.\n\n" +
        results.length +
        " runs exported successfully."
    );
}