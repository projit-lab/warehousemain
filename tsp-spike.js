// tsp-spike.js

// Generate start coordinate and 20 random coordinates
const start = { x: 0, y: 0, id: 'start' };
const bins = [];
for (let i = 0; i < 20; i++) {
  bins.push({
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    id: `bin-${i + 1}`
  });
}

// Nearest-Neighbor heuristic using Manhattan distance
function manhattanDistance(p1, p2) {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

function nearestNeighborTSP(startNode, unvisitedNodes) {
  const route = [startNode];
  let totalDistance = 0;
  let currentNode = startNode;
  const remaining = [...unvisitedNodes];

  while (remaining.length > 0) {
    let nearestIdx = -1;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = manhattanDistance(currentNode, remaining[i]);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextNode = remaining.splice(nearestIdx, 1)[0];
    totalDistance += minDistance;
    route.push(nextNode);
    currentNode = nextNode;
  }

  return { route, totalDistance };
}

// Execute and measure time
console.log('Running Nearest-Neighbor TSP...');
console.time('Execution Time');
const result = nearestNeighborTSP(start, bins);
console.timeEnd('Execution Time');

// Print results
console.log('\nFinal Route:');
result.route.forEach((node, index) => {
  console.log(`${index === 0 ? 'Start' : `Step ${index}`.padEnd(7, ' ')}: [${node.x.toString().padStart(2, ' ')}, ${node.y.toString().padStart(2, ' ')}] (${node.id})`);
});
console.log(`\nTotal Manhattan Distance: ${result.totalDistance}`);
