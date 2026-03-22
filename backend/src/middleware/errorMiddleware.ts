import type { NextFunction, Request, Response } from 'express';
import type { MulterError } from 'multer';
import { AppError } from '../domain/errors/appError';
import { Logger } from '../infrastructure/logger';

const logger = new Logger();

function isMulterError(err: unknown): err is MulterError {
    return typeof err === 'object' && err !== null && 'code' in err;
}

export function errorMiddleware(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    if (err instanceof Error && err.message === 'INVALID_FILE_TYPE') {
        res.status(400).json({
            success: false,
            error: {
                message: 'Only PDF and DOCX files are allowed',
                code: 'INVALID_FILE_TYPE',
            },
        });
        return;
    }

    if (isMulterError(err) && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
            success: false,
            error: {
                message: 'File exceeds maximum size of 10MB',
                code: 'FILE_TOO_LARGE',
            },
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code,
                details: err.details,
            },
        });
        return;
    }

    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Unhandled error', { message });
    res.status(500).json({
        success: false,
        error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
        },
    });
}
