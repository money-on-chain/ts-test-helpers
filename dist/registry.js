import { keccak256, stringToHex } from "viem";
export const registryKey = (value) => keccak256(stringToHex(value));
export const registryMocOracleKey = (value) => registryKey("MOC_ORACLE\\1\\" + value);
//# sourceMappingURL=registry.js.map