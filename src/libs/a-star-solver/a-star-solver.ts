type Node = {
  x: number;
  y: number;
  gCost: number;
  hCost: number;
  parent: Node | null;
  walkable: boolean;
};

type PathPoint = {
  x: number;
  y: number;
};

type InputGrid = boolean[][];

export const aStarSolver = (
  inputGrid: InputGrid,
  startPoint: PathPoint,
  endPoint: PathPoint
): PathPoint[] => {
  const grid: Node[][] = inputGrid.map((row, y) =>
    row.map((walkable, x) => ({
      x,
      y,
      walkable,
      gCost: 0,
      hCost: 0,
      parent: null,
    }))
  );
  const openSet: Node[] = [];
  const closedSet: Set<Node> = new Set();

  openSet.push(grid[startPoint.y][startPoint.x]);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.gCost + a.hCost - (b.gCost + b.hCost));

    let currentNode = openSet.shift()!;
    closedSet.add(currentNode);

    if (currentNode.x === endPoint.x && currentNode.y === endPoint.y) {
      const path: PathPoint[] = [];

      while (
        !(currentNode.x === startPoint.x && currentNode.y === startPoint.y)
      ) {
        path.push({ x: currentNode.x, y: currentNode.y });
        currentNode = currentNode.parent!;
      }

      return path.reverse();
    }

    const neighbors: Node[] = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ]
      .map(([dx, dy]) => {
        return grid[currentNode.y + dy]?.[currentNode.x + dx];
      })
      .filter(Boolean) as Node[];

    neighbors.forEach((neighbourNode) => {
      if (!neighbourNode.walkable || closedSet.has(neighbourNode)) {
        return;
      }
      const cost =
        currentNode.gCost + heuristicCostEstimate(currentNode, neighbourNode);
      if (cost < neighbourNode.gCost || !openSet.includes(neighbourNode)) {
        neighbourNode.gCost = cost;
        neighbourNode.hCost = heuristicCostEstimate(neighbourNode, endPoint);
        neighbourNode.parent = currentNode;

        if (!openSet.includes(neighbourNode)) {
          openSet.push(neighbourNode);
        }
      }
    });
  }

  return [];
};

const heuristicCostEstimate = (nodeA: PathPoint, nodeB: PathPoint) => {
  const deltaX = Math.abs(nodeA.x - nodeB.x);
  const deltaY = Math.abs(nodeA.y - nodeB.y);

  if (deltaX > deltaY) {
    return 14 * deltaY + 10 * (deltaX - deltaY);
  }
  return 14 * deltaX + 10 * (deltaY - deltaX);
};
