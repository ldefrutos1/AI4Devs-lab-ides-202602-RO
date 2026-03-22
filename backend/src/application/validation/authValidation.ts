import { ValidationError } from '../../domain/errors/appError';

export interface LoginPayload {
    username: string;
    password: string;
}

export function assertValidLoginPayload(body: unknown): LoginPayload {
    if (body === null || typeof body !== 'object') {
        throw new ValidationError('Request body must be a JSON object');
    }
    const o = body as Record<string, unknown>;
    const username = typeof o.username === 'string' ? o.username.trim() : '';
    const password = typeof o.password === 'string' ? o.password : '';
    if (!username) {
        throw new ValidationError('Username is required');
    }
    if (!password) {
        throw new ValidationError('Password is required');
    }
    return { username, password };
}
