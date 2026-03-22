import { randomUUID } from 'crypto';
import multer from 'multer';
import path from 'path';
import { ensureCvDirectoryExists, getCvRootAbsolutePath } from './storage/cvStorage';

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        ensureCvDirectoryExists();
        cb(null, getCvRootAbsolutePath());
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const normalized = ext === '.pdf' || ext === '.docx' ? ext : '';
        cb(null, `${randomUUID()}${normalized}`);
    },
});

export const uploadCvMiddleware = multer({
    storage,
    limits: { fileSize: MAX_BYTES },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('INVALID_FILE_TYPE'));
        }
    },
});
