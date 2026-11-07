import { Suspense } from "react";
import ConferirCargaClient from "./ConferirCargaClient";

export default function ConferirCargaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060b13] flex items-center justify-center text-slate-400 text-xs">
          Carregando conferência de carga...
        </div>
      }
    >
      <ConferirCargaClient />
    </Suspense>
  );
}
