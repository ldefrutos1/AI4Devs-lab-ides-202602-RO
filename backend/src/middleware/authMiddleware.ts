import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../domain/errors/appError';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
    if (req.session.userId === undefined) {
        next(new UnauthorizedError());
        return;
    }
    next();
}
