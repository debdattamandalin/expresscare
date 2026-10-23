import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

export function DoctorLogin() {
  const navigate = useNavigate();
  const setUserRole = useStore(state => state.setUserRole);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'doc1' && password === '12345678') {
      setUserRole('DOCTOR');
      navigate('/doctor/dashboard');
    } else {
      setError('Invalid staff credentials');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 min-h-[calc(100vh-3.5rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Restricted Access</span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-1">Doctor Portal</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Sign in to review clinical triage queue.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Staff ID</label>
            <input
              type="text"
              required
              value={id}
              onChange={e => setId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 font-mono"
              placeholder="doc1"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 font-mono"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>

        <p className="text-[11px] font-mono text-center text-neutral-400">
          Demo: Staff ID <code className="text-neutral-700">doc1</code> • Password <code className="text-neutral-700">12345678</code>
        </p>
      </motion.div>
    </div>
  );
}
