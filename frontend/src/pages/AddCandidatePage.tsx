import React, { useCallback, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import * as candidateService from '../services/candidateService';
import * as uploadService from '../services/uploadService';
import type { CreateCandidatePayload } from '../types/candidate';
import type { EducationRow, WorkExperienceRow } from '../types/candidate';
import { getApiErrorMessage } from '../utils/apiErrors';
import { validateCandidateForm } from '../utils/validateCandidateForm';
import type { StringKey } from '../i18n/strings';

const emptyEducation = (): EducationRow => ({
    institution: '',
    title: '',
    startDate: '',
    endDate: '',
});

const emptyWork = (): WorkExperienceRow => ({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
});

export function AddCandidatePage(): JSX.Element {
    const { t } = useLocale();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [educations, setEducations] = useState<EducationRow[]>([]);
    const [workExperiences, setWorkExperiences] = useState<WorkExperienceRow[]>([]);
    const [cvFile, setCvFile] = useState<File | null>(null);

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const errMsg = useCallback(
        (key: string | undefined) => (key ? t(key as StringKey) : ''),
        [t],
    );

    const resetForAnother = useCallback(() => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setEducations([]);
        setWorkExperiences([]);
        setCvFile(null);
        setFieldErrors({});
        setFormError(null);
        setSuccess(false);
        const main = document.getElementById('main-content');
        main?.focus();
    }, []);

    const buildPayload = (
        cv: { filePath: string; fileType: string },
    ): CreateCandidatePayload => {
        const educationsPayload = educations
            .filter((r) => r.institution.trim() && r.title.trim() && r.startDate)
            .map((r) => ({
                institution: r.institution.trim(),
                title: r.title.trim(),
                startDate: r.startDate,
                endDate: r.endDate.trim() ? r.endDate : null,
            }));
        const workPayload = workExperiences
            .filter((r) => r.company.trim() && r.position.trim() && r.startDate)
            .map((r) => ({
                company: r.company.trim(),
                position: r.position.trim(),
                description: r.description.trim() ? r.description.trim() : null,
                startDate: r.startDate,
                endDate: r.endDate.trim() ? r.endDate : null,
            }));
        return {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
            address: address.trim() || null,
            educations: educationsPayload.length ? educationsPayload : undefined,
            workExperiences: workPayload.length ? workPayload : undefined,
            cv,
        };
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setFormError(null);
        setSuccess(false);
        setFieldErrors({});

        const v = validateCandidateForm(
            firstName,
            lastName,
            email,
            phone,
            address,
            educations,
            workExperiences,
            cvFile,
        );
        if (!v.ok) {
            // Store i18n keys (StringKey), not translated text — errMsg() translates on render.
            setFieldErrors(v.errors as Record<string, string>);
            setFormError(t('error.validation'));
            return;
        }

        if (!cvFile) {
            return;
        }

        setSubmitting(true);
        try {
            const uploaded = await uploadService.uploadCv(cvFile);
            const payload = buildPayload(uploaded);
            await candidateService.createCandidate(payload);
            setSuccess(true);
        } catch (err) {
            setFormError(getApiErrorMessage(err, t));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <p>
                <Link to="/dashboard" className="text-decoration-none">
                    ← {t('addCandidate.back')}
                </Link>
            </p>
            <h1 className="mb-2">{t('addCandidate.title')}</h1>
            <p className="text-muted mb-4">{t('addCandidate.subtitle')}</p>

            <div aria-live="polite" className="mb-3">
                {success && (
                    <Alert variant="success" role="status" onClose={() => setSuccess(false)} dismissible>
                        <p className="mb-2">{t('success.title')}</p>
                        <Button variant="outline-success" size="sm" onClick={resetForAnother}>
                            {t('success.addAnother')}
                        </Button>
                    </Alert>
                )}
            </div>

            {formError && (
                <Alert variant="danger" role="alert" aria-live="assertive" className="mb-3">
                    {formError}
                </Alert>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} noValidate>
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title as="h2" className="h5">
                            {t('field.firstName')} / {t('field.lastName')}
                        </Card.Title>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label htmlFor="firstName">
                                    {t('field.firstName')} <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    id="firstName"
                                    name="firstName"
                                    value={firstName}
                                    onChange={(ev) => setFirstName(ev.target.value)}
                                    isInvalid={!!fieldErrors.firstName}
                                    autoComplete="given-name"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errMsg(fieldErrors.firstName)}
                                </Form.Control.Feedback>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label htmlFor="lastName">
                                    {t('field.lastName')} <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    id="lastName"
                                    name="lastName"
                                    value={lastName}
                                    onChange={(ev) => setLastName(ev.target.value)}
                                    isInvalid={!!fieldErrors.lastName}
                                    autoComplete="family-name"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errMsg(fieldErrors.lastName)}
                                </Form.Control.Feedback>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label htmlFor="email">
                                    {t('field.email')} <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(ev) => setEmail(ev.target.value)}
                                    isInvalid={!!fieldErrors.email}
                                    autoComplete="email"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errMsg(fieldErrors.email)}
                                </Form.Control.Feedback>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label htmlFor="phone">{t('field.phone')}</Form.Label>
                                <Form.Control
                                    id="phone"
                                    name="tel"
                                    type="tel"
                                    value={phone}
                                    onChange={(ev) => setPhone(ev.target.value)}
                                    isInvalid={!!fieldErrors.phone}
                                    autoComplete="tel"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errMsg(fieldErrors.phone)}
                                </Form.Control.Feedback>
                            </Col>
                            <Col xs={12} className="mb-3">
                                <Form.Label htmlFor="address">{t('field.address')}</Form.Label>
                                <Form.Control
                                    id="address"
                                    name="address"
                                    value={address}
                                    onChange={(ev) => setAddress(ev.target.value)}
                                    isInvalid={!!fieldErrors.address}
                                    autoComplete="street-address"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errMsg(fieldErrors.address)}
                                </Form.Control.Feedback>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title as="h2" className="h5">
                            {t('education.section')}
                        </Card.Title>
                        <p className="small text-muted">{t('education.max')}</p>
                        {fieldErrors.educations && (
                            <p className="text-danger small" role="alert">
                                {errMsg(fieldErrors.educations)}
                            </p>
                        )}
                        {educations.map((row, index) => (
                            <div
                                key={`edu-${index}`}
                                className="border rounded p-3 mb-3"
                                style={{ borderColor: 'var(--bs-border-color-translucent)' }}
                            >
                                <Row>
                                    <Col md={6} className="mb-2">
                                        <Form.Label>{t('field.institution')}</Form.Label>
                                        <Form.Control
                                            value={row.institution}
                                            onChange={(ev) => {
                                                const next = [...educations];
                                                next[index] = { ...row, institution: ev.target.value };
                                                setEducations(next);
                                            }}
                                            isInvalid={!!fieldErrors[`education_${index}_institution`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errMsg(fieldErrors[`education_${index}_institution`])}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={6} className="mb-2">
                                        <Form.Label>{t('field.degreeTitle')}</Form.Label>
                                        <Form.Control
                                            value={row.title}
                                            onChange={(ev) => {
                                                const next = [...educations];
                                                next[index] = { ...row, title: ev.target.value };
                                                setEducations(next);
                                            }}
                                            isInvalid={!!fieldErrors[`education_${index}_title`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errMsg(fieldErrors[`education_${index}_title`])}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={6} className="mb-2">
                                        <Form.Label>{t('field.startDate')}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={row.startDate}
                                            onChange={(ev) => {
                                                const next = [...educations];
                                                next[index] = { ...row, startDate: ev.target.value };
                                                setEducations(next);
                                            }}
                                            isInvalid={!!fieldErrors[`education_${index}_startDate`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errMsg(fieldErrors[`education_${index}_startDate`])}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={6} className="mb-2">
                                        <Form.Label>{t('field.endDate')}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={row.endDate}
                                            onChange={(ev) => {
                                                const next = [...educations];
                                                next[index] = { ...row, endDate: ev.target.value };
                                                setEducations(next);
                                            }}
                                            isInvalid={!!fieldErrors[`education_${index}_end`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errMsg(fieldErrors[`education_${index}_end`])}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col xs={12}>
                                        <Button
                                            type="button"
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() =>
                                                setEducations(educations.filter((_, i) => i !== index))
                                            }
                                        >
                                            {t('education.remove')}
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline-secondary"
                            size="sm"
                            disabled={educations.length >= 3}
                            onClick={() => setEducations([...educations, emptyEducation()])}
                        >
                            {t('education.add')}
                        </Button>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title as="h2" className="h5">
                            {t('work.section')}
                        </Card.Title>
                        {workExperiences.map((row, index) => (
                            <div
                                key={`work-${index}`}
                                className="border rounded p-3 mb-3"
                                style={{ borderColor: 'var(--bs-border-color-translucent)' }}
                            >
                                <Row>
                                    <Col md={6} className="mb-2">
                                        <Form.Label>{t('field.company')}</Form.Label>
                                        <Form.Control
                                            value={row.company}
                                            onChange={(ev) => {
                                                const next = [...workExperiences];
                                                next[index] = { ...row, company: ev.target.value };
                                                setWorkExperiences(next);
                                            }}
                                            isInvalid={!!fieldErrors[`work_${index}_company`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errMsg(fieldErrors[`work_${index}_company`])}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={6} className="mb-2">
                                        <Form.Label>{t('field.position')}</Form.Label>
                                        <Form.Control
                                            value={row.position}
                                            onChange={(ev) => {
                                                const next = [...workExperiences];
                                                next[index] = { ...row, position: ev.target.value };
                                                setWorkExperiences(next);
                                            }}
                                            isInvalid={!!fieldErrors[`work_${index}_position`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errMsg(fieldErrors[`work_${index}_position`])}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col xs={12} className="mb-2">
                                        <Form.Label>{t('field.description')}</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={row.description}
                                            onChange={(ev) => {
                                                const next = [...workExperiences];
                                                next[index] = { ...row, description: ev.target.value };
                                                setWorkExperiences(next);
                                            }}
                                            isInvalid={!!fieldErrors[`work_${index}_desc`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errMsg(fieldErrors[`work_${index}_desc`])}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={6} className="mb-2">
                                        <Form.Label>{t('field.startDate')}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={row.startDate}
                                            onChange={(ev) => {
                                                const next = [...workExperiences];
                                                next[index] = { ...row, startDate: ev.target.value };
                                                setWorkExperiences(next);
                                            }}
                                            isInvalid={!!fieldErrors[`work_${index}_startDate`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errMsg(fieldErrors[`work_${index}_startDate`])}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={6} className="mb-2">
                                        <Form.Label>{t('field.endDate')}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={row.endDate}
                                            onChange={(ev) => {
                                                const next = [...workExperiences];
                                                next[index] = { ...row, endDate: ev.target.value };
                                                setWorkExperiences(next);
                                            }}
                                            isInvalid={!!fieldErrors[`work_${index}_end`]}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errMsg(fieldErrors[`work_${index}_end`])}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col xs={12}>
                                        <Button
                                            type="button"
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() =>
                                                setWorkExperiences(
                                                    workExperiences.filter((_, i) => i !== index),
                                                )
                                            }
                                        >
                                            {t('work.remove')}
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setWorkExperiences([...workExperiences, emptyWork()])}
                        >
                            {t('work.add')}
                        </Button>
                    </Card.Body>
                </Card>

                <Card className="mb-4">
                    <Card.Body>
                        <Form.Group controlId="cvFile">
                            <Form.Label>
                                {t('cv.label')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(ev) => {
                                    const input = ev.target as HTMLInputElement;
                                    const f = input.files?.[0] ?? null;
                                    setCvFile(f);
                                }}
                                isInvalid={!!fieldErrors.cv}
                            />
                            <Form.Text muted>{t('cv.hint')}</Form.Text>
                            <Form.Control.Feedback type="invalid">
                                {errMsg(fieldErrors.cv)}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Card.Body>
                </Card>

                <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                    {submitting ? t('submitting') : t('submit')}
                </Button>
            </form>
        </div>
    );
}
