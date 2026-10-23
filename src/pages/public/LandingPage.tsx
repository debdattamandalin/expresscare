import { Link } from 'react-router-dom';
import { User, Stethoscope, Settings, MonitorPlay } from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full text-center space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            The right patient.<br />At the right time.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-assisted triage for clinics where every minute and every doctor matters.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-8">
          <Link 
            to="/patient" 
            className="group flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">I am a Patient</h2>
            <p className="text-gray-500 mt-2 text-sm text-center">Start your triage process</p>
          </Link>

          <Link 
            to="/doctor/login" 
            className="group flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Doctor Login</h2>
            <p className="text-gray-500 mt-2 text-sm text-center">Access patient queue</p>
          </Link>

          <Link 
            to="/admin/login" 
            className="group flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="w-16 h-16 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Clinic Admin</h2>
            <p className="text-gray-500 mt-2 text-sm text-center">Manage clinic operations</p>
          </Link>
        </div>

        <div className="pt-12">
          <Link 
            to="/token"
            target="_blank"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <MonitorPlay size={20} />
            <span>Open Public Token Display</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
