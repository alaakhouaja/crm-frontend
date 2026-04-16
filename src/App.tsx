import { type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { LeadsPage } from './pages/LeadsPage';
import { UsersPage } from './pages/UsersPage';
import { PipelineView } from './pages/PipelineView';
import { AppLayout } from './components/AppLayout';
import './App.css';

function Protected({ children, roles }: { children: ReactNode, roles?: string[] }) {
  const auth = useAuth();
  
  if (!auth) return <div className="page center"><p className="muted">Initialisation...</p></div>;
  
  const { token, user, loading } = auth;
  
  if (loading) {
    return (
      <div className="page center">
        <p className="muted">Chargement…</p>
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/leads" replace />;
  }
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}

function LoginRoute() {
  const auth = useAuth();
  if (!auth) return null;
  
  const { token, loading } = auth;
  if (loading) {
    return (
      <div className="page center">
        <p className="muted">Chargement…</p>
      </div>
    );
  }
  if (token) {
    return <Navigate to="/leads" replace />;
  }
  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/leads"
        element={
          <Protected>
            <LeadsPage />
          </Protected>
        }
      />
      <Route
        path="/pipeline"
        element={
          <Protected>
            <PipelineView />
          </Protected>
        }
      />
      <Route
        path="/users"
        element={
          <Protected roles={['ADMIN']}>
            <UsersPage />
          </Protected>
        }
      />
      <Route path="/" element={<Navigate to="/leads" replace />} />
      <Route path="*" element={<Navigate to="/leads" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
