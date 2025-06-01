/* eslint-disable @typescript-eslint/no-explicit-any */
/* ---------------------------------------------------------------------------
   LOSAObservationForm.tsx ― Formulario LOSA-M
   ▸ Incluye TODAS las preguntas originales ▸ Añade la sección “Detalle observación”
   ▸ Mantiene estilos con form.css (form-wrapper, form-group, inline-options,…)
--------------------------------------------------------------------------- */
import { useState } from "react";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { db, auth } from "../firebase";
import "../form.css";

/* ───────────── 1. PREGUNTAS Y RESPUESTAS (idénticas) ───────────── */
/* 1.1 Condiciones de observación */
const ambienteTrabajo = ["Hangar", "Línea", "Otro"] as const;
const iluminacion = [
  "Luz natural día",
  "Amanecer/Anochecer",
  "Noche",
  "Nublado",
  "Luz artificial"
] as const;
const ambientales = [
  "Despejado",
  "Niebla",
  "Vientos",
  "Alta humedad",
  "Lluvioso",
  "Calor extremo",
  "Frío extremo",
  "Rayos/tormenta eléctrica",
  "Otro"
] as const;

/* 1.2 Técnico de mantenimiento */
const yesNoNA            = ["Sí", "No", "N/A"] as const;
const experienciaEscala  = ["Ninguno","1 a 6 meses","7 a 12 meses","1 a 3 años","3 a 5 años","5 años o más"] as const;
const frecuenciaTrabajo  = ["Primera vez","Diaria","Mensual","Trimestral","Semestral","Anual"] as const;

/* 1.3 Trabajo de mantenimiento (10 ítems) */
const riesgoPreguntas = [
  "Documentación actualizada (ej., formularios, AMM, boletines de servicio) disponible y revisada",
  "El personal muestra un comportamiento de trabajo adecuado",
  "Se logró la comunicación entre el personal técnico",
  "Se completó la rotación de tareas/turnos",
  "Firma en formulario del cumplimiento de cada paso realizado",
  "Aprobación de la inspección por parte de control calidad",
  "Herramientas / equipos identificados y asignados",
  "Materiales consumibles (grasas, O-ring, filtros) disponibles y vigentes",
  "Se recibió apoyo logístico y de supervisión cuando fue necesario",
  "Personal requerido disponible"
] as const;

const riesgoEscala = ["Sin Riesgo", "En Riesgo", "No Observado", "N/A"] as const;
const threatCodes  = [
  "Mx/A. Información","Mx/A1. No comprensible","Mx/A2. No disponible o inaccesible",
  "Mx/A3. Incorrecto","Mx/A4. Inadecuado","Mx/A5. Sin control",
  "Mx/A6. Demasiada información contradictoria","Mx/A7. Proceso de actualización complicado",
  "Mx/A8. Manual modificado incorrectamente","Mx/A9. Información no utilizada"
] as const;

/* ───────────── 2. Helpers UI ───────────── */
const Radios = ({ opts, field }: { opts: readonly string[]; field: any }) => (
  <>
    {opts.map((opt) => (
      <label key={opt} className="inline-flex items-center">
        <input
          type="radio"
          className="radio radio-sm"
          value={opt}
          checked={field.value === opt}
          onChange={() => field.onChange(opt)}
          name={field.name}
          ref={field.ref}
        />
        <span className="ml-1">{opt}</span>
      </label>
    ))}
  </>
);
const Checks = ({ opts, field }: { opts: readonly string[]; field: any }) => {
  const value: string[] = field.value || [];
  return (
    <>
      {opts.map((opt) => (
        <label key={opt} className="inline-flex items-center">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={value.includes(opt)}
            onChange={(e) =>
              field.onChange(
                e.target.checked
                  ? [...value, opt]
                  : value.filter((v) => v !== opt)
              )
            }
          />
          <span className="ml-1">{opt}</span>
        </label>
      ))}
    </>
  );
};

