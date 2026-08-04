import { generateDungeon }
    from "./actions/generateDungeon.mjs";


tiled.registerAction(
    "generate_dungeon",
    function(action)
    {
        generateDungeon();
    }
);


tiled.extendMenu(
    "File",
    [
        {
            action: "generate_dungeon",
            text: "Generate Dungeon"
        }
    ]
);