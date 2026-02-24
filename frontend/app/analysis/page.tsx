import { Suspense } from "react";
import AnalysisContent from "./components/AnalysisContent";

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-6xl animate-pulse">🎮</div>
        <p className="text-white/50 text-sm mt-4">로딩 중...</p>
      </main>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
