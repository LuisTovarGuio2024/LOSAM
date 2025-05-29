// src/pages/ObservationDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/* tipado mínimo para pintar */
type Obs = {
  fecha:   { toDate: () => Date };
  aeronave:string;
  ruta:    string;
  pf:      string;
  rating:  { briefing:number[]; planes:number[]; conting:number[] };
  amenazas:{ descripcion:string; tipo:string; fase:string; gestion:string }[];
  errores: { descripcion:string; tipo:string; fase:string;
             respuesta:string; resultado:string; gestion:string }[];
};

export default function ObservationDetail() {
  const { id } = useParams<{ id:string }>();
  const [obs,setObs] = useState<Obs|null>(null);

  useEffect(()=>{
    if(!id) return;
    getDoc(doc(db,"observaciones",id)).then(snap=>{
      if(snap.exists()) setObs(snap.data() as Obs);
    });
  },[id]);

  if(!obs) return <p className="center-msg">Cargando…</p>;

  /* helpers */
  const maxRisk = Math.max(
    ...obs.rating.briefing, ...obs.rating.planes, ...obs.rating.conting
  );

  return (
    <div className="detail-wrapper">
      <header className="detail-header">
        <h1 className="page-title">Detalle inspección</h1>
        <Link to="/" className="btn-outline-sm">⟵ Regresar</Link>
      </header>

      {/* info básica */}
      <section className="section">
        <h2 className="section-h2">Información básica</h2>
        <ul className="info-list">
          <li><b>Fecha:</b> {obs.fecha.toDate().toLocaleString()}</li>
          <li><b>Aeronave:</b> {obs.aeronave}</li>
          <li><b>Ruta:</b> {obs.ruta}</li>
          <li><b>Piloto volando:</b> {obs.pf}</li>
          <li><b>Riesgo máximo:</b> {maxRisk}</li>
        </ul>
      </section>

      {/* marcadores */}
      <section className="section">
        <h2 className="section-h2">Marcadores de desempeño</h2>
        <ul className="info-list">
          <li><b>Briefing:</b> {obs.rating.briefing.join(", ")}</li>
          <li><b>Planes expuestos:</b> {obs.rating.planes.join(", ")}</li>
          <li><b>Contingencias:</b> {obs.rating.conting.join(", ")}</li>
        </ul>
      </section>

      {/* amenazas */}
      <section className="section">
        <h2 className="section-h2">Amenazas</h2>
        {obs.amenazas.length === 0 ? (
          <p>No hubo amenazas registradas.</p>
        ):(
          <table className="table-detail">
            <thead><tr>
              <th>Descripción</th><th>Tipo</th><th>Fase</th><th>Gestión</th>
            </tr></thead>
            <tbody>
              {obs.amenazas.map((a,i)=>(
                <tr key={i}>
                  <td>{a.descripcion}</td><td>{a.tipo}</td>
                  <td>{a.fase}</td><td>{a.gestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* errores */}
      <section className="section">
        <h2 className="section-h2">Errores</h2>
        {obs.errores.length === 0 ? (
          <p>No hubo errores registrados.</p>
        ):(
          <table className="table-detail">
            <thead><tr>
              <th>Descripción</th><th>Tipo</th><th>Fase</th>
              <th>Respuesta</th><th>Resultado</th><th>Gestión</th>
            </tr></thead>
            <tbody>
              {obs.errores.map((er,i)=>(
                <tr key={i}>
                  <td>{er.descripcion}</td><td>{er.tipo}</td>
                  <td>{er.fase}</td><td>{er.respuesta}</td>
                  <td>{er.resultado}</td><td>{er.gestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
