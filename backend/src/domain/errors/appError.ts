export class AppError extends Error {
    readonly code: string;

    readonly statusCode: number;

    readonly details?: unknown;

    constructor(code: string, message: string, statusCode: number, details?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super('VALIDATION_ERROR', message, 400, details);
        this.name = 'ValidationError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super('UNAUTHORIZED', message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string, code = 'CONFLICT') {
        super(code, message, 409);
        this.name = 'ConflictError';
    }
}
