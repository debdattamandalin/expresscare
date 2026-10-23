import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Lock, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

export function AdminLogin() {
  const navigate = useNavigate();
  const setUserRole = useStore(state => state.setUserRole);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'adm1' && password === '12345678') {
      setUserRole('ADMIN');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 min-h-[calc(100vh-4rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10 space-y-4">
          <div className="w-20 h-20 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500">Manage clinic operations and triage configuration.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldCheck size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={id}
                  onChange={e => setId(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="e.g. ADM-1234"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-black transition-colors"
          >
            Access Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
}
