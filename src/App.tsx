// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar                from "./components/Navbar";
import Login                 from "./pages/Login";
import ObservationListPage   from "./pages/ObservationListPage";
import NewObservation        from "./pages/NewObservation";
import Dashboard             from "./pages/Dashboard";
import ProtectedRoute        from "./components/ProtectedRoute";
import ObservationDetail     from "./pages/ObservationDetail";

function AppWrapper() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <>
      {/* Sólo muestro Navbar si NO estoy en login */}
      {!isLogin && <Navbar />}

      <Routes>
        {/* Página pública de login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ObservationListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-observation"
          element={
            <ProtectedRoute>
              <NewObservation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/observaciones/:id"
          element={
            <ProtectedRoute>
              <ObservationDetail />
            </ProtectedRoute>
          }
        />

        {/* Catch-all → listado */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
