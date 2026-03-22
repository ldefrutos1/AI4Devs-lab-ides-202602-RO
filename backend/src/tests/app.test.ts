import request from 'supertest';
import { app } from '../app';

describe('GET /', () => {
    it('returns API health text', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('LTI ATS API');
    });
});
