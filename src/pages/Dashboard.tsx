import LOSAInspectionForm from "../components/LOSAInspectionForm";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Formulario de Inspección LOSA-M</h1>
      <LOSAInspectionForm />
    </div>
  );
}

