import assert from "node:assert/strict";

export function bigintCloseTo(
  actual: bigint,
  expected: bigint,
  tolerance: bigint = 0n,
): boolean {
  const diff = actual > expected ? actual - expected : expected - actual;

  return diff <= tolerance;
}

export function assertCloseTo(
  actual: bigint,
  expected: bigint,
  tolerance: bigint = 0n,
  message?: string,
): void {
  const diff = actual > expected ? actual - expected : expected - actual;

  assert.ok(
    diff <= tolerance,
    message ??
      `expected ${actual} to be within ${tolerance} of ${expected}; diff=${diff}`,
  );
}
