import assert from 'node:assert/strict';
import { getAddress, isAddressEqual, type Address } from 'viem';

export function bigintCloseTo(actual: bigint, expected: bigint, tolerance: bigint = 0n): boolean {
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
        message ?? `expected ${actual} to be within ${tolerance} of ${expected}; diff=${diff}`,
    );
}

export function assertSameAddress(actual: string, expected: string, message?: string): void {
    assert.equal(
        getAddress(actual),
        getAddress(expected),
        message ?? `expected ${actual} but was ${expected}`,
    );
}

export function assertAddressInList(
    addresses: readonly Address[],
    expected: Address,
    message?: string,
): void {
    assert(
        addresses.some((address) => isAddressEqual(address, expected)),
        message ?? `Address ${expected} not in list ${addresses.join(', ')}`,
    );
}

export function assertAddressNotInList(
    addresses: readonly Address[],
    expected: Address,
    message?: string,
): void {
    assert(
        !addresses.some((address) => isAddressEqual(address, expected)),
        message ?? `Address ${expected} not in list ${addresses.join(', ')}`,
    );
}
