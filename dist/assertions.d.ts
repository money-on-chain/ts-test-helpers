import { Address } from "viem";
export declare function bigintCloseTo(actual: bigint, expected: bigint, tolerance?: bigint): boolean;
export declare function assertCloseTo(actual: bigint, expected: bigint, tolerance?: bigint, message?: string): void;
export declare function assertSameAddress(actual: Address | string, expected: Address | string, message?: string): void;
export declare function assertAddressInList(addresses: readonly Address[], expected: Address, message?: string): void;
export declare function assertAddressNotInList(addresses: readonly Address[], expected: Address, message?: string): void;
//# sourceMappingURL=assertions.d.ts.map