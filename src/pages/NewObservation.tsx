// src/pages/NewObservation.tsx

import LOSAInspectionForm from "../components/LOSAInspectionForm";


export default function NewObservation() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="page-title">Nueva inspección LOSA-M</h1>
      </header>

      {/* Aquí va tu formulario real */}
      <LOSAInspectionForm />
    </div>
  );
}


