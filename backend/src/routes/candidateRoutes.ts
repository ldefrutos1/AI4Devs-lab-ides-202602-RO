import { Router } from 'express';
import type { CandidateService } from '../application/services/candidateService';
import { requireAuth } from '../middleware/authMiddleware';
import { createCandidateController } from '../presentation/controllers/candidateController';

export function buildCandidateRouter(candidateService: CandidateService): Router {
    const router = Router();
    const controller = createCandidateController(candidateService);

    router.get('/candidates', requireAuth, (req, res, next) => {
        void controller.list(req, res, next);
    });

    router.post('/candidates', requireAuth, (req, res, next) => {
        void controller.create(req, res, next);
    });

    return router;
}
