type SafeMeta = Record<string, string | number | boolean | undefined>;

export class Logger {
    info(message: string, meta?: SafeMeta): void {
        console.log(JSON.stringify({ level: 'info', message, ...meta }));
    }

    error(message: string, meta?: SafeMeta): void {
        console.error(JSON.stringify({ level: 'error', message, ...meta }));
    }
}
