import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ArrowRight, Clock, Users, CheckCircle2 } from 'lucide-react';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const patients = useStore(state => state.patients);
  const updatePatientStatus = useStore(state => state.updatePatientStatus);
  
  const waitingPatients = patients
    .filter(p => p.status === 'WAITING')
    .sort((a, b) => {
      if (a.priorityScore !== b.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
    });

  const activePatient = patients.find(p => p.status === 'BEING_SEEN');
  const currentPatient = activePatient || waitingPatients[0];
  const completedCount = patients.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Triage Queue</span>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">Priority Consultation Desk</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-neutral-200/90 px-3.5 py-1.5 rounded-lg flex items-center gap-2">
            <Users size={14} className="text-neutral-400" />
            <span className="text-xs text-neutral-500 font-medium">Waiting:</span>
            <span className="text-xs font-bold font-mono text-neutral-900">{waitingPatients.length}</span>
          </div>

          <div className="bg-white border border-neutral-200/90 px-3.5 py-1.5 rounded-lg flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs text-neutral-500 font-medium">Completed:</span>
            <span className="text-xs font-bold font-mono text-neutral-900">{completedCount}</span>
          </div>
        </div>
      </div>

      {currentPatient ? (
        <div className="bg-white border border-neutral-200/90 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Header Strip */}
          <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                  currentPatient.priorityScore >= 8 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : currentPatient.priorityScore >= 5 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Priority {currentPatient.priorityScore}/10
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Token {currentPatient.id}
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mt-2">
                {currentPatient.name && currentPatient.name !== 'Unknown' 
                  ? currentPatient.name 
                  : `Patient ${currentPatient.id}`}
              </h2>

              <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mt-1">
                <span>{currentPatient.age || 'Age unrecorded'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Arrived {new Date(currentPatient.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div>
              <button
                onClick={async () => {
                  if (currentPatient.status === 'WAITING') {
                    await updatePatientStatus(currentPatient.id, 'BEING_SEEN');
                  }
                  navigate(`/doctor/review/${currentPatient.id}`);
                }}
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>{activePatient ? 'Resume Consultation' : 'Accept Next Patient'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Complaint body */}
          <div className="p-6 space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Chief Complaint
              </span>
              <p className="text-base text-neutral-900 font-medium leading-relaxed bg-neutral-50 p-4 rounded-lg border border-neutral-200/60">
                "{currentPatient.complaint}"
              </p>
            </div>

            {currentPatient.aiNotes && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                  Intake Assessment
                </span>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {currentPatient.aiNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200/90 rounded-xl p-12 text-center text-neutral-500 text-xs">
          No patients waiting in queue.
        </div>
      )}
    </div>
  );
}
