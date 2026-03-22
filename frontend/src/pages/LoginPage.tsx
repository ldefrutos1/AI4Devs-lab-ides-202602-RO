import React, { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

export function LoginPage(): JSX.Element {
    const { user, loading, login } = useAuth();
    const { t } = useLocale();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/dashboard';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!loading && user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(username.trim(), password);
            navigate(from, { replace: true });
        } catch {
            setError(t('login.error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Row className="justify-content-center">
            <Col xs={12} md={8} lg={5}>
                <Card className="shadow-sm">
                    <Card.Body>
                        <Card.Title as="h1" className="h3 mb-3">
                            {t('login.title')}
                        </Card.Title>
                        <p className="text-muted">{t('login.subtitle')}</p>
                        {error && (
                            <Alert variant="danger" role="alert" aria-live="assertive">
                                {error}
                            </Alert>
                        )}
                        <Form onSubmit={(e) => void handleSubmit(e)} noValidate>
                            <Form.Group className="mb-3" controlId="login-username">
                                <Form.Label>{t('login.username')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(ev) => setUsername(ev.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="login-password">
                                <Form.Label>{t('login.password')}</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(ev) => setPassword(ev.target.value)}
                                />
                            </Form.Group>
                            <Button type="submit" variant="primary" disabled={submitting}>
                                {submitting ? '…' : t('login.submit')}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}
