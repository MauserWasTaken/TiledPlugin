import {DungeonConfig}
    from "../generator/DungeonConfig.mjs";


export function showDungeonDialog(onGenerate)
{
    const config =
        new DungeonConfig();

    const dialog =
        new Dialog("Dungeon Generator");

    dialog.minimumWidth = 500;


    /*
     * --------------------------------------------------
     * BSP / ROOMS
     * --------------------------------------------------
     */

    dialog.addHeading("BSP / Rooms");


    const minimumPartitionSize =
        dialog.addNumberInput(
            "Minimum partition size:",
            config.minimumPartitionSize
        );

    minimumPartitionSize.minimum = 4;
    minimumPartitionSize.maximum = 100;
    minimumPartitionSize.decimals = 0;
    minimumPartitionSize.singleStep = 1;


    dialog.addNewRow();


    const minimumRoomSize =
        dialog.addNumberInput(
            "Minimum room size:",
            config.minimumRoomSize
        );

    minimumRoomSize.minimum = 4;
    minimumRoomSize.maximum = 50;
    minimumRoomSize.decimals = 0;
    minimumRoomSize.singleStep = 1;


    dialog.addNewRow();


    const roomPadding =
        dialog.addNumberInput(
            "Room padding:",
            config.roomPadding
        );

    roomPadding.minimum = 0;
    roomPadding.maximum = 10;
    roomPadding.decimals = 0;
    roomPadding.singleStep = 1;


    dialog.addNewRow();


    const minimumRoomFill =
        dialog.addNumberInput(
            "Minimum room fill:",
            config.minimumRoomFill
        );

    minimumRoomFill.minimum = 1;
    minimumRoomFill.maximum = 100;
    minimumRoomFill.decimals = 0;
    minimumRoomFill.singleStep = 1;


    dialog.addNewRow();


    const maximumRoomFill =
        dialog.addNumberInput(
            "Maximum room fill:",
            config.maximumRoomFill
        );

    maximumRoomFill.minimum = 1;
    maximumRoomFill.maximum = 100;
    maximumRoomFill.decimals = 0;
    maximumRoomFill.singleStep = 1;


    dialog.addNewRow();


    const maximumRoomAspectRatio =
        dialog.addNumberInput(
            "Maximum room aspect ratio:",
            config.maximumRoomAspectRatio
        );

    maximumRoomAspectRatio.minimum = 1.0;
    maximumRoomAspectRatio.maximum = 5.0;
    maximumRoomAspectRatio.decimals = 2;
    maximumRoomAspectRatio.singleStep = 0.1;


    /*
     * --------------------------------------------------
     * ROOM SHAPES
     * --------------------------------------------------
     */

    dialog.addSeparator("Room Shapes");


    const rectangleChance =
        dialog.addNumberInput(
            "Rectangle:",
            config.rectangleChance
        );

    rectangleChance.minimum = 0;
    rectangleChance.maximum = 100;
    rectangleChance.decimals = 0;
    rectangleChance.singleStep = 1;


    dialog.addNewRow();


    const circleChance =
        dialog.addNumberInput(
            "Circle:",
            config.circleChance
        );

    circleChance.minimum = 0;
    circleChance.maximum = 100;
    circleChance.decimals = 0;
    circleChance.singleStep = 1;


    dialog.addNewRow();


    const crossChance =
        dialog.addNumberInput(
            "Cross:",
            config.crossChance
        );

    crossChance.minimum = 0;
    crossChance.maximum = 100;
    crossChance.decimals = 0;
    crossChance.singleStep = 1;


    dialog.addNewRow();


    const shapeTotalLabel =
        dialog.addLabel(
            "Total: 100%"
        );


    /*
     * --------------------------------------------------
     * CORRIDORS
     * --------------------------------------------------
     */

    dialog.addSeparator("Corridors");


    const corridorWidth =
        dialog.addNumberInput(
            "Corridor width:",
            config.corridorWidth
        );

    corridorWidth.minimum = 1;
    corridorWidth.maximum = 10;
    corridorWidth.decimals = 0;
    corridorWidth.singleStep = 1;


    /*
     * --------------------------------------------------
     * ROOM TYPES
     * --------------------------------------------------
     */

    dialog.addSeparator("Room Types");


    const treasureChance =
        dialog.addNumberInput(
            "Treasure chance:",
            config.treasureChance
        );

    treasureChance.minimum = 0;
    treasureChance.maximum = 100;
    treasureChance.decimals = 0;
    treasureChance.singleStep = 1;


    dialog.addNewRow();


    const blacksmithChance =
        dialog.addNumberInput(
            "Blacksmith chance:",
            config.blacksmithChance
        );

    blacksmithChance.minimum = 0;
    blacksmithChance.maximum = 100;
    blacksmithChance.decimals = 0;
    blacksmithChance.singleStep = 1;


    /*
     * --------------------------------------------------
     * WALL DECORATIONS
     * --------------------------------------------------
     */

    dialog.addSeparator("Wall Decorations");


    const wallDecorationChance =
        dialog.addNumberInput(
            "Decoration chance:",
            config.wallDecorationChance
        );

    wallDecorationChance.minimum = 0;
    wallDecorationChance.maximum = 100;
    wallDecorationChance.decimals = 0;
    wallDecorationChance.singleStep = 1;


    /*
     * --------------------------------------------------
     * GENERATION
     * --------------------------------------------------
     */

    dialog.addSeparator("Generation");


    const seed =
        dialog.addNumberInput(
            "Seed:",
            config.seed
        );

    seed.minimum = 0;
    seed.maximum = 2147483647;
    seed.decimals = 0;
    seed.singleStep = 1;


    /*
     * --------------------------------------------------
     * VALIDATION
     * --------------------------------------------------
     */

    dialog.addNewRow();


    const validationLabel =
        dialog.addLabel("");


    function validate()
    {
        const shapeTotal =
            rectangleChance.value +
            circleChance.value +
            crossChance.value;


        if(shapeTotal !== 100)
        {
            shapeTotalLabel.text =
                "Total: " +
                shapeTotal +
                "% (must be 100%)";

            validationLabel.text =
                "Room shape percentages must add up to 100%.";

            return false;
        }


        shapeTotalLabel.text =
            "Total: 100%";


        if(
            minimumRoomFill.value >
            maximumRoomFill.value
        )
        {
            validationLabel.text =
                "Minimum room fill cannot exceed maximum room fill.";

            return false;
        }


        if(
            minimumPartitionSize.value <=
            minimumRoomSize.value
        )
        {
            validationLabel.text =
                "Minimum partition size must be larger than minimum room size.";

            return false;
        }


        if(
            treasureChance.value +
            blacksmithChance.value >
            100
        )
        {
            validationLabel.text =
                "Treasure and blacksmith chances cannot exceed 100% combined.";

            return false;
        }


        validationLabel.text = "";

        return true;
    }


    /*
     * --------------------------------------------------
     * LIVE VALIDATION
     * --------------------------------------------------
     */

    rectangleChance.valueChanged.connect(
        validate
    );

    circleChance.valueChanged.connect(
        validate
    );

    crossChance.valueChanged.connect(
        validate
    );

    minimumRoomFill.valueChanged.connect(
        validate
    );

    maximumRoomFill.valueChanged.connect(
        validate
    );

    minimumPartitionSize.valueChanged.connect(
        validate
    );

    minimumRoomSize.valueChanged.connect(
        validate
    );

    treasureChance.valueChanged.connect(
        validate
    );

    blacksmithChance.valueChanged.connect(
        validate
    );


    /*
     * --------------------------------------------------
     * BUTTONS
     * --------------------------------------------------
     */

    dialog.addNewRow();


    const generateButton =
        dialog.addButton(
            "Generate"
        );

    const cancelButton =
        dialog.addButton(
            "Cancel"
        );


    generateButton.clicked.connect(
        function()
        {
            if(!validate())
                return;


            config.minimumPartitionSize =
                minimumPartitionSize.value;

            config.minimumRoomSize =
                minimumRoomSize.value;

            config.roomPadding =
                roomPadding.value;

            config.minimumRoomFill =
                minimumRoomFill.value;

            config.maximumRoomFill =
                maximumRoomFill.value;

            config.maximumRoomAspectRatio =
                maximumRoomAspectRatio.value;

            config.rectangleChance =
                rectangleChance.value;

            config.circleChance =
                circleChance.value;

            config.crossChance =
                crossChance.value;

            config.corridorWidth =
                corridorWidth.value;

            config.treasureChance =
                treasureChance.value;

            config.blacksmithChance =
                blacksmithChance.value;

            config.wallDecorationChance =
                wallDecorationChance.value;

            config.seed =
                seed.value;


            onGenerate(config);

            dialog.accept();
        }
    );


    cancelButton.clicked.connect(
        function()
        {
            dialog.reject();
        }
    );


    /*
     * --------------------------------------------------
     * INITIAL VALIDATION
     * --------------------------------------------------
     */

    validate();


    /*
     * --------------------------------------------------
     * SHOW
     * --------------------------------------------------
     */

    dialog.show();
}