import SOSController from '@/components/sos/SOSController';

export const metadata = {
  title: 'Core SOS Alert Engine — RakshaShield',
};

export default function SOSPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white">Core SOS Alert Engine</h1>
      </div>

      <SOSController />
    </div>
  );
}
