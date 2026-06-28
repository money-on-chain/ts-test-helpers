import assert from "node:assert/strict";
import { getAddress } from "viem";
export function bigintCloseTo(actual, expected, tolerance = 0n) {
    const diff = actual > expected ? actual - expected : expected - actual;
    return diff <= tolerance;
}
export function assertCloseTo(actual, expected, tolerance = 0n, message) {
    const diff = actual > expected ? actual - expected : expected - actual;
    assert.ok(diff <= tolerance, message ??
        `expected ${actual} to be within ${tolerance} of ${expected}; diff=${diff}`);
}
export function assertSameAddress(actual, expected, message) {
    assert.equal(getAddress(actual), getAddress(expected), message ?? `expected ${actual} but was ${expected}`);
}
//# sourceMappingURL=assertions.js.map