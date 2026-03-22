import type { Request, Response, NextFunction } from 'express';
import type { CandidateService } from '../../application/services/candidateService';

export function createCandidateController(candidateService: CandidateService) {
    return {
        async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const candidates = await candidateService.listCandidates();
                res.status(200).json({ candidates });
            } catch (err) {
                next(err);
            }
        },
        async create(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const result = await candidateService.createFromRequestBody(req.body);
                res.status(201).json({
                    id: result.id,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    phone: result.phone,
                    address: result.address,
                });
            } catch (err) {
                next(err);
            }
        },
    };
}
