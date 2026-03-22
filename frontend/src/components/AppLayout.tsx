import React from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
export function AppLayout(): JSX.Element {
    const { user, logout } = useAuth();
    const { locale, setLocale, t } = useLocale();
    const navigate = useNavigate();

    const handleLogout = async (): Promise<void> => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            <a href="#main-content" className="skip-link">
                {t('a11y.skipToContent')}
            </a>
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand as={Link} to="/dashboard">
                        {t('app.name')}
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-nav" />
                    <Navbar.Collapse id="main-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/dashboard">
                                {t('nav.dashboard')}
                            </Nav.Link>
                            <Nav.Link as={Link} to="/candidates/new">
                                {t('nav.addCandidate')}
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <NavDropdown
                                title={t('nav.language')}
                                id="locale-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item
                                    active={locale === 'en'}
                                    onClick={() => setLocale('en')}
                                >
                                    English
                                </NavDropdown.Item>
                                <NavDropdown.Item
                                    active={locale === 'es'}
                                    onClick={() => setLocale('es')}
                                >
                                    Español
                                </NavDropdown.Item>
                            </NavDropdown>
                            <Navbar.Text className="me-3 text-white-50">
                                {user?.username}
                            </Navbar.Text>
                            <Nav.Link
                                as="button"
                                className="btn btn-link nav-link text-white-50"
                                onClick={() => void handleLogout()}
                            >
                                {t('nav.logout')}
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <main id="main-content" tabIndex={-1}>
                <Container className="pb-5">
                    <Outlet />
                </Container>
            </main>
        </>
    );
}
