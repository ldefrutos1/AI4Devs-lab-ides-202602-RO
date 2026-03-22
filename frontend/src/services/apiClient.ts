import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
