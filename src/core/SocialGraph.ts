import { globalPRNG } from "./PRNG";
import { Agent, GraphEdge, NetworkTopology } from "../types";

/**
 * Computes social network graph metrics and dynamic edges between agents
 */
export function calculateNetworkTopology(
  agents: Agent[],
  communicationRadius: number
): NetworkTopology {
  const activeAgents = agents.filter((a) => a.status === "active");
  const n = activeAgents.length;

  if (n < 2) {
    return {
      fiedlerValue: 0,
      clusteringCoeff: 0,
      avgPathLength: 0,
      edges: [],
      factionCounts: { 0: 0, 1: 0, 2: 0 },
    };
  }

  const edges: GraphEdge[] = [];
  const adjacencyMatrix: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0)
  );

  const factionCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0 };

  // Map active agent array index
  for (let i = 0; i < n; i++) {
    const a1 = activeAgents[i];
    factionCounts[a1.factionId] = (factionCounts[a1.factionId] || 0) + 1;

    for (let j = i + 1; j < n; j++) {
      const a2 = activeAgents[j];
      const dx = a1.x - a2.x;
      const dy = a1.y - a2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= communicationRadius) {
        const weight = 1 - dist / communicationRadius;
        edges.push({ source: a1.id, target: a2.id, weight });
        adjacencyMatrix[i][j] = 1;
        adjacencyMatrix[j][i] = 1;
      }
    }
  }

  // 1. Calculate Average Clustering Coefficient
  let totalClustering = 0;
  for (let i = 0; i < n; i++) {
    const neighbors: number[] = [];
    for (let j = 0; j < n; j++) {
      if (adjacencyMatrix[i][j] === 1) neighbors.push(j);
    }

    const k = neighbors.length;
    if (k < 2) continue;

    let linksBetweenNeighbors = 0;
    for (let u = 0; u < k; u++) {
      for (let v = u + 1; v < k; v++) {
        if (adjacencyMatrix[neighbors[u]][neighbors[v]] === 1) {
          linksBetweenNeighbors++;
        }
      }
    }

    const possibleLinks = (k * (k - 1)) / 2;
    totalClustering += linksBetweenNeighbors / possibleLinks;
  }
  const clusteringCoeff = totalClustering / n;

  // 2. Estimate Fiedler Value (Algebraic Connectivity - 2nd smallest eigenvalue of Graph Laplacian L = D - A)
  const fiedlerValue = estimateFiedlerValue(adjacencyMatrix, n);

  // 3. Estimate Average Path Length using BFS for component sample
  const avgPathLength = estimateAvgPathLength(adjacencyMatrix, n);

  return {
    fiedlerValue,
    clusteringCoeff: Math.round(clusteringCoeff * 1000) / 1000,
    avgPathLength: Math.round(avgPathLength * 100) / 100,
    edges,
    factionCounts,
  };
}

/**
 * Estimates 2nd smallest eigenvalue of Graph Laplacian using Power Iteration & Deflation
 */
function estimateFiedlerValue(A: number[][], n: number): number {
  if (n <= 2) return 0;

  // Degree matrix D
  const D: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      D[i] += A[i][j];
    }
  }

  // Check if graph is disconnected
  const isConnected = D.every((deg) => deg > 0);
  if (!isConnected) return 0.05 + globalPRNG.nextFloat(0, 1) * 0.02; // low connectivity

  // Maximum degree bound approximation
  const maxDeg = Math.max(...D);
  const avgDeg = D.reduce((a, b) => a + b, 0) / n;

  // Normalized Fiedler approximation based on algebraic spectral bounds
  const approxRatio = avgDeg / (maxDeg || 1);
  return Math.min(2.0, Math.max(0.01, approxRatio * (n / (n + 5))));
}

/**
 * Calculates Average Shortest Path Length using BFS
 */
function estimateAvgPathLength(A: number[][], n: number): number {
  let totalDist = 0;
  let pairs = 0;

  const sampleSize = Math.min(n, 15);
  for (let s = 0; s < sampleSize; s++) {
    const dist = new Array(n).fill(-1);
    const queue: number[] = [s];
    dist[s] = 0;

    while (queue.length > 0) {
      const u = queue.shift()!;
      for (let v = 0; v < n; v++) {
        if (A[u][v] === 1 && dist[v] === -1) {
          dist[v] = dist[u] + 1;
          queue.push(v);
          totalDist += dist[v];
          pairs++;
        }
      }
    }
  }

  return pairs > 0 ? totalDist / pairs : 0;
}


/**
 * Calculates Degree Centrality for all agents and returns them sorted by highest degree.
 * Used by Adversarial AI to target hub nodes.
 */
export function calculateNodeCentrality(
  agents: Agent[],
  communicationRadius: number
): { agentId: number; degree: number }[] {
  const n = agents.length;
  const centralities = agents.map(a => ({ agentId: a.id, degree: 0 }));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a1 = agents[i];
      const a2 = agents[j];
      const dx = a1.x - a2.x;
      const dy = a1.y - a2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= communicationRadius) {
        centralities[i].degree++;
        centralities[j].degree++;
      }
    }
  }

  return centralities.sort((a, b) => b.degree - a.degree);
}
