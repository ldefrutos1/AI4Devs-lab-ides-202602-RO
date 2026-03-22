import { API_BASE_URL } from './apiClient';

export type UploadResult = {
    filePath: string;
    fileType: string;
};

export async function uploadCv(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });
    const data = (await res.json().catch(() => null)) as
        | UploadResult
        | { success?: boolean; error?: { message?: string } }
        | null;
    if (!res.ok) {
        const msg =
            data && typeof data === 'object' && 'error' in data && data.error?.message
                ? data.error.message
                : 'Upload failed';
        throw new Error(msg);
    }
    if (data && 'filePath' in data && 'fileType' in data) {
        return { filePath: data.filePath, fileType: data.fileType };
    }
    throw new Error('Invalid upload response');
}
