export function showGenerationStatsDialog(stats)
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


    /*
     * --------------------------------------------------
     * BUTTON
     * --------------------------------------------------
     */

    dialog.addNewRow();

    const okButton =
        dialog.addButton(
            "OK"
        );

    okButton.clicked.connect(
        function()
        {
            dialog.accept();
        }
    );


    dialog.show();
}