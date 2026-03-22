import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import type { PublicUser } from '../services/authService';

type AuthContextValue = {
    user: PublicUser | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        const u = await authService.fetchCurrentUser();
        setUser(u);
    }, []);

    useEffect(() => {
        void refresh().finally(() => setLoading(false));
    }, [refresh]);

    const login = useCallback(async (username: string, password: string) => {
        const u = await authService.login(username, password);
        setUser(u);
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, logout, refresh }),
        [user, loading, login, logout, refresh],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
