import { NeuralNetworkState } from "../types";

export const INPUT_LABELS = [
  "Dist to Resource",
  "Angle to Resource",
  "Dist to Neighbor",
  "Energy Level",
  "Belief Level",
  "Ambient Light",
];

export const OUTPUT_LABELS = [
  "Steer (L / R)",
  "Speed Throttle",
  "Harvest Effort",
];

/**
 * Creates a new random neural network for an agent
 */
export function createNeuralNetwork(): NeuralNetworkState {
  const inputSize = INPUT_LABELS.length; // 6
  const hiddenSize = 6;
  const outputSize = OUTPUT_LABELS.length; // 3

  // Xavier / He initialization
  const hiddenWeights: number[][] = [];
  const hiddenBiases: number[] = [];
  for (let i = 0; i < hiddenSize; i++) {
    hiddenWeights[i] = [];
    for (let j = 0; j < inputSize; j++) {
      hiddenWeights[i][j] = (Math.random() - 0.5) * 2;
    }
    hiddenBiases[i] = (Math.random() - 0.5) * 0.5;
  }

  const outputWeights: number[][] = [];
  const outputBiases: number[] = [];
  for (let i = 0; i < outputSize; i++) {
    outputWeights[i] = [];
    for (let j = 0; j < hiddenSize; j++) {
      outputWeights[i][j] = (Math.random() - 0.5) * 2;
    }
    outputBiases[i] = (Math.random() - 0.5) * 0.5;
  }

  return {
    inputSize,
    hiddenSize,
    outputSize,
    inputActivations: new Array(inputSize).fill(0),
    hiddenLayer: {
      weights: hiddenWeights,
      biases: hiddenBiases,
      activations: new Array(hiddenSize).fill(0),
    },
    outputLayer: {
      weights: outputWeights,
      biases: outputBiases,
      activations: new Array(outputSize).fill(0),
    },
    inputLabels: INPUT_LABELS,
    outputLabels: OUTPUT_LABELS,
  };
}

/**
 * Forward pass through the neural network
 * Inputs array normalized between 0 and 1 or -1 and 1
 * Returns output activations [steer, speed, effort]
 */
export function forwardNeuralNetwork(
  nn: NeuralNetworkState,
  inputs: number[]
): number[] {
  nn.inputActivations = [...inputs];

  // Hidden layer with ReLU activation
  const hiddenActivations: number[] = [];
  for (let i = 0; i < nn.hiddenSize; i++) {
    let sum = nn.hiddenLayer.biases[i];
    for (let j = 0; j < nn.inputSize; j++) {
      sum += inputs[j] * nn.hiddenLayer.weights[i][j];
    }
    // ReLU activation: max(0, sum)
    hiddenActivations[i] = Math.max(0, sum);
  }
  nn.hiddenLayer.activations = hiddenActivations;

  // Output layer with Tanh (for steer -1 to 1) and Sigmoid (for speed/effort 0 to 1)
  const outputActivations: number[] = [];
  for (let i = 0; i < nn.outputSize; i++) {
    let sum = nn.outputLayer.biases[i];
    for (let j = 0; j < nn.hiddenSize; j++) {
      sum += hiddenActivations[j] * nn.outputLayer.weights[i][j];
    }

    if (i === 0) {
      // Steer angle delta (-1 to 1) -> Tanh
      outputActivations[i] = Math.tanh(sum);
    } else {
      // Speed / Harvest Effort (0 to 1) -> Sigmoid
      outputActivations[i] = 1 / (1 + Math.exp(-sum));
    }
  }
  nn.outputLayer.activations = outputActivations;

  return outputActivations;
}

/**
 * Mutates neural network weights slightly for evolutionary variation
 */
export function mutateNeuralNetwork(
  nn: NeuralNetworkState,
  mutationRate: number = 0.1,
  mutationAmount: number = 0.2
): NeuralNetworkState {
  const newNN = createNeuralNetwork();

  // Copy & mutate hidden
  for (let i = 0; i < nn.hiddenSize; i++) {
    for (let j = 0; j < nn.inputSize; j++) {
      let w = nn.hiddenLayer.weights[i][j];
      if (Math.random() < mutationRate) {
        w += (Math.random() - 0.5) * mutationAmount;
      }
      newNN.hiddenLayer.weights[i][j] = Math.max(-3, Math.min(3, w));
    }
    let b = nn.hiddenLayer.biases[i];
    if (Math.random() < mutationRate) {
      b += (Math.random() - 0.5) * mutationAmount;
    }
    newNN.hiddenLayer.biases[i] = b;
  }

  // Copy & mutate output
  for (let i = 0; i < nn.outputSize; i++) {
    for (let j = 0; j < nn.hiddenSize; j++) {
      let w = nn.outputLayer.weights[i][j];
      if (Math.random() < mutationRate) {
        w += (Math.random() - 0.5) * mutationAmount;
      }
      newNN.outputLayer.weights[i][j] = Math.max(-3, Math.min(3, w));
    }
    let b = nn.outputLayer.biases[i];
    if (Math.random() < mutationRate) {
      b += (Math.random() - 0.5) * mutationAmount;
    }
    newNN.outputLayer.biases[i] = b;
  }

  return newNN;
}
