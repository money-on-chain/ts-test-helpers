export async function getEvents(viem, source, eventName, eventArgs, txHash, fromBlock = 0n, toBlock) {
    const publicClient = await viem.getPublicClient();
    const getEvents = source.getEvents[eventName];
    if (txHash) {
        const tx = await publicClient.getTransactionReceipt({ hash: txHash });
        const events = await getEvents(eventArgs, { blockHash: tx.blockHash });
        return events.filter((event) => event.transactionHash === txHash);
    }
    return await getEvents(eventArgs, { fromBlock, toBlock });
}
export async function getTransfers(viem, source, fromAddress, toAddress, txHash, fromBlock = 0n, toBlock) {
    return await getEvents(viem, source, 'Transfer', { from: fromAddress, to: toAddress }, txHash, fromBlock, toBlock);
}
//# sourceMappingURL=events.js.map