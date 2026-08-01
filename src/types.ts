/**
 * Types for Layered Society - Agent-Based Simulation Sandbox
 */

export type AgentStatus = "active" | "depleted" | "respawning";

export interface NeuralLayerData {
  weights: number[][]; // weights[neuronIndex][inputIndex]
  biases: number[];
  activations: number[];
}

export interface NeuralNetworkState {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  inputActivations: number[];
  hiddenLayer: NeuralLayerData;
  outputLayer: NeuralLayerData;
  inputLabels: string[];
  outputLabels: string[];
}

export interface ReflectionEntry {
  tick: number;
  thought: string;
  strategy: string;
  isFallback: boolean;
  timestamp: string;
}

export interface AgentMilestone {
  id: string;
  tick: number;
  type: "birth" | "harvest" | "influence" | "disaster" | "depletion" | "respawn" | "reflection" | "sleeper";
  message: string;
  timestamp: string;
}

export interface Agent {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // heading in radians
  speed: number; // current velocity magnitude
  radius: number;
  energy: number;
  maxEnergy: number;
  status: AgentStatus;
  respawnTimer: number; // ticks remaining until respawn
  
  // Layer 1 - Neural Brain
  brain: NeuralNetworkState;

  // Layer 2 - Belief & SPM Engine
  belief: number; // 0.0 (Safe Truth) to 1.0 (Extreme Misinformation/Panic)
  llr: number; // Log-Likelihood Ratio score
  isSleeper: boolean; // Strategic misinformation injector
  isSleeperActivated: boolean; // True if activated to spread partial misinformation
  isImmune: boolean; // SW-MSR protected node

  // Layer 3 - Social Topology & Faction
  factionId: number; // 0: Alpha (Blue), 1: Beta (Purple), 2: Misinformed (Red), etc.
  neighborsCount: number;

  // Layer 4 - Generative Reflection & Memory
  memoryStream: string[];
  biographyLogs: AgentMilestone[];
  lastReflectionTick: number;
  reflections: ReflectionEntry[];
  isReflecting: boolean;

  // Analytics & Color
  resourcesGathered: number;
  lifetimeTicks: number;
  distanceTraveled: number;
  color: string;
  trail?: { x: number; y: number }[];
}

export interface ResourceNode {
  id: number;
  x: number;
  y: number;
  radius: number;
  energyValue: number;
  maxEnergy: number;
  currentEnergy: number;
  active: boolean;
  respawnTimer: number;
}

export interface GraphEdge {
  source: number; // Agent ID
  target: number; // Agent ID
  weight: number; // Connection strength (e.g., proximity or interaction)
}

export interface NetworkTopology {
  fiedlerValue: number; // Algebraic connectivity (spectral graph metric)
  clusteringCoeff: number;
  avgPathLength: number;
  edges: GraphEdge[];
  factionCounts: Record<number, number>;
}

export interface SimulationConfig {
  agentCount: number;
  resourceCount: number;
  simSpeed: number; // 0.1x to 5.0x
  visionRadius: number; // distance in px agents can sense
  showVisionLines: boolean;
  showGraphOverlay: boolean;
  showMotionTrails: boolean;
  heatmapMode: "none" | "energy" | "belief" | "faction" | "sleeper";
  
  // Layer 2 Parameters
  sleeperRatio: number; // 0.0 to 0.5 (percentage of agents that are sleepers)
  swMsrEnabled: boolean; // Strategic SW-MSR Misinformation Defense toggle
  beliefDecay: number; // Natural belief decay back to baseline

  // Layer 0 / Environmental Parameters
  resourceRegenRate: number; // Rate at which depleted resources regenerate
  dayNightSpeed: number; // Day/night cycle speed
  worldWidth: number;
  worldHeight: number;
  randomSeed?: number; // Seed for deterministic PRNG
}

export interface HistoricalMetric {
  tick: number;
  avgEnergy: number;
  avgBelief: number;
  socialCohesion: number;
  activeCount: number;
  depletedCount: number;
  sleeperCount: number;
  fiedlerValue: number;
}

export interface LogEntry {
  id: string;
  tick: number;
  timestamp: string;
  category: "system" | "belief" | "sleeper" | "gemini" | "environment";
  message: string;
}
