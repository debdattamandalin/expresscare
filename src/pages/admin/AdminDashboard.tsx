import { useStore } from '../../store/useStore';
import { Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AdminDashboard() {
  const patients = useStore(state => state.patients);
  const [avgWaitMins, setAvgWaitMins] = useState(0);
  
  useEffect(() => {
    const calculateWaitTime = () => {
      const waiting = patients.filter(p => p.status === 'WAITING');
      if (waiting.length === 0) {
        setAvgWaitMins(0);
        return;
      }
      const now = new Date().getTime();
      const total = waiting.reduce((acc, p) => acc + (now - new Date(p.arrivalTime).getTime()), 0);
      setAvgWaitMins(Math.round((total / waiting.length) / 60000));
    };
    
    calculateWaitTime();
    const interval = setInterval(calculateWaitTime, 60000);
    return () => clearInterval(interval);
  }, [patients]);

  const totalPatients = patients.length;
  const urgentCount = patients.filter(p => p.priorityScore >= 8).length;
  const priorityCount = patients.filter(p => p.priorityScore >= 5 && p.priorityScore < 8).length;
  const completedCount = patients.filter(p => p.status === 'COMPLETED').length;
  
  const hourlyData = Array(7).fill(0);
  const currentHour = new Date().getHours();
  
  patients.forEach(p => {
    const arrivalDate = new Date(p.arrivalTime);
    if (arrivalDate.getDate() === new Date().getDate()) {
      const hourDiff = currentHour - arrivalDate.getHours();
      if (hourDiff >= 0 && hourDiff < 7) {
        const index = 6 - hourDiff;
        hourlyData[index]++;
      }
    }
  });

  const maxPatientsPerHour = Math.max(...hourlyData, 5);
  const isHighPriorityAnomaly = totalPatients >= 5 && ((urgentCount + priorityCount) / totalPatients > 0.4);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Clinic Analytics</span>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">Operational Overview</h1>
      </div>

      {isHighPriorityAnomaly && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-800">
            <span className="font-semibold">Elevated triage severity detected:</span> {urgentCount} urgent and {priorityCount} priority cases are active.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Patients Today</span>
            <Users size={14} />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">{totalPatients}</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Avg Wait</span>
            <Clock size={14} />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {avgWaitMins} <span className="text-xs font-sans text-neutral-400 font-normal">min</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Urgent Cases</span>
            <AlertTriangle size={14} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600">{urgentCount}</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Completed</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">{completedCount}</div>
        </div>
      </div>

      {/* Hourly Chart Minimal */}
      <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
          Intake Volume (Past 7 Hours)
        </span>

        <div className="h-36 flex items-end gap-3 pt-4 border-b border-neutral-100">
          {hourlyData.map((count, i) => {
            const heightPct = Math.max((count / maxPatientsPerHour) * 100, 4);
            const hour = (currentHour - (6 - i) + 24) % 24;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono text-neutral-400">{count}</span>
                <div 
                  className="w-full bg-neutral-900 rounded-t-sm transition-all"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] font-mono text-neutral-400 mt-1">{hour}:00</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
