import type { Candidate, Education, Resume, WorkExperience } from '@prisma/client';

export interface CreateCandidatePersistenceInput {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    educations: Array<{
        institution: string;
        title: string;
        startDate: Date;
        endDate: Date | null;
    }>;
    workExperiences: Array<{
        company: string;
        position: string;
        description: string | null;
        startDate: Date;
        endDate: Date | null;
    }>;
    resume: {
        filePath: string;
        fileType: string;
    };
}

export type CandidateWithRelations = Candidate & {
    educations: Education[];
    workExperiences: WorkExperience[];
    resumes: Resume[];
};

export interface CandidateListItem {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

export interface ICandidateRepository {
    createWithRelations(input: CreateCandidatePersistenceInput): Promise<CandidateWithRelations>;
    listRecentSummaries(limit: number): Promise<CandidateListItem[]>;
}
