import SOSController from '@/components/sos/SOSController';

export const metadata = {
  title: 'Core SOS Alert Engine — NirbhayaShield',
};

export default function SOSPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white">Core SOS Alert Engine</h1>
        <p className="text-slate-400 text-xs">
          Track Card #21: Rapid, consent-driven alert system with Supabase Realtime location stream and encrypted audio vault.
        </p>
      </div>

      <SOSController />
    </div>
  );
}
