import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type {
    CandidateListItem,
    CandidateWithRelations,
    CreateCandidatePersistenceInput,
    ICandidateRepository,
} from '../../domain/repositories/ICandidateRepository';

export class CandidateRepository implements ICandidateRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async createWithRelations(input: CreateCandidatePersistenceInput): Promise<CandidateWithRelations> {
        const data: Prisma.CandidateCreateInput = {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            address: input.address,
            educations: {
                create: input.educations.map((e) => ({
                    institution: e.institution,
                    title: e.title,
                    startDate: e.startDate,
                    endDate: e.endDate,
                })),
            },
            workExperiences: {
                create: input.workExperiences.map((w) => ({
                    company: w.company,
                    position: w.position,
                    description: w.description,
                    startDate: w.startDate,
                    endDate: w.endDate,
                })),
            },
            resumes: {
                create: [
                    {
                        filePath: input.resume.filePath,
                        fileType: input.resume.fileType,
                    },
                ],
            },
        };

        return this.prisma.candidate.create({
            data,
            include: {
                educations: true,
                workExperiences: true,
                resumes: true,
            },
        });
    }

    async listRecentSummaries(limit: number): Promise<CandidateListItem[]> {
        return this.prisma.candidate.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
            orderBy: { id: 'desc' },
            take: limit,
        });
    }
}
