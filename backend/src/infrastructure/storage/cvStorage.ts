import fs from 'fs';
import path from 'path';

/**
 * CV files live in `<repo>/cv`, i.e. one level above `backend/` when the process cwd is `backend/`.
 */
export function getCvRootAbsolutePath(): string {
    return path.resolve(process.cwd(), '..', 'cv');
}

export function ensureCvDirectoryExists(): void {
    const root = getCvRootAbsolutePath();
    if (!fs.existsSync(root)) {
        fs.mkdirSync(root, { recursive: true });
    }
}

/**
 * Ensures resolved path stays under the CV root (mitigate path traversal).
 */
export function resolveSafeCvFilePath(storedRelativePath: string): string {
    const root = getCvRootAbsolutePath();
    const resolved = path.resolve(root, storedRelativePath);
    if (!resolved.startsWith(root)) {
        throw new Error('Invalid file path');
    }
    return resolved;
}

export function cvFileExists(storedRelativePath: string): boolean {
    try {
        const full = resolveSafeCvFilePath(storedRelativePath);
        return fs.existsSync(full);
    } catch {
        return false;
    }
}