/* ───────────── 3. Componente principal ───────────── */
export default function LOSAObservationForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<any>({
    defaultValues: {
      iluminacion: [], ambientales: [],
      fecha:"", ubicacion:"", trabajoObs:"", observadoPor: auth.currentUser?.email ?? ""
    }
  });

  const onSubmit = async (raw: any) => {
    try {
      setSubmitting(true);
      /* agrupar r1…r10 para quitar puntos */
      const payload: any = { ...raw };
      for (let i = 1; i <= 10; i++) {
        const k = `r${i}`;
        payload[k] = {
          answer: raw[k],
          threatCode: raw[`${k}.threatCode`] ?? "",
          managed:   raw[`${k}.managed`] ?? "",
          comment:   raw[`${k}.comment`] ?? ""
        };
        delete payload[`${k}.threatCode`];
        delete payload[`${k}.managed`];
        delete payload[`${k}.comment`];
      }
      await addDoc(collection(db, "observations"), {
        payload,
        uid: auth.currentUser?.uid ?? null,
        observerEmail: auth.currentUser?.email ?? null,
        createdAt: Timestamp.now()
      });
      alert("¡Observación guardada con éxito!");
      navigate("/inspecciones");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.code}. Revisa la consola para más detalles.`);
    } finally { setSubmitting(false); }
  };

  /* ───────────── Render ───────────── */
  return (
    <div className="form-wrapper">
      <h1>Formulario LOSA-M</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* -------- DETALLE OBSERVACIÓN -------- */}
        <section>
          <h2>Detalle observación</h2>

          <div className="form-group">
            <p>Fecha</p>
            <input type="date" {...register("fecha",{required:"Requerido"})} className="input input-bordered" />
            {errors.fecha?.message && <p className="error-msg">{String(errors.fecha.message)}</p>}
          </div>

          <div className="form-group">
            <p>Ubicación</p>
            <input type="text" {...register("ubicacion",{required:"Requerido"})} className="input input-bordered input-half" />
            {errors.ubicacion?.message && <p className="error-msg">{String(errors.ubicacion.message)}</p>}
          </div>

          <div className="form-group">
            <p>Trabajo de mantenimiento observado</p>
            <input type="text" {...register("trabajoObs",{required:"Requerido"})} className="input input-bordered input-half" />
            {errors.trabajoObs?.message && <p className="error-msg">{String(errors.trabajoObs.message)}</p>}
          </div>

          <div className="form-group">
            <p>Observación realizada por</p>
            <input type="text" {...register("observadoPor",{required:"Requerido"})} className="input input-bordered input-half" />
            {errors.observadoPor?.message && <p className="error-msg">{String(errors.observadoPor.message)}</p>}
          </div>
        </section>

        {/* -------- 1. CONDICIONES -------- */}
        <section>
          <h2>Condiciones de observación</h2>

          <div className="form-group">
            <p>Ambiente de trabajo</p>
            <Controller name="ambiente" control={control} rules={{required:"Campo obligatorio"}}
              render={({field})=>(
                <div className="inline-options"><Radios opts={ambienteTrabajo} field={field}/></div>
              )}
            />
            {errors.ambiente?.message && <p className="error-msg">{String(errors.ambiente.message)}</p>}
          </div>

          <div className="form-group">
            <p>Condiciones de iluminación</p>
            <Controller name="iluminacion" control={control}
              render={({field})=>(
                <div className="inline-options grid-3"><Checks opts={iluminacion} field={field}/></div>
              )}
            />
          </div>

          <div className="form-group">
            <p>Condiciones ambientales</p>
            <Controller name="ambientales" control={control}
              render={({field})=>(
                <div className="inline-options grid-3"><Checks opts={ambientales} field={field}/></div>
              )}
            />
          </div>
        </section>

        {/* -------- 2. TÉCNICO -------- */}
        <section>
          <h2>Técnico de mantenimiento</h2>

          <div className="form-group">
            <p>Años de experiencia</p>
            <input {...register("experienceYears",{required:"Requerido"})} type="number" className="input input-bordered w-40" />
            {errors.experienceYears?.message && <p className="error-msg">{String(errors.experienceYears.message)}</p>}
          </div>

          {[
            {name:"comfortable", label:"¿Se siente cómodo con la tarea?"},
            {name:"qualified",  label:"¿Está calificado para la tarea?"}
          ].map(({name,label})=>(
            <div key={name} className="form-group">
              <p>{label}</p>
              <Controller name={name} control={control} rules={{required:"Campo obligatorio"}}
                render={({field})=>(<div className="inline-options"><Radios opts={yesNoNA} field={field}/></div>)}
              />
            </div>
          ))}

          {[
            {name:"aircraftExp", label:"Experiencia con el tipo de aeronave"},
            {name:"taskExp",    label:"Experiencia en esta tarea"}
          ].map(({name,label})=>(
            <div key={name} className="form-group">
              <p>{label}</p>
              <Controller name={name} control={control} rules={{required:"Campo obligatorio"}}
                render={({field})=>(<div className="inline-options grid-3"><Radios opts={experienciaEscala} field={field}/></div>)}
              />
            </div>
          ))}

          <div className="form-group">
            <p>Frecuencia con que realiza esta tarea</p>
            <Controller name="taskFreq" control={control} rules={{required:"Campo obligatorio"}}
              render={({field})=>(<div className="inline-options grid-3"><Radios opts={frecuenciaTrabajo} field={field}/></div>)}
            />
          </div>
        </section>

        {/* -------- 3. RIESGOS -------- */}
        <section>
          <h2>Observación del trabajo de mantenimiento</h2>

          {riesgoPreguntas.map((label,idx)=>{
            const key=`r${idx+1}`;
            return(
              <div key={key} className="form-group">
                <p>{idx+1}. {label}</p>
                <Controller name={key} control={control} rules={{required:"Campo obligatorio"}}
                  render={({field})=>(
                    <>
                      <div className="inline-options"><Radios opts={riesgoEscala} field={field}/></div>

                      {field.value==="En Riesgo" && (
                        <div className="mt-3 pl-4 border-l">
                          <p className="font-medium text-sm mb-1">Código de la amenaza:</p>
                          <Controller name={`${key}.threatCode`} control={control} rules={{required:"Selecciona un código"}}
                            render={({field:sub})=>(
                              <div className="inline-options grid-2"><Radios opts={threatCodes} field={sub}/></div>
                            )}
                          />

                          <p className="font-medium text-sm mt-2">¿Amenaza gestionada eficazmente?</p>
                          <Controller name={`${key}.managed`} control={control} rules={{required:"Campo obligatorio"}}
                            render={({field:sub})=>(<div className="inline-options"><Radios opts={["Sí","No","N/A"]} field={sub}/></div>)}
                          />

                          <textarea {...register(`${key}.comment`)}
                            placeholder="Comentarios sobre la amenaza"
                            className="textarea textarea-bordered w-full mt-2"
                          />
                        </div>
                      )}
                    </>
                  )}
                />
              </div>
            );
          })}
        </section>

        {/* -------- BOTÓN -------- */}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar observación"}
        </button>
      </form>
    </div>
  );
}
