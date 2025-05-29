// src/components/ObservationList.tsx
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../firebase";


/* ─── Tipado ─────────────────────────────────────────── */
type Obs = {
  id:        string;
  fecha:     Timestamp;
  aeronave:  string;
  ruta:      string;
  pf:        string;
  amenazas?: unknown[];    // sólo necesitamos su longitud
  errores?:  unknown[];
  rating: {
    briefing:number[];
    planes:number[];
    conting:number[];
  };
};

/* ─── Componente ────────────────────────────────────── */
export default function ObservationList() {
  const [obs, setObs] = useState<Obs[]>([]);

  /* --- escucha en tiempo-real --- */
  useEffect(() => {
    const q = query(
      collection(db, "observaciones"),
      orderBy("creado", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      const rows = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Obs, "id">),
      }));
      setObs(rows);
    });
    return unsub;
  }, []);

  /* --- PDF individual --- */
  const downloadPdf = async (id: string) => {
    const ref  = doc(db, "observaciones", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return alert("No se encontró la inspección");
    const d = snap.data() as Omit<Obs, "id">;

    const pdf = new jsPDF();
    pdf.setFontSize(14);
    pdf.text("Reporte Inspección LOSA-M", 14, 18);

    autoTable(pdf, {
      startY: 26,
      head: [["Campo", "Valor"]],
      body: [
        ["Fecha", d.fecha.toDate().toLocaleString()],
        ["Aeronave", d.aeronave],
        ["Ruta", d.ruta],
        ["Piloto volando", d.pf],
        ["Amenazas", (d.amenazas?.length ?? 0).toString()],
        ["Errores",   (d.errores?.length ?? 0).toString()],
        [
          "Riesgo máximo",
          Math.max(
            ...d.rating.briefing,
            ...d.rating.planes,
            ...d.rating.conting
          ).toString(),
        ],
      ],
    });

    pdf.save(`Inspeccion-${id}.pdf`);
  };

  /* --- Render --- */
  return (
    <div className="listpage">
      <h1 className="listpage__title">INSPECCIONES LOSA-M</h1>

      <table className="listpage__table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Aeronave</th>
            <th>Ruta</th>
            <th>Piloto</th>
            <th>Amenazas</th>
            <th>Errores</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {obs.map(o => (
            <tr key={o.id}>
              <td>{o.fecha.toDate().toLocaleDateString()}</td>
              <td>{o.aeronave}</td>
              <td>{o.ruta}</td>
              <td>{o.pf}</td>
              <td className="text-center">{o.amenazas?.length ?? 0}</td>
              <td className="text-center">{o.errores?.length  ?? 0}</td>
              <td className="actions">
                <Link to={`/observaciones/${o.id}`} className="btn-view">
                  Ver
                </Link>
                <button onClick={() => downloadPdf(o.id)} className="btn-pdf">
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {obs.length === 0 && (
        <p className="center-msg">No hay observaciones registradas aún.</p>
      )}
    </div>
  );
}
