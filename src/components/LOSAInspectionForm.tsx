// src/components/LOSAInspectionForm.tsx
import { useState } from "react";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";

/* ---------- tipos ---------- */
type PF = "Comandante" | "Primer Oficial";

type Threat = {
  descripcion: string;
  tipo: string;
  fase: "Despegue" | "Crucero" | "Descenso";
  vinculaError: boolean;
  gestion: string;
};

type ErrorMx = {
  descripcion: string;
  fase: "Despegue" | "Crucero" | "Descenso";
  idAmenaza: number | "";
  tipo: string;
  respuesta: "Detectado" | "Sin respuesta";
  resultado: "Sin consecuencias" | "Estado no deseado" | "Error adicional";
  gestion: string;
};

type Rating = 1 | 2 | 3 | 4;
type PerfMarkers = { briefing: Rating[]; planes: Rating[]; conting: Rating[] };

/* ---------- componente ---------- */
export default function LOSAInspectionForm() {
  const navigate = useNavigate();

  /* estado */
  const [fecha,     setFecha]     = useState("");
  const [aeronave,  setAeronave]  = useState("");
  const [ruta,      setRuta]      = useState("");
  const [pf,        setPf]        = useState<PF>("Comandante");

  const [despegue,  setDespegue]  = useState("");
  const [crucero,   setCrucero]   = useState("");
  const [descenso,  setDescenso]  = useState("");

  const [amenazas,  setAmenazas]  = useState<Threat[]>([]);
  const [errores,   setErrores]   = useState<ErrorMx[]>([]);

  const base: Rating[] = [1, 1, 1];
  const [rating, setRating] = useState<PerfMarkers>({
    briefing: [...base],
    planes:   [...base],
    conting:  [...base],
  });

  /* helpers */
  const addAmenaza = () =>
    setAmenazas([
      ...amenazas,
      { descripcion: "", tipo: "100", fase: "Despegue", vinculaError: false, gestion: "" },
    ]);

  const addError = () =>
    setErrores([
      ...errores,
      {
        descripcion: "",
        fase: "Despegue",
        idAmenaza: "",
        tipo: "300",
        respuesta: "Detectado",
        resultado: "Sin consecuencias",
        gestion: "",
      },
    ]);

  /* guardar */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha || !aeronave || !ruta) {
      alert("Completa fecha, aeronave y ruta.");
      return;
    }

    await addDoc(collection(db, "observaciones"), {
      fecha: Timestamp.fromDate(new Date(fecha)),
      aeronave,
      ruta,
      pf,
      fases:    { despegue, crucero, descenso },
      amenazas,
      errores,
      rating,
      autor:  auth.currentUser?.email ?? "desconocido",
      creado: Timestamp.now(),
    });

    alert("✅ Observación registrada");
    navigate("/");
  };

  /* UI */
  return (
    <div className="form-wrapper">
      <form onSubmit={handleSave} className="form">

        {/* ── fila corta ── */}
        <section className="row-short">
          <input  type="date" value={fecha}  onChange={e=>setFecha(e.target.value)}  className="input-short" />
          <input  value={aeronave} onChange={e=>setAeronave(e.target.value)} className="input-short" placeholder="Aeronave" />
          <input  value={ruta}     onChange={e=>setRuta(e.target.value)}     className="input-short" placeholder="Ruta" />
        </section>

        {/* piloto */}
        <div className="row-center">
          <label className="label-bold">Piloto volando:</label>
          <select value={pf} onChange={e=>setPf(e.target.value as PF)} className="select">
            <option>Comandante</option>
            <option>Primer Oficial</option>
          </select>
        </div>

        {/* descripción por fase */}
        <h2 className="section-title">Descripción por fase</h2>
        <textarea value={despegue} onChange={e=>setDespegue(e.target.value)} placeholder="Fase Despegue" className="textarea" />
        <textarea value={crucero}  onChange={e=>setCrucero(e.target.value)}  placeholder="Fase Crucero"  className="textarea" />
        <textarea value={descenso} onChange={e=>setDescenso(e.target.value)} placeholder="Fase Descenso" className="textarea" />

        {/* amenazas */}
        <h2 className="section-title">Gestión de Amenazas</h2>
        {amenazas.map((a,i)=>(
          <div key={i} className="threat-row">
            <input  value={a.descripcion} onChange={e=>{const v=[...amenazas];v[i].descripcion=e.target.value;setAmenazas(v);}} placeholder="Descripción"/>
            <select value={a.tipo} onChange={e=>{const v=[...amenazas];v[i].tipo=e.target.value;setAmenazas(v);}}>
              <option value="100">100 Meteo</option><option value="101">101 ATC</option>
              <option value="102">102 Terreno</option><option value="103">103 Aeropuerto</option>
              <option value="104">104 Tráfico</option>
            </select>
            <select value={a.fase} onChange={e=>{const v=[...amenazas];v[i].fase=e.target.value as Threat["fase"];setAmenazas(v);}}>
              <option>Despegue</option><option>Crucero</option><option>Descenso</option>
            </select>
            <label className="chk">
              <input type="checkbox" checked={a.vinculaError}
                     onChange={e=>{const v=[...amenazas];v[i].vinculaError=e.target.checked;setAmenazas(v);}}/>
              &nbsp;Vinculado a error
            </label>
            <input  value={a.gestion} onChange={e=>{const v=[...amenazas];v[i].gestion=e.target.value;setAmenazas(v);}}
                    placeholder="Gestión tripulación" className="wide"/>
          </div>
        ))}
        <button type="button" className="btn-outline" onClick={addAmenaza}>+ Añadir amenaza</button>

        {/* errores */}
        <h2 className="section-title">Gestión de Errores</h2>
        {errores.map((er,i)=>(
          <div key={i} className="error-row">
            <input  className="input w-full" placeholder="Descripción"
                    value={er.descripcion}
                    onChange={e=>{const v=[...errores];v[i].descripcion=e.target.value;setErrores(v);}}/>
            <select className="select" value={er.fase}
                    onChange={e=>{const v=[...errores];v[i].fase=e.target.value as ErrorMx["fase"];setErrores(v);}}>
              <option>Despegue</option><option>Crucero</option><option>Descenso</option>
            </select>
           
            <select className="select" value={er.tipo}
                    onChange={e=>{const v=[...errores];v[i].tipo=e.target.value;setErrores(v);}}>
              <option value="300">300 Vuelo manual</option><option value="301">301 Controles</option>
              <option value="302">302 Automatización</option><option value="303">303 Manejo tierra</option>
              <option value="304">304 Sistemas/Radio</option><option value="399">399 Otros</option>
            </select>
            <select className="select" value={er.respuesta}
                    onChange={e=>{const v=[...errores];v[i].respuesta=e.target.value as ErrorMx["respuesta"];setErrores(v);}}>
              <option>Detectado</option><option>Sin respuesta</option>
            </select>
            <select className="select" value={er.resultado}
                    onChange={e=>{const v=[...errores];v[i].resultado=e.target.value as ErrorMx["resultado"];setErrores(v);}}>
              <option>Sin consecuencias</option><option>Estado no deseado</option><option>Error adicional</option>
            </select>
            <input className="input w-full" placeholder="Gestión tripulación"
                   value={er.gestion}
                   onChange={e=>{const v=[...errores];v[i].gestion=e.target.value;setErrores(v);}}/>
          </div>
        ))}
        <button type="button" className="btn-outline mt-3" onClick={addError}>+ Añadir error</button>

        {/* marcadores */}
        <h2 className="section-title">Marcadores de Desempeño (1-4)</h2>
        <PerformanceTable rating={rating} setRating={setRating} />

        <button type="submit" className="btn-primary w-full mt-6">Guardar observación</button>
      </form>
    </div>
  );
}

/* ---------- tabla de desempeño ---------- */
function PerformanceTable({
  rating, setRating,
}: { rating: PerfMarkers; setRating: (v: PerfMarkers)=>void }) {

  const filas = [
    { key: "briefing", label: "Planeación" },
    { key: "planes",   label: "Chequeo Cruzado" },
    { key: "conting",  label: "Gestión de contingencias" },
  ] as const;

  const cols = ["Pre-salida", "Despegue/Ascenso", "Descenso/Aterrizaje"];

  const upd = (row: keyof PerfMarkers, col: number, val: Rating) =>
    setRating({ ...rating, [row]: rating[row].map((n,i)=>(i===col?val:n)) });

  return (
    <table className="perf-table">
      <thead><tr><th></th>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {filas.map(f=>(
          <tr key={f.key}>
            <td>{f.label}</td>
            {rating[f.key].map((v,i)=>(
              <td key={i}>
                {[1,2,3,4].map(n=>(
                  <label key={n} className="radio">
                    <input type="radio" name={`${f.key}-${i}`}
                           value={n} checked={v===n}
                           onChange={()=>upd(f.key,i,n as Rating)}
                    />{n}
                  </label>
                ))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
