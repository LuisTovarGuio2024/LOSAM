// src/pages/ObservationListPage.tsx
import "../listpage.css";
import ObservationList from "../components/ObservationList";

export default function ObservationListPage() {
  return (
    <main className="listpage">
      

      {/* tabla de observaciones */}
      <ObservationList />
    </main>
  );
}
