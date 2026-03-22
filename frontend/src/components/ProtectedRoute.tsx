import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }): JSX.Element {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="d-flex justify-content-center p-5" role="status" aria-live="polite">
                <Spinner animation="border" aria-label="Loading" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
