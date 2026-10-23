import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export function TokenDisplay() {
  const patients = useStore((state) => state.patients);
  
  // Real-time clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const waitingPatients = patients.filter(p => p.status === 'WAITING').sort((a, b) => {
    if (a.priorityScore !== b.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
  });

  const nowServing = patients.find(p => p.status === 'BEING_SEEN');
  const nextInLine = waitingPatients[0];

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center bg-gray-800 border-b border-gray-700">
        <h1 className="text-4xl font-bold text-gray-100 tracking-tight">Express Care</h1>
        <div className="text-3xl font-medium text-gray-300">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <main className="flex-1 flex p-8 gap-8">
        {/* Left Side - Now Serving */}
        <div className="flex-[2] flex flex-col gap-8">
          <div className="flex-1 bg-gray-800 rounded-3xl border border-gray-700 p-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-8 left-8 text-2xl font-medium text-gray-400 uppercase tracking-widest">
              Now Serving
            </div>
            
            <AnimatePresence mode="wait">
              {nowServing ? (
                <motion.div
                  key={nowServing.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="text-[12rem] font-bold text-emerald-400 leading-none tracking-tighter"
                >
                  {nowServing.id}
                </motion.div>
              ) : (
                <motion.div
                  key="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-6xl font-medium text-gray-500"
                >
                  Please wait...
                </motion.div>
              )}
            </AnimatePresence>
            
            {nowServing && (
              <div className="absolute bottom-12 text-3xl text-gray-400">
                Please proceed to Doctor's Cabin
              </div>
            )}
          </div>
          
          {/* Next in line banner */}
          <div className="bg-gray-800 rounded-3xl border border-gray-700 p-8 flex items-center justify-between">
            <span className="text-3xl text-gray-400">Next:</span>
            <span className="text-5xl font-bold text-white">{nextInLine?.id || '---'}</span>
          </div>
        </div>

        {/* Right Side - Queue Information */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-gray-800 rounded-3xl border border-gray-700 p-8 flex-1">
            <h2 className="text-2xl font-medium text-gray-400 uppercase tracking-widest mb-8">Waiting Queue</h2>
            
            <div className="space-y-4">
              {waitingPatients.slice(1, 7).map((p) => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-xl">
                  <span className="text-3xl font-medium text-gray-200">{p.id}</span>
                </div>
              ))}
              
              {waitingPatients.length > 7 && (
                <div className="text-center text-gray-500 text-xl pt-4">
                  + {waitingPatients.length - 7} more waiting
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer Ticker */}
      <footer className="bg-primary-900 text-primary-100 py-4 px-8 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee text-xl">
          Welcome to Express Care. Please wait for your token number to be announced. If you experience sudden chest pain or severe difficulty breathing, please inform the staff immediately.
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}} />
    </div>
  );
}
