import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  if (loading) return <p style={{ textAlign: 'center' }}>Cargando…</p>;

  if (!user)
    return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
}
