import type { CreateCandidatePayload, CreatedCandidateResponse } from '../types/candidate';
import { apiClient } from './apiClient';

export type CandidateSummary = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
};

export async function fetchCandidates(): Promise<CandidateSummary[]> {
    const { data } = await apiClient.get<{ candidates: CandidateSummary[] }>('/candidates');
    return data.candidates ?? [];
}

export async function createCandidate(payload: CreateCandidatePayload): Promise<CreatedCandidateResponse> {
    const { data } = await apiClient.post<CreatedCandidateResponse>('/candidates', payload);
    return data;
}
