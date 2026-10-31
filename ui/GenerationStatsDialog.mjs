export function showGenerationStatsDialog(
    stats,
    config,
    onGenerateAgain
)
{
    const dialog =
        new Dialog("Generation Complete");

    dialog.minimumWidth = 450;


    /*
     * --------------------------------------------------
     * SUMMARY
     * --------------------------------------------------
     */

    dialog.addHeading("Generation Statistics");


    dialog.addLabel(
        "Dungeon generated successfully."
    );


    dialog.addSeparator("Map");


    dialog.addLabel(
        "Size: " +
        stats.mapWidth +
        " × " +
        stats.mapHeight
    );


    dialog.addSeparator("Rooms");


    dialog.addLabel(
        "Total: " +
        stats.roomCount
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Rectangle: " +
        stats.rectangleRooms
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Circle: " +
        stats.circleRooms
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Cross: " +
        stats.crossRooms
    );


    dialog.addSeparator("Room Types");


    dialog.addLabel(
        "Normal: " +
        stats.normalRooms
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Treasure: " +
        stats.treasureRooms
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Blacksmith: " +
        stats.blacksmithRooms
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Start: " +
        stats.startRooms
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Exit: " +
        stats.exitRooms
    );


    dialog.addSeparator("Corridors");


    dialog.addLabel(
        "Total: " +
        stats.corridorCount
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Average length: " +
        stats.averageCorridorLength.toFixed(1) +
        " tiles"
    );


    dialog.addSeparator("Floor");


    dialog.addLabel(
        "Floor tiles: " +
        stats.floorTileCount
    );


    dialog.addSeparator("Generation");


    dialog.addLabel(
        "Seed: " +
        stats.seed
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Generation time: " +
        stats.generationTime +
        " ms"
    );

    dialog.addSeparator("Evaluation");

    dialog.addLabel(
        "Floor coverage: " +
        (stats.floorPercentage ?? 0).toFixed(2) +
        "%"
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Connected floor regions: " +
        (stats.connectedFloorComponents ?? "N/A")
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Connectivity: " +
        (stats.isConnected === undefined
            ? "NOT CHECKED"
            : stats.isConnected ? "PASS" : "FAIL")
    );

    dialog.addNewRow();

    dialog.addLabel(
        "Geometry validation: " +
        (stats.geometryValid === undefined
            ? "NOT CHECKED"
            : stats.geometryValid ? "PASS" : "FAIL")
    );

    /*
     * --------------------------------------------------
     * BUTTONS
     * --------------------------------------------------
     */

    dialog.addNewRow();


    const generateAgainButton =
        dialog.addButton(
            "Generate Again"
        );


    const okButton =
        dialog.addButton(
            "OK"
        );


    /*
     * --------------------------------------------------
     * GENERATE AGAIN
     * --------------------------------------------------
     */

    generateAgainButton.clicked.connect(
        function()
        {
            /*
             * Generate a completely new seed.
             *
             * The rest of the configuration
             * remains unchanged.
             */
            config.seed =
                Math.floor(
                    Math.random() * 2147483648
                );


            /*
             * Close the statistics dialog
             * before starting the next generation.
             */
            dialog.accept();


            /*
             * Start generation with the
             * existing configuration and
             * the new seed.
             */
            onGenerateAgain(
                config
            );
        }
    );


    /*
     * --------------------------------------------------
     * OK
     * --------------------------------------------------
     */

    okButton.clicked.connect(
        function()
        {
            dialog.accept();
        }
    );


    dialog.show();
}