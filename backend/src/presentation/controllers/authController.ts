import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../../application/services/authService';
import { assertValidLoginPayload } from '../../application/validation/authValidation';

export function createAuthController(authService: AuthService) {
    return {
        async login(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const { username, password } = assertValidLoginPayload(req.body);
                const user = await authService.validateCredentials(username, password);
                if (!user) {
                    res.status(401).json({
                        success: false,
                        error: {
                            message: 'Invalid username or password',
                            code: 'INVALID_CREDENTIALS',
                        },
                    });
                    return;
                }
                req.session.userId = user.id;
                res.status(200).json({
                    success: true,
                    data: { user },
                });
            } catch (err) {
                next(err);
            }
        },

        async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                req.session.destroy((destroyErr) => {
                    if (destroyErr) {
                        next(destroyErr);
                        return;
                    }
                    res.status(204).send();
                });
            } catch (err) {
                next(err);
            }
        },

        async me(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const userId = req.session.userId;
                if (userId === undefined) {
                    res.status(401).json({
                        success: false,
                        error: {
                            message: 'Authentication required',
                            code: 'UNAUTHORIZED',
                        },
                    });
                    return;
                }
                const user = await authService.getPublicUserById(userId);
                if (!user) {
                    req.session.destroy(() => {
                        res.status(401).json({
                            success: false,
                            error: {
                                message: 'Session expired',
                                code: 'SESSION_INVALID',
                            },
                        });
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: { user },
                });
            } catch (err) {
                next(err);
            }
        },
    };
}
