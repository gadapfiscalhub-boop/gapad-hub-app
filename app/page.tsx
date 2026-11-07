import { Suspense } from 'react';
import MobileDashboard from './dashboard/MobileDashboard';

export default function RootPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060b13]" />}>
      <MobileDashboard />
    </Suspense>
  );
}
