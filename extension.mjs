import {generateDungeon}
    from "./actions/generateDungeon.mjs";

import {showDungeonDialog}
    from "./ui/DungeonDialog.mjs";


const generateDungeonAction =
    tiled.registerAction(
        "generate_dungeon",
        function(action)
        {
            if(!tiled.activeAsset)
            {
                tiled.alert(
                    "No map is currently open."
                );

                return;
            }


            if(!tiled.activeAsset.isTileMap)
            {
                tiled.alert(
                    "The active document is not a tile map."
                );

                return;
            }


            showDungeonDialog(
                function(config)
                {
                    generateDungeon(
                        config
                    );
                }
            );
        }
    );


generateDungeonAction.text =
    "Generate Dungeon";


tiled.extendMenu(
    "File",
    [
        {
            action: "generate_dungeon"
        }
    ]
);