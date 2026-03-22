export type EducationRow = {
    institution: string;
    title: string;
    startDate: string;
    endDate: string;
};

export type WorkExperienceRow = {
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
};

export type CreateCandidatePayload = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    educations?: Array<{
        institution: string;
        title: string;
        startDate: string;
        endDate?: string | null;
    }>;
    workExperiences?: Array<{
        company: string;
        position: string;
        description?: string | null;
        startDate: string;
        endDate?: string | null;
    }>;
    cv: {
        filePath: string;
        fileType: string;
    };
};

export type CreatedCandidateResponse = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
};
