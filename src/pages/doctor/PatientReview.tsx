import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  ArrowLeft, 
  Check, 
  Heart, 
  Activity, 
  Thermometer,
  FileText
} from 'lucide-react';

export function PatientReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = useStore(state => state.patients.find(p => p.id === id));
  const updatePatientStatus = useStore(state => state.updatePatientStatus);
  const isLoading = useStore(state => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20 text-neutral-500 text-sm">
        Patient token not found or already completed.
      </div>
    );
  }

  const vitalsEntry = patient.keyAnswers?.find(a => a.startsWith('Vitals:'));
  let hr = '72';
  let spo2 = '98';
  let temp = '98.6';

  if (vitalsEntry) {
    const hrMatch = vitalsEntry.match(/HR\s+(\d+)/);
    const spo2Match = vitalsEntry.match(/SpO2\s+(\d+)/);
    const tempMatch = vitalsEntry.match(/Temp\s+([0-9.]+)/);
    if (hrMatch) hr = hrMatch[1];
    if (spo2Match) spo2 = spo2Match[1];
    if (tempMatch) temp = tempMatch[1];
  }

  const aiBulletPoints = (patient.aiNotes || '')
    .split(/(?:[.\n]+|\s*-\s*|\s*\d+\.\s*)/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Queue
        </button>

        <button 
          onClick={async () => {
            await updatePatientStatus(patient.id, 'COMPLETED');
            navigate('/doctor/dashboard');
          }}
          className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Check size={14} /> Complete & Call Next
        </button>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {patient.name && patient.name !== 'Unknown' ? patient.name : `Token ${patient.id}`}
              </h1>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                patient.priorityScore >= 8 
                  ? 'bg-red-50 text-red-700 border-red-200' 
                  : patient.priorityScore >= 5 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                P-{patient.priorityScore}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono mt-1.5">
              <span>Token: {patient.id}</span>
              <span>•</span>
              <span>{patient.age || 'Age unrecorded'}</span>
              <span>•</span>
              <span>Arrived {new Date(patient.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Queue Status</span>
            <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">
              {patient.status}
            </span>
          </div>
        </div>
      </div>

      {/* Vitals Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Heart Rate</span>
            <Heart size={14} className="text-neutral-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {hr} <span className="text-xs font-sans text-neutral-400 font-normal">BPM</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Blood Oxygen</span>
            <Activity size={14} className="text-neutral-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {spo2}<span className="text-xs font-sans text-neutral-400 font-normal">%</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Body Temp</span>
            <Thermometer size={14} className="text-neutral-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {temp}<span className="text-xs font-sans text-neutral-400 font-normal">°F</span>
          </div>
        </div>
      </div>

      {/* Main Clinical Data: Two Column Minimal Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 1/3: Chief complaint */}
        <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
            Reported Chief Complaint
          </span>
          <p className="text-sm font-medium text-neutral-900 leading-relaxed">
            "{patient.complaint}"
          </p>
        </div>

        {/* Right 2/3: AI Pointwise Triage Summary */}
        <div className="md:col-span-2 bg-white border border-neutral-200/90 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-neutral-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Pointwise Intake Assessment
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              Model confidence: {patient.aiConfidence}
            </span>
          </div>

          <ul className="space-y-2.5">
            {aiBulletPoints.length > 0 ? (
              aiBulletPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-neutral-700 leading-relaxed">
                  <span className="text-neutral-400 font-mono text-[10px] mt-0.5">0{index + 1}</span>
                  <span className="flex-1">{point}.</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-neutral-500 italic">
                {patient.aiNotes || "No specific contraindications recorded."}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
