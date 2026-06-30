import type { Hex } from 'viem';
import { bytesToHex } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';

export const seedPhrase = 'test test test test test test test test test test test junk';

export const BACKGROUND_SERVICE_ACCOUNT_INDEX = 1;

/**
 * Hardhat's default accounts are derived from the standard test mnemonic.
 * This returns the private keys in the same derivation order:
 *
 * m/44'/60'/0'/0/0
 * m/44'/60'/0'/0/1
 * ...
 */
export function privateKeys(): Hex[] {
    return Array.from({ length: 20 }, (_, i) => {
        const account = mnemonicToAccount(seedPhrase, {
            path: `m/44'/60'/0'/0/${i}`,
        });

        const privateKey = account.getHdKey().privateKey;

        if (privateKey === null) {
            throw new Error(`Could not derive private key at index ${i}`);
        }

        return bytesToHex(privateKey);
    });
}

export function privateKeyAt(index: number): Hex {
    const key = privateKeys()[index];

    if (key === undefined) {
        throw new Error(`No private key at index ${index}`);
    }

    return key;
}
