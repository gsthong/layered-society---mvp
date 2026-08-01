/**
 * Simple Linear Congruential Generator (LCG) for seedable pseudo-random number generation.
 * Ensures that experiments and resource placements can be perfectly reproduced.
 */
export class PRNG {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  public setSeed(seed: number) {
    this.seed = seed;
  }

  /**
   * Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive).
   * Formula: X_{n+1} = (a * X_n + c) mod m
   * Using glibc constants: a = 1103515245, c = 12345, m = 2^31
   */
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) % 2147483648;
    return this.seed / 2147483648;
  }

  /**
   * Generates a random float between min (inclusive) and max (exclusive).
   */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

export const globalPRNG = new PRNG(12345);
