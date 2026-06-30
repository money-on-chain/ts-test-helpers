import assert from "node:assert/strict";
import { getAddress, isAddressEqual } from "viem";
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
export function assertAddressInList(addresses, expected, message) {
    assert(addresses.some((address) => isAddressEqual(address, expected)), message ?? `Address ${expected} not in list ${addresses}`);
}
export function assertAddressNotInList(addresses, expected, message) {
    assert(!addresses.some((address) => isAddressEqual(address, expected)), message ?? `Address ${expected} not in list ${addresses}`);
}
//# sourceMappingURL=assertions.js.map