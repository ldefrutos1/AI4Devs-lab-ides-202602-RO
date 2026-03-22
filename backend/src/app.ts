import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { CandidateService } from './application/services/candidateService';
import { AuthService } from './application/services/authService';
import { CandidateRepository } from './infrastructure/repositories/candidateRepository';
import { UserRepository } from './infrastructure/repositories/userRepository';
import { prisma } from './infrastructure/prismaClient';
import { errorMiddleware } from './middleware/errorMiddleware';
import { buildAuthRouter } from './routes/authRoutes';
import { buildCandidateRouter } from './routes/candidateRoutes';
import { buildUploadRouter } from './routes/uploadRoutes';

const userRepository = new UserRepository(prisma);
const candidateRepository = new CandidateRepository(prisma);
const authService = new AuthService(userRepository);
const candidateService = new CandidateService(candidateRepository);

export const app = express();

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
    cors({
        origin: frontendOrigin,
        credentials: true,
    }),
);

app.use(express.json({ limit: '10mb' }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: 'lax',
        },
    }),
);

app.get('/', (_req, res) => {
    res.status(200).send('LTI ATS API');
});

app.use(buildAuthRouter(authService));
app.use(buildCandidateRouter(candidateService));
app.use(buildUploadRouter());

app.use(errorMiddleware);
