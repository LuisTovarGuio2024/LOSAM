// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import logo from "../assets/logo-stc.jpg";
import "../navbar.css";                // ⬅ nuevo CSS

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* ► 1. logo ---------------------------------------------------------------- */}
      <div className="navbar__left">
        <img src={logo} alt="STC Logo" />
      </div>

      {/* ► 2. texto centrado ------------------------------------------------------ */}
      <div className="navbar__center">
        Servicios Técnicos Complementarios
      </div>

      {/* ► 3. enlaces a la derecha ---------------------------------------------- */}
      <div className="navbar__right">
        <Link to="/">Inicio</Link>
        <Link to="/new-observation">Nueva Inspección</Link>
        <Link to="/observaciones">Ver Inspecciones</Link>
      </div>
    </nav>
  );
}
