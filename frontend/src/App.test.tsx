import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('axios', () => {
    const mockInstance = {
        get: jest.fn(),
        post: jest.fn(),
        interceptors: { request: { use: jest.fn() } },
    };
    return {
        __esModule: true,
        default: {
            create: jest.fn(() => mockInstance),
        },
    };
});

jest.mock('./services/authService', () => ({
    login: jest.fn(),
    logout: jest.fn(),
    fetchCurrentUser: jest.fn().mockResolvedValue(null),
}));

import App from './App';

test('shows recruiter sign-in when not authenticated', async () => {
    render(<App />);
    await waitFor(() => {
        expect(screen.getByRole('heading', { name: /recruiter sign in/i })).toBeInTheDocument();
    });
});
