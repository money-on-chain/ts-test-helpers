import { keccak256, stringToHex } from 'viem';

export const registryKey = (value: string) => keccak256(stringToHex(value));

export const registryMocOracleKey = (value: string) => registryKey('MOC_ORACLE\\1\\' + value);
