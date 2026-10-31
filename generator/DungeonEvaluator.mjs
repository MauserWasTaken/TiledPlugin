export class DungeonEvaluator
{
    evaluate(grid, stats)
    {
        const floorTileCount =
            this.countFloorTiles(grid);

        const totalTileCount =
            grid.width * grid.height;

        stats.floorTileCount =
            floorTileCount;

        stats.floorPercentage =
            totalTileCount > 0
                ? (floorTileCount / totalTileCount) * 100
                : 0;

        const components =
            this.countFloorComponents(grid);

        stats.connectedFloorComponents =
            components;

        stats.isConnected =
            floorTileCount > 0 &&
            components === 1;

        return stats;
    }

    countFloorTiles(grid)
    {
        let count = 0;

        for(let y = 0; y < grid.height; y++)
        {
            for(let x = 0; x < grid.width; x++)
            {
                if(grid.isFloor(x, y))
                {
                    count++;
                }
            }
        }

        return count;
    }

    countFloorComponents(grid)
    {
        const visited =
            Array.from(
                { length: grid.height },
                () => Array(grid.width).fill(false)
            );

        let components = 0;

        const directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ];

        for(let y = 0; y < grid.height; y++)
        {
            for(let x = 0; x < grid.width; x++)
            {
                if(!grid.isFloor(x, y) ||
                    visited[y][x])
                {
                    continue;
                }

                components++;

                const queue = [{ x, y }];
                let head = 0;

                visited[y][x] = true;

                while(head < queue.length)
                {
                    const current = queue[head++];

                    for(const [dx, dy] of directions)
                    {
                        const nx = current.x + dx;
                        const ny = current.y + dy;

                        if(!grid.isInside(nx, ny))
                            continue;

                        if(visited[ny][nx])
                            continue;

                        if(!grid.isFloor(nx, ny))
                            continue;

                        visited[ny][nx] = true;

                        queue.push({
                            x: nx,
                            y: ny
                        });
                    }
                }
            }
        }

        return components;
    }
}