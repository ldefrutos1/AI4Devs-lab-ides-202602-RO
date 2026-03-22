import { Prisma } from '@prisma/client';
import { ConflictError, ValidationError } from '../../domain/errors/appError';
import type {
    CandidateListItem,
    ICandidateRepository,
} from '../../domain/repositories/ICandidateRepository';
import { cvFileExists } from '../../infrastructure/storage/cvStorage';
import type { CreateCandidatePayload } from '../types/candidatePayload';
import { assertValidCreateCandidatePayload } from '../validation/candidateValidation';

export interface CreateCandidateResult {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
}

const LIST_CANDIDATES_MAX = 100;

export class CandidateService {
    constructor(private readonly candidates: ICandidateRepository) {}

    async listCandidates(): Promise<CandidateListItem[]> {
        return this.candidates.listRecentSummaries(LIST_CANDIDATES_MAX);
    }

    async createFromRequestBody(body: unknown): Promise<CreateCandidateResult> {
        const payload = assertValidCreateCandidatePayload(body);

        if (!cvFileExists(payload.cv.filePath)) {
            throw new ValidationError('Resume file not found. Upload the file before submitting.', [
                { field: 'cv.filePath', message: 'File does not exist on server' },
            ]);
        }

        const persistence = this.mapPayloadToPersistence(payload);

        try {
            const created = await this.candidates.createWithRelations(persistence);
            return {
                id: created.id,
                firstName: created.firstName,
                lastName: created.lastName,
                email: created.email,
                phone: created.phone,
                address: created.address,
            };
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictError(
                    'A candidate with this email already exists.',
                    'EMAIL_ALREADY_EXISTS',
                );
            }
            throw error;
        }
    }

    private mapPayloadToPersistence(payload: CreateCandidatePayload) {
        return {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phone: payload.phone ?? null,
            address: payload.address ?? null,
            educations: (payload.educations ?? []).map((e) => ({
                institution: e.institution,
                title: e.title,
                startDate: this.startOfDayUtc(e.startDate),
                endDate: e.endDate ? this.startOfDayUtc(e.endDate) : null,
            })),
            workExperiences: (payload.workExperiences ?? []).map((w) => ({
                company: w.company,
                position: w.position,
                description: w.description ?? null,
                startDate: this.startOfDayUtc(w.startDate),
                endDate: w.endDate ? this.startOfDayUtc(w.endDate) : null,
            })),
            resume: {
                filePath: payload.cv.filePath,
                fileType: payload.cv.fileType,
            },
        };
    }

    private startOfDayUtc(isoDate: string): Date {
        const d = new Date(isoDate);
        if (Number.isNaN(d.getTime())) {
            throw new ValidationError('Invalid date in education or work experience');
        }
        return d;
    }
}
