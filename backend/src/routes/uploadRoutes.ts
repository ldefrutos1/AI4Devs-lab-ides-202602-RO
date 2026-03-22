import { Router } from 'express';
import { uploadCvMiddleware } from '../infrastructure/multerCv';
import { requireAuth } from '../middleware/authMiddleware';
import { createUploadController } from '../presentation/controllers/uploadController';

export function buildUploadRouter(): Router {
    const router = Router();
    const controller = createUploadController();

    router.post(
        '/upload',
        requireAuth,
        uploadCvMiddleware.single('file'),
        (req, res, next) => {
            controller.handleUpload(req, res, next);
        },
    );

    return router;
}
