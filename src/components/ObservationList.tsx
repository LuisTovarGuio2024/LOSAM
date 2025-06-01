import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../firebase";
import "../listpage.css";   // mantiene tu CSS

/* ────────── tipos mínimos ────────── */
interface RiskItem {
  answer?: string;          // siempre string según tu formulario
  threatCode?: string;
  managed?: string;
  comment?: string;
}

interface Payload {
  fecha: string;
  ubicacion: string;
  trabajoObs: string;
  [key: `r${number}`]: RiskItem | undefined;
}

interface Observation {
  id: string;
  payload: Payload;
}

type ObsDoc = { payload: Payload };



/* ────────── componente ────────── */
export default function ObservationList() {
  const [observations, setObservations] = useState<Observation[]>([]);

  /* realtime Firestore */
  useEffect(() => {
    const q = query(collection(db, "observations"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap =>
      setObservations(
        snap.docs.map(d => ({
          id: d.id,
          payload: (d.data() as ObsDoc).payload
        }))
      )
    );
  }, []);

  /* descargar PDF */
  const handlePdf = (obs: Observation) => {
    const doc = new jsPDF();
    doc.text("Inspección LOSA-M", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Campo", "Valor"]],
      body: [
        ["Fecha", obs.payload.fecha],
        ["Ubicación", obs.payload.ubicacion],
        ["Trabajo Observado", obs.payload.trabajoObs],
        
      ]
    });
    doc.save(`inspeccion-${obs.id}.pdf`);
  };

  /* ────────── render ────────── */
  return (
    <div className="form-wrapper">
      <h1>Inspecciones LOSA-M</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Ubicación</th>
            <th className="p-2 text-left">Trabajo Observado</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {observations.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center">
                No hay observaciones registradas aún.
              </td>
            </tr>
          ) : (
            observations.map(obs => (
              <tr key={obs.id} className="even:bg-gray-100">
                <td className="p-2">{obs.payload.fecha}</td>
                <td className="p-2">{obs.payload.ubicacion}</td>
                <td className="p-2">{obs.payload.trabajoObs}</td>
                <td className="p-2 text-center space-x-3">
                  {/*  ↘️  ajusta si tu ruta es /observaciones/:id */}
                  
                    
                  
                  <button
                    type="button"
                    onClick={() => handlePdf(obs)}
                    className="text-blue-600 hover:underline"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
