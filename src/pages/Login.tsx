// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo-stc.jpg";
import "../login.css";                       // ⬅ importar el CSS plano

export default function Login() {
  /* estado */
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const  navigate                = useNavigate();

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");               // redirigir al inicio
    } catch {
      setError("Correo o contraseña inválidos");
    }
  };

  /* UI */
  return (
    <div className="login-wrapper">
      <div className="login-card">
        <img src={logo} alt="STC Logo" />
        <h2>Servicios Técnicos Complementarios</h2>

        <form onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}

          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tú@correo.com"
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <button type="submit">Iniciar sesión</button>
        </form>
      </div>
    </div>
  );
}
