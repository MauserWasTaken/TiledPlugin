import {generateDungeon}
    from "./actions/generateDungeon.mjs";

import {showDungeonDialog}
    from "./ui/DungeonDialog.mjs";

import { runBatchEvaluation }
    from "./generator/BatchEvaluator.mjs";

import { saveBatchResults }
    from "./generator/BatchResultsWriter.mjs";


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

const batchEvaluationAction =
    tiled.registerAction(
        "batch_evaluate_dungeon",
        function()
        {
            if(!tiled.activeAsset ||
                !tiled.activeAsset.isTileMap)
            {
                tiled.alert(
                    "Open a tile map first."
                );

                return;
            }

            const map = tiled.activeAsset;

            showDungeonDialog(
                function(config)
                {
                    const results =
                        runBatchEvaluation(
                            config,
                            map.width,
                            map.height,
                            100
                        );

                    saveBatchResults(results);
                }
            );
        }
    );

batchEvaluationAction.text =
    "Batch Evaluate Dungeon";

tiled.extendMenu(
    "File",
    [
        { action: "generate_dungeon" },
        { action: "batch_evaluate_dungeon" }
    ]
);