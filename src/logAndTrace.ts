export async function subSection<T>(
    prefix: string,
    func: (log: (...args: unknown[]) => void) => T | Promise<T>,
): Promise<T> {
    const log = (...args: unknown[]): void => console.log(`[${prefix}]`, ...args);
    log('Starting');
    const result = await func(log);
    log('Done');
    return result;
}
