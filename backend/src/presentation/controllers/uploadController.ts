import type { Request, Response, NextFunction } from 'express';

const MAX_BYTES = 10 * 1024 * 1024;

export function createUploadController() {
    return {
        handleUpload(req: Request, res: Response, next: NextFunction): void {
            try {
                const file = req.file;
                if (!file) {
                    res.status(400).json({
                        success: false,
                        error: {
                            message: 'File is required',
                            code: 'FILE_REQUIRED',
                        },
                    });
                    return;
                }
                if (file.size > MAX_BYTES) {
                    res.status(400).json({
                        success: false,
                        error: {
                            message: 'File exceeds maximum size of 10MB',
                            code: 'FILE_TOO_LARGE',
                        },
                    });
                    return;
                }
                res.status(200).json({
                    filePath: file.filename,
                    fileType: file.mimetype,
                });
            } catch (err) {
                next(err);
            }
        },
    };
}
