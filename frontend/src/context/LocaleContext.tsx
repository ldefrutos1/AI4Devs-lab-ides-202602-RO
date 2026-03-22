import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Locale, StringKey } from '../i18n/strings';
import { t } from '../i18n/strings';

const STORAGE_KEY = 'lti-locale';

type LocaleContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: StringKey, vars?: Record<string, string>) => string;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function readInitialLocale(): Locale {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === 'es' || v === 'en') {
            return v;
        }
    } catch {
        /* ignore */
    }
    return 'en';
}

export function LocaleProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

    const setLocale = useCallback((next: Locale) => {
        setLocaleState(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const translate = useCallback(
        (key: StringKey, vars?: Record<string, string>) => t(locale, key, vars),
        [locale],
    );

    const value = useMemo(
        () => ({ locale, setLocale, t: translate }),
        [locale, setLocale, translate],
    );

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
    const ctx = useContext(LocaleContext);
    if (!ctx) {
        throw new Error('useLocale must be used within LocaleProvider');
    }
    return ctx;
}
