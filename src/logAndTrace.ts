export async function subSection<T>(prefix: string, func: (log: typeof console.log) => T | Promise<T>): Promise<T> {
  const log: typeof console.log = (...args) => console.log(`[${prefix}]`, ...args);
  log("Starting");
  const result = await func(log);
  log("Done");
  return result;
}
