import { Outlet, Link } from 'react-router-dom';
import { Activity, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { espUsb } from '../../lib/espUsb';

export function MainLayout() {
  const [usbConnected, setUsbConnected] = useState(espUsb.getConnected());

  useEffect(() => {
    const handleStatus = (connected: boolean) => setUsbConnected(connected);
    espUsb.addListener(handleStatus);
    return () => espUsb.removeListener(handleStatus);
  }, []);

  const handleQuickConnect = async () => {
    if (!usbConnected) {
      await espUsb.connect();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-neutral-900 group">
            <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center">
              <Activity size={15} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-900">Express Care</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleQuickConnect}
              className={`flex items-center gap-1.5 text-[11px] font-mono tracking-tight px-2.5 py-1 rounded-md border transition-colors ${
                usbConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-neutral-100 hover:bg-neutral-200/70 text-neutral-600 border-neutral-200/70'
              }`}
              title="Pair ESP32 USB cable"
            >
              <Cpu size={12} className={usbConnected ? "text-emerald-600" : "text-neutral-500"} />
              <span>{usbConnected ? "ESP32 USB Active" : "Connect ESP32 USB"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export function ProtectedLayout({ role }: { role: 'DOCTOR' | 'ADMIN' }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <header className="border-b border-neutral-200/80 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 text-neutral-900">
              <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center">
                <Activity size={15} strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm tracking-tight">Express Care</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-mono text-neutral-500">
              {role === 'DOCTOR' ? 'Doctor Portal' : 'Admin Operations'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-neutral-600 font-medium">Dr. Sharma</span>
            </div>
            <Link 
              to="/" 
              className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
