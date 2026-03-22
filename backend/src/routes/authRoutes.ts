import { Router } from 'express';
import type { AuthService } from '../application/services/authService';
import { createAuthController } from '../presentation/controllers/authController';

export function buildAuthRouter(authService: AuthService): Router {
    const router = Router();
    const controller = createAuthController(authService);

    router.post('/auth/login', (req, res, next) => {
        void controller.login(req, res, next);
    });
    router.post('/auth/logout', (req, res, next) => {
        void controller.logout(req, res, next);
    });
    router.get('/auth/me', (req, res, next) => {
        void controller.me(req, res, next);
    });

    return router;
}
