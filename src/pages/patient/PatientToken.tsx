import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { QrCode, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export function PatientToken() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const patient = useStore(state => state.patients.find(p => p.id === id));
  
  if (!patient) return <div>Token not found</div>;

  return (
    <div className="flex-1 max-w-md mx-auto w-full p-6 flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Live Token</h1>
        <Link to="/" className="p-2 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full">
          <Home size={20} />
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col"
      >
        <div className="p-8 flex-1 flex flex-col items-center justify-center border-b border-gray-100 border-dashed">
          <span className="text-gray-500 uppercase tracking-widest text-sm font-medium mb-2">Token Number</span>
          <div className="text-7xl font-bold text-gray-900 tracking-tighter mb-8">{patient.id}</div>
          
          <div className="w-48 h-48 bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-center mb-8">
            <QrCode size={120} className="text-gray-300" />
          </div>

          <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
            patient.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 
            patient.priority === 'PRIORITY' ? 'bg-amber-100 text-amber-700' : 
            'bg-emerald-100 text-emerald-700'
          }`}>
            {patient.priority}
          </div>
        </div>

        <div className="bg-gray-50 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Status</span>
            <span className="font-medium text-gray-900">{patient.status}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Arrival Time</span>
            <span className="font-medium text-gray-900">
              {new Date(patient.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </motion.div>
      
      <p className="text-center text-sm text-gray-400 mt-6">
        Take a screenshot of this page or keep it open.
      </p>
    </div>
  );
}
