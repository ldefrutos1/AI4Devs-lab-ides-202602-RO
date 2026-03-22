import { apiClient } from './apiClient';

export type PublicUser = {
    id: number;
    username: string;
};

export async function login(username: string, password: string): Promise<PublicUser> {
    const { data } = await apiClient.post<{ success: boolean; data: { user: PublicUser } }>(
        '/auth/login',
        { username, password },
    );
    if (!data.success || !data.data?.user) {
        throw new Error('Login failed');
    }
    return data.data.user;
}

export async function logout(): Promise<void> {
    await apiClient.post('/auth/logout');
}

export async function fetchCurrentUser(): Promise<PublicUser | null> {
    try {
        const { data } = await apiClient.get<{ success: boolean; data: { user: PublicUser } }>(
            '/auth/me',
        );
        if (data.success && data.data?.user) {
            return data.data.user;
        }
        return null;
    } catch {
        return null;
    }
}
