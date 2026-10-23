import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function PatientResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');
  const patient = useStore(state => state.patients.find(p => p.id === id));
  const isLoading = useStore(state => state.isLoading);
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!patient) return <div className="text-center py-20 text-gray-500">Patient not found. Token may have expired.</div>;

  const isUrgent = patient.priorityScore >= 8;

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className={`p-8 text-white ${isUrgent ? 'bg-red-500' : 'bg-primary-600'}`}>
          <div className="flex justify-center mb-6">
            {isUrgent ? (
              <AlertCircle size={64} className="text-red-100" />
            ) : (
              <CheckCircle2 size={64} className="text-primary-100" />
            )}
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-medium text-white/80 uppercase tracking-widest">Your Token</h2>
            <div className="text-7xl font-bold tracking-tighter">{patient.id}</div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold text-gray-900">
              {isUrgent ? 'Prompt attention needed' : 'You are in the queue'}
            </h3>
            <p className="text-gray-600 text-lg">
              {isUrgent 
                ? 'Your symptoms need prompt attention. Please remain near the clinic staff. Your token has been moved forward.' 
                : 'Please have a seat in the waiting area. Watch the screen for your token number.'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Priority Score</span>
              <span className={`font-semibold ${isUrgent ? 'text-red-600' : 'text-primary-600'}`}>
                {patient.priorityScore}/10
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Est. Queue Position</span>
              <span className="font-semibold text-gray-900">
                {isUrgent ? 'Next available doctor' : '~3 patients ahead'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => navigate(`/patient/token?id=${patient.id}`)}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
          >
            Save Token <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
