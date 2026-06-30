export async function waitFor<T>(
    name: string,
    predicate: () => Promise<T>,
    retries = 720,
    delayMs = 1000,
): Promise<T> {
    process.stdout.write(name);
    for (let i = 0; i < retries; i += 1) {
        const value = await predicate();
        if (value != null && value !== false) {
            console.log('ok!');
            return value;
        }
        process.stdout.write('.');
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    console.log('failed!');
    throw new Error(`waitFor(${name}) timed out after ${retries} attempts`);
}

export function waitForEnter(msg: string = 'Press Enter to continue...'): Promise<void> {
    if (process.env.CI) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        console.log(msg);

        process.stdin.once('data', () => {
            process.stdin.pause();
            resolve();
        });
    });
}
