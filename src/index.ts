export * from './archiveFailedTestLogs.js';
export * from './assertions.js';
export * from './deployer.js';
export * from './logAndTrace.js';
export * from './logPaths.js';
export * from './privateKeys.js';
export * from './waiter.js';
export * from './types.js';
export * from './registry.js';

import { Address } from 'viem';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000' as const satisfies Address;
export const ADDRESS_ONE = '0x0000000000000000000000000000000000000001' as const satisfies Address;
