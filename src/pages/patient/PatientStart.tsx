import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function PatientStart() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !gender) return;
    
    sessionStorage.setItem('patient_name', name);
    sessionStorage.setItem('patient_age', age);
    sessionStorage.setItem('patient_gender', gender);
    
    navigate('/patient/vitals');
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-6 flex flex-col justify-center min-h-[calc(100vh-3.5rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Step 01 / 03</span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-1">Patient Check-in</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Please provide basic identification before triage.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
              placeholder="e.g. Aarav Mehta"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="age" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                placeholder="Years"
                min="0"
                max="120"
                required
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                required
              >
                <option value="" disabled>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
              disabled={!name || !age || !gender}
            >
              Continue to Sensor Scan <ArrowRight size={15} />
            </button>
          </div>
        </form>

        <p className="text-[11px] text-center text-neutral-400">
          Biometrics calibrated for clinical intake • No records saved without consent
        </p>
      </motion.div>
    </div>
  );
}
