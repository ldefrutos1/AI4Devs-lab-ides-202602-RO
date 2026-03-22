import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { LocaleProvider } from './context/LocaleContext';
import { AddCandidatePage } from './pages/AddCandidatePage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

export default function App(): JSX.Element {
    return (
        <LocaleProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="candidates/new" element={<AddCandidatePage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </LocaleProvider>
    );
}
