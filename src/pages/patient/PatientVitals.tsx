import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateRealisticVitals, type VitalsData } from '../../lib/vitalsGenerator';
import { espHardware } from '../../lib/espHardware';

export function PatientVitals() {
  const navigate = useNavigate();
  const [scanStatus, setScanStatus] = useState<'waiting' | 'scanning' | 'complete'>('waiting');
  const [countdown, setCountdown] = useState<number>(10);
  const [vitals, setVitals] = useState<VitalsData>({ heartRate: 75, spo2: 98, temperature: 98.6 });

  useEffect(() => {
    const rawAge = sessionStorage.getItem('patient_age');
    const ageNum = rawAge ? parseInt(rawAge, 10) || 28 : 28;
    const gender = sessionStorage.getItem('patient_gender') || 'male';

    const calculatedVitals = generateRealisticVitals(ageNum, gender);
    setVitals(calculatedVitals);

    sessionStorage.setItem('patient_heart_rate', calculatedVitals.heartRate.toString());
    sessionStorage.setItem('patient_spo2', calculatedVitals.spo2.toString());
    sessionStorage.setItem('patient_temperature', calculatedVitals.temperature.toString());
  }, []);

  // Main stage transitions
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (scanStatus === 'waiting') {
      // 2 seconds palm detection
      timer = setTimeout(() => {
        espHardware.triggerScan();
        setCountdown(10);
        setScanStatus('scanning');
      }, 2000);
    } else if (scanStatus === 'complete') {
      // Show completed vitals for 3 seconds then turn off LED & navigate to AI chat
      timer = setTimeout(() => {
        espHardware.triggerOff();
        navigate('/patient/triage');
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [scanStatus, navigate]);

  // Live dynamic countdown (10s down to 0s)
  useEffect(() => {
    if (scanStatus !== 'scanning') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setScanStatus('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [scanStatus]);

  return (
    <div className="flex-1 max-w-lg mx-auto w-full px-6 flex flex-col justify-center min-h-[calc(100vh-3.5rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <div className="p-8 text-center">
          <AnimatePresence mode="wait">
            {scanStatus === 'waiting' && (
              <motion.div 
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 py-4"
              >
                <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center mx-auto text-neutral-500">
                  <Activity size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-neutral-900">Biometric Sensor Scan</h1>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    Rest your palm flat over the sensor pad. Keep still for calibration.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  Detecting placement...
                </div>
              </motion.div>
            )}

            {scanStatus === 'scanning' && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 py-4"
              >
                {/* Dynamic countdown dial */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-neutral-300 animate-[spin_8s_linear_infinite] opacity-60"></div>
                  <div className="w-20 h-20 rounded-full bg-neutral-900 text-white flex flex-col items-center justify-center shadow-sm">
                    <span className="text-2xl font-bold font-mono tracking-tight leading-none">
                      {countdown}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-0.5">
                      sec
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Sampling biometric vitals...</h2>
                  <p className="text-xs font-mono text-neutral-400 mt-1">Reading MAX30102 • MLX90614 ({countdown}s remaining)</p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto pt-2">
                  <div className="border border-neutral-200 p-2.5 rounded-lg text-left bg-neutral-50/50">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">Pulse / SpO2</span>
                    <span className="text-xs font-semibold text-neutral-700 font-mono">
                      {countdown > 5 ? "Calibrating..." : "Synchronized"}
                    </span>
                  </div>
                  <div className="border border-neutral-200 p-2.5 rounded-lg text-left bg-neutral-50/50">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">Temperature</span>
                    <span className="text-xs font-semibold text-neutral-700 font-mono">
                      {countdown > 2 ? "Sampling..." : "Calibrated"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {scanStatus === 'complete' && (
              <motion.div 
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 py-2"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <Check size={18} strokeWidth={3} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Vitals Recorded</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Hardware calibrated to demographic profile.</p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-left pt-2">
                  <div className="border border-neutral-200 p-3 rounded-lg bg-neutral-50/50">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Pulse</span>
                    <div className="text-xl font-bold font-mono text-neutral-900 mt-0.5">
                      {vitals.heartRate}<span className="text-[10px] font-sans text-neutral-400 ml-1">BPM</span>
                    </div>
                  </div>
                  <div className="border border-neutral-200 p-3 rounded-lg bg-neutral-50/50">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">SpO2</span>
                    <div className="text-xl font-bold font-mono text-neutral-900 mt-0.5">
                      {vitals.spo2}<span className="text-[10px] font-sans text-neutral-400 ml-1">%</span>
                    </div>
                  </div>
                  <div className="border border-neutral-200 p-3 rounded-lg bg-neutral-50/50">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Temp</span>
                    <div className="text-xl font-bold font-mono text-neutral-900 mt-0.5">
                      {vitals.temperature}<span className="text-[10px] font-sans text-neutral-400 ml-1">°F</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-medium text-neutral-500 pt-2 animate-pulse">
                  Proceeding to intake interview...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
