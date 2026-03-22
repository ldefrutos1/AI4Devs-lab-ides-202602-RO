export interface EducationPayload {
    institution: string;
    title: string;
    startDate: string;
    endDate?: string | null;
}

export interface WorkExperiencePayload {
    company: string;
    position: string;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
}

export interface ResumePayload {
    filePath: string;
    fileType: string;
}

export interface CreateCandidatePayload {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    educations?: EducationPayload[];
    workExperiences?: WorkExperiencePayload[];
    cv: ResumePayload;
}
