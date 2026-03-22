import axios from 'axios';
import type { StringKey } from '../i18n/strings';

export function getApiErrorMessage(
    err: unknown,
    translate: (key: StringKey) => string,
): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as
            | { error?: { message?: string }; message?: string }
            | undefined;
        if (data?.error?.message) {
            return data.error.message;
        }
        if (data?.message) {
            return data.message;
        }
        if (err.code === 'ERR_NETWORK' || !err.response) {
            return translate('error.network');
        }
        return translate('error.server');
    }
    if (err instanceof Error) {
        return err.message;
    }
    return translate('error.server');
}
