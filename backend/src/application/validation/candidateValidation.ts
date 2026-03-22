import { ValidationError } from '../../domain/errors/appError';
import type {
    CreateCandidatePayload,
    EducationPayload,
    WorkExperiencePayload,
} from '../types/candidatePayload';
import type { FieldErrorDetail } from './fieldError';

const NAME_PATTERN = /^[\p{L}\s-]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_MAX = 30;
const ADDRESS_MAX = 100;
const NAME_MIN = 2;
const NAME_MAX = 100;
const MAX_EDUCATIONS = 3;

function isDigitsOnly(s: string): boolean {
    return /^[0-9]+$/.test(s.replace(/\s/g, ''));
}

function parseDateOnly(value: string, field: string, errors: FieldErrorDetail[]): Date | null {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        errors.push({ field, message: 'Must be a valid date' });
        return null;
    }
    return d;
}

export function assertValidCreateCandidatePayload(body: unknown): CreateCandidatePayload {
    const errors: FieldErrorDetail[] = [];

    if (body === null || typeof body !== 'object') {
        throw new ValidationError('Request body must be a JSON object');
    }

    const o = body as Record<string, unknown>;

    const firstName = typeof o.firstName === 'string' ? o.firstName.trim() : '';
    const lastName = typeof o.lastName === 'string' ? o.lastName.trim() : '';
    const email = typeof o.email === 'string' ? o.email.trim() : '';

    if (!firstName || firstName.length < NAME_MIN || firstName.length > NAME_MAX) {
        errors.push({
            field: 'firstName',
            message: `Must be between ${NAME_MIN} and ${NAME_MAX} characters`,
        });
    } else if (!NAME_PATTERN.test(firstName) || isDigitsOnly(firstName)) {
        errors.push({
            field: 'firstName',
            message: 'Must contain letters and may include spaces or hyphens',
        });
    }

    if (!lastName || lastName.length < NAME_MIN || lastName.length > NAME_MAX) {
        errors.push({
            field: 'lastName',
            message: `Must be between ${NAME_MIN} and ${NAME_MAX} characters`,
        });
    } else if (!NAME_PATTERN.test(lastName) || isDigitsOnly(lastName)) {
        errors.push({
            field: 'lastName',
            message: 'Must contain letters and may include spaces or hyphens',
        });
    }

    if (!email || !EMAIL_PATTERN.test(email)) {
        errors.push({ field: 'email', message: 'Must be a valid email address' });
    }

    let phone: string | null = null;
    if (o.phone !== undefined && o.phone !== null && o.phone !== '') {
        if (typeof o.phone !== 'string') {
            errors.push({ field: 'phone', message: 'Must be a string' });
        } else {
            const p = o.phone.trim();
            if (p.length > PHONE_MAX) {
                errors.push({ field: 'phone', message: `Must be at most ${PHONE_MAX} characters` });
            } else if (!/^[\d\s+().\-]+$/.test(p)) {
                errors.push({
                    field: 'phone',
                    message: 'Contains invalid characters for a phone number',
                });
            } else {
                phone = p;
            }
        }
    }

    let address: string | null = null;
    if (o.address !== undefined && o.address !== null && o.address !== '') {
        if (typeof o.address !== 'string') {
            errors.push({ field: 'address', message: 'Must be a string' });
        } else if (o.address.length > ADDRESS_MAX) {
            errors.push({
                field: 'address',
                message: `Must be at most ${ADDRESS_MAX} characters`,
            });
        } else {
            address = o.address;
        }
    }

    const educationsRaw = o.educations;
    const educations: EducationPayload[] = [];
    if (educationsRaw !== undefined && educationsRaw !== null) {
        if (!Array.isArray(educationsRaw)) {
            errors.push({ field: 'educations', message: 'Must be an array' });
        } else if (educationsRaw.length > MAX_EDUCATIONS) {
            errors.push({
                field: 'educations',
                message: `At most ${MAX_EDUCATIONS} education records allowed`,
            });
        } else {
            educationsRaw.forEach((row, index) => {
                const prefix = `educations[${index}]`;
                if (row === null || typeof row !== 'object') {
                    errors.push({ field: prefix, message: 'Must be an object' });
                    return;
                }
                const er = row as Record<string, unknown>;
                const institution = typeof er.institution === 'string' ? er.institution.trim() : '';
                const title = typeof er.title === 'string' ? er.title.trim() : '';
                const startDateStr = typeof er.startDate === 'string' ? er.startDate : '';
                if (!institution || institution.length > 100) {
                    errors.push({
                        field: `${prefix}.institution`,
                        message: 'Required, max 100 characters',
                    });
                }
                if (!title || title.length > 250) {
                    errors.push({
                        field: `${prefix}.title`,
                        message: 'Required, max 250 characters',
                    });
                }
                const sd = startDateStr
                    ? parseDateOnly(startDateStr, `${prefix}.startDate`, errors)
                    : null;
                if (!startDateStr) {
                    errors.push({
                        field: `${prefix}.startDate`,
                        message: 'Required',
                    });
                }
                let endDate: Date | null = null;
                if (er.endDate !== undefined && er.endDate !== null && er.endDate !== '') {
                    if (typeof er.endDate !== 'string') {
                        errors.push({
                            field: `${prefix}.endDate`,
                            message: 'Must be a string date',
                        });
                    } else {
                        endDate = parseDateOnly(er.endDate, `${prefix}.endDate`, errors);
                    }
                }
                if (sd && endDate && endDate < sd) {
                    errors.push({
                        field: `${prefix}.endDate`,
                        message: 'Must be on or after start date',
                    });
                }
                if (institution && title && sd) {
                    educations.push({
                        institution,
                        title,
                        startDate: startDateStr,
                        endDate:
                            er.endDate === undefined || er.endDate === null || er.endDate === ''
                                ? null
                                : String(er.endDate),
                    });
                }
            });
        }
    }

    const workRaw = o.workExperiences;
    const workExperiences: WorkExperiencePayload[] = [];
    if (workRaw !== undefined && workRaw !== null) {
        if (!Array.isArray(workRaw)) {
            errors.push({ field: 'workExperiences', message: 'Must be an array' });
        } else {
            workRaw.forEach((row, index) => {
                const prefix = `workExperiences[${index}]`;
                if (row === null || typeof row !== 'object') {
                    errors.push({ field: prefix, message: 'Must be an object' });
                    return;
                }
                const wr = row as Record<string, unknown>;
                const company = typeof wr.company === 'string' ? wr.company.trim() : '';
                const position = typeof wr.position === 'string' ? wr.position.trim() : '';
                const startDateStr = typeof wr.startDate === 'string' ? wr.startDate : '';
                if (!company || company.length > 100) {
                    errors.push({
                        field: `${prefix}.company`,
                        message: 'Required, max 100 characters',
                    });
                }
                if (!position || position.length > 100) {
                    errors.push({
                        field: `${prefix}.position`,
                        message: 'Required, max 100 characters',
                    });
                }
                let description: string | null = null;
                if (wr.description !== undefined && wr.description !== null && wr.description !== '') {
                    if (typeof wr.description !== 'string') {
                        errors.push({
                            field: `${prefix}.description`,
                            message: 'Must be a string',
                        });
                    } else if (wr.description.length > 200) {
                        errors.push({
                            field: `${prefix}.description`,
                            message: 'Max 200 characters',
                        });
                    } else {
                        description = wr.description;
                    }
                }
                const sd = startDateStr
                    ? parseDateOnly(startDateStr, `${prefix}.startDate`, errors)
                    : null;
                if (!startDateStr) {
                    errors.push({
                        field: `${prefix}.startDate`,
                        message: 'Required',
                    });
                }
                let endDate: Date | null = null;
                if (wr.endDate !== undefined && wr.endDate !== null && wr.endDate !== '') {
                    if (typeof wr.endDate !== 'string') {
                        errors.push({
                            field: `${prefix}.endDate`,
                            message: 'Must be a string date',
                        });
                    } else {
                        endDate = parseDateOnly(wr.endDate, `${prefix}.endDate`, errors);
                    }
                }
                if (sd && endDate && endDate < sd) {
                    errors.push({
                        field: `${prefix}.endDate`,
                        message: 'Must be on or after start date',
                    });
                }
                if (company && position && sd) {
                    workExperiences.push({
                        company,
                        position,
                        description,
                        startDate: startDateStr,
                        endDate:
                            wr.endDate === undefined || wr.endDate === null || wr.endDate === ''
                                ? null
                                : String(wr.endDate),
                    });
                }
            });
        }
    }

    const cv = o.cv;
    if (cv === undefined || cv === null || typeof cv !== 'object') {
        errors.push({ field: 'cv', message: 'Resume metadata is required' });
    } else {
        const c = cv as Record<string, unknown>;
        const filePath = typeof c.filePath === 'string' ? c.filePath.trim() : '';
        const fileType = typeof c.fileType === 'string' ? c.fileType.trim() : '';
        if (!filePath || filePath.length > 500) {
            errors.push({
                field: 'cv.filePath',
                message: 'Required, max 500 characters',
            });
        }
        if (!fileType || fileType.length > 50) {
            errors.push({
                field: 'cv.fileType',
                message: 'Required, max 50 characters',
            });
        }
    }

    if (errors.length > 0) {
        throw new ValidationError('Validation failed', errors);
    }

    const cvObj = o.cv as Record<string, unknown>;
    const cvFilePath = typeof cvObj.filePath === 'string' ? cvObj.filePath.trim() : '';
    const cvFileType = typeof cvObj.fileType === 'string' ? cvObj.fileType.trim() : '';

    return {
        firstName,
        lastName,
        email,
        phone,
        address,
        educations,
        workExperiences,
        cv: {
            filePath: cvFilePath,
            fileType: cvFileType,
        },
    };
}
