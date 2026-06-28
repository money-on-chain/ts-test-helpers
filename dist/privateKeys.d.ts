import type { Hex } from "viem";
export declare const seedPhrase = "test test test test test test test test test test test junk";
export declare const BACKGROUND_SERVICE_ACCOUNT_INDEX = 1;
/**
 * Hardhat's default accounts are derived from the standard test mnemonic.
 * This returns the private keys in the same derivation order:
 *
 * m/44'/60'/0'/0/0
 * m/44'/60'/0'/0/1
 * ...
 */
export declare function privateKeys(): Hex[];
export declare function privateKeyAt(index: number): Hex;
//# sourceMappingURL=privateKeys.d.ts.map