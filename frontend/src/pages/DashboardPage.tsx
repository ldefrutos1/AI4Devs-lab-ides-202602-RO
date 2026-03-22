import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import * as candidateService from '../services/candidateService';

export function DashboardPage(): JSX.Element {
    const { user } = useAuth();
    const { t } = useLocale();

    const [candidates, setCandidates] = useState<candidateService.CandidateSummary[] | null>(null);
    const [candidatesLoading, setCandidatesLoading] = useState(true);
    const [candidatesError, setCandidatesError] = useState(false);

    const loadCandidates = useCallback(async () => {
        setCandidatesLoading(true);
        setCandidatesError(false);
        try {
            const list = await candidateService.fetchCandidates();
            setCandidates(list);
        } catch {
            setCandidatesError(true);
            setCandidates(null);
        } finally {
            setCandidatesLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCandidates();
    }, [loadCandidates]);

    return (
        <div>
            <h1 className="mb-4">{t('dashboard.title')}</h1>
            <p className="lead" id="dashboard-intro">
                {t('dashboard.welcome', { name: user?.username ?? '' })}
            </p>

            <Row className="g-4 mt-2">
                <Col xs={12} md={8} lg={7}>
                    <Card className="border-primary shadow-sm h-100">
                        <Card.Body className="d-flex flex-column">
                            <Card.Title as="h2" className="h4">
                                {t('nav.addCandidate')}
                            </Card.Title>
                            <Card.Text className="text-muted flex-grow-1">
                                {t('dashboard.addCandidateHint')}
                            </Card.Text>
                            <div>
                                <Link
                                    to="/candidates/new"
                                    className="btn btn-primary btn-lg w-100 d-inline-block text-center"
                                    style={{ maxWidth: '24rem' }}
                                >
                                    {t('dashboard.addCandidateCta')}
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mt-4">
                <Col xs={12}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title as="h2" className="h4" id="dashboard-candidates-heading">
                                {t('dashboard.candidatesCardTitle')}
                            </Card.Title>
                            <Card.Text className="text-muted small">{t('dashboard.candidatesCardHint')}</Card.Text>

                            {candidatesError && (
                                <Alert variant="danger" className="mb-0">
                                    {t('dashboard.candidatesLoadError')}
                                </Alert>
                            )}

                            {!candidatesError && candidatesLoading && (
                                <div className="d-flex align-items-center gap-2 py-3 text-muted" role="status">
                                    <Spinner animation="border" size="sm" aria-hidden />
                                    <span>{t('dashboard.candidatesLoading')}</span>
                                </div>
                            )}

                            {!candidatesError && !candidatesLoading && candidates !== null && candidates.length === 0 && (
                                <p className="text-muted mb-0">{t('dashboard.candidatesEmpty')}</p>
                            )}

                            {!candidatesError && !candidatesLoading && candidates !== null && candidates.length > 0 && (
                                <div className="table-responsive">
                                    <Table
                                        striped
                                        bordered
                                        hover
                                        size="sm"
                                        className="mb-0 align-middle"
                                        aria-labelledby="dashboard-candidates-heading"
                                    >
                                        <thead>
                                            <tr>
                                                <th scope="col">{t('field.firstName')}</th>
                                                <th scope="col">{t('field.lastName')}</th>
                                                <th scope="col">{t('field.email')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidates.map((c) => (
                                                <tr key={c.id}>
                                                    <td>{c.firstName}</td>
                                                    <td>{c.lastName}</td>
                                                    <td>
                                                        <a href={`mailto:${c.email}`}>{c.email}</a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
