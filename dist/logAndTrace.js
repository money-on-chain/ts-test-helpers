export async function subSection(prefix, func) {
    const log = (...args) => console.log(`[${prefix}]`, ...args);
    log("Starting");
    const result = await func(log);
    log("Done");
    return result;
}
//# sourceMappingURL=logAndTrace.js.map