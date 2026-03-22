import type { EducationRow, WorkExperienceRow } from '../types/candidate';
import type { StringKey } from '../i18n/strings';

const NAME_PATTERN = /^[\p{L}\s-]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s+().-]+$/;
const PHONE_MAX = 30;
const ADDRESS_MAX = 100;
const NAME_MIN = 2;
const NAME_MAX = 100;
const MAX_EDUCATIONS = 3;
const MAX_CV_BYTES = 10 * 1024 * 1024;

export type FieldErrors = Partial<Record<string, string>>;

function isDigitsOnly(s: string): boolean {
    return /^[0-9]+$/.test(s.replace(/\s/g, ''));
}

function parseYmd(s: string): number | null {
    if (!s) {
        return null;
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
}

export type ValidationMessage = { key: StringKey };

export function validateCandidateForm(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    address: string,
    educations: EducationRow[],
    workExperiences: WorkExperienceRow[],
    cvFile: File | null,
): { ok: boolean; errors: FieldErrors; messages: ValidationMessage[] } {
    const errors: FieldErrors = {};
    const messages: ValidationMessage[] = [];

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();

    if (!fn) {
        errors.firstName = 'validation.required';
        messages.push({ key: 'validation.required' });
    } else if (fn.length < NAME_MIN || fn.length > NAME_MAX) {
        errors.firstName = 'validation.name';
        messages.push({ key: 'validation.name' });
    } else if (!NAME_PATTERN.test(fn) || isDigitsOnly(fn)) {
        errors.firstName = 'validation.name';
        messages.push({ key: 'validation.name' });
    }

    if (!ln) {
        errors.lastName = 'validation.required';
        messages.push({ key: 'validation.required' });
    } else if (ln.length < NAME_MIN || ln.length > NAME_MAX) {
        errors.lastName = 'validation.name';
        messages.push({ key: 'validation.name' });
    } else if (!NAME_PATTERN.test(ln) || isDigitsOnly(ln)) {
        errors.lastName = 'validation.name';
        messages.push({ key: 'validation.name' });
    }

    if (!em || !EMAIL_PATTERN.test(em)) {
        errors.email = 'validation.email';
        messages.push({ key: 'validation.email' });
    }

    if (phone.trim()) {
        const p = phone.trim();
        if (p.length > PHONE_MAX || !PHONE_PATTERN.test(p)) {
            errors.phone = 'validation.phone';
            messages.push({ key: 'validation.phone' });
        }
    }

    if (address.length > ADDRESS_MAX) {
        errors.address = 'validation.addressLength';
        messages.push({ key: 'validation.addressLength' });
    }

    if (educations.length > MAX_EDUCATIONS) {
        errors.educations = 'validation.educationRow';
        messages.push({ key: 'validation.educationRow' });
    }

    educations.forEach((row, i) => {
        const hasAny =
            row.institution.trim() ||
            row.title.trim() ||
            row.startDate ||
            row.endDate;
        if (!hasAny) {
            return;
        }
        const inst = row.institution.trim();
        const title = row.title.trim();
        const sd = row.startDate;
        const ed = row.endDate;

        if (!inst) {
            errors[`education_${i}_institution`] = 'validation.required';
            messages.push({ key: 'validation.required' });
        }
        if (!title) {
            errors[`education_${i}_title`] = 'validation.required';
            messages.push({ key: 'validation.required' });
        }
        if (!sd) {
            errors[`education_${i}_startDate`] = 'validation.required';
            messages.push({ key: 'validation.required' });
        }

        if (sd && ed) {
            const a = parseYmd(sd);
            const b = parseYmd(ed);
            if (a !== null && b !== null && b < a) {
                errors[`education_${i}_end`] = 'validation.dateOrder';
                messages.push({ key: 'validation.dateOrder' });
            }
        }
    });

    workExperiences.forEach((row, i) => {
        const hasAny =
            row.company.trim() ||
            row.position.trim() ||
            row.description.trim() ||
            row.startDate ||
            row.endDate;
        if (!hasAny) {
            return;
        }
        const company = row.company.trim();
        const position = row.position.trim();
        const sd = row.startDate;
        const ed = row.endDate;

        if (!company) {
            errors[`work_${i}_company`] = 'validation.required';
            messages.push({ key: 'validation.required' });
        }
        if (!position) {
            errors[`work_${i}_position`] = 'validation.required';
            messages.push({ key: 'validation.required' });
        }
        if (!sd) {
            errors[`work_${i}_startDate`] = 'validation.required';
            messages.push({ key: 'validation.required' });
        }
        if (row.description.length > 200) {
            errors[`work_${i}_desc`] = 'validation.workRow';
            messages.push({ key: 'validation.workRow' });
        }
        if (sd && ed) {
            const a = parseYmd(sd);
            const b = parseYmd(ed);
            if (a !== null && b !== null && b < a) {
                errors[`work_${i}_end`] = 'validation.dateOrder';
                messages.push({ key: 'validation.dateOrder' });
            }
        }
    });

    if (!cvFile) {
        errors.cv = 'cv.required';
        messages.push({ key: 'cv.required' });
    } else {
        const okType =
            cvFile.type === 'application/pdf' ||
            cvFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (!okType) {
            errors.cv = 'validation.cvType';
            messages.push({ key: 'validation.cvType' });
        }
        if (cvFile.size > MAX_CV_BYTES) {
            errors.cv = 'validation.cvSize';
            messages.push({ key: 'validation.cvSize' });
        }
    }

    const ok = Object.keys(errors).length === 0;
    return { ok, errors, messages };
}
