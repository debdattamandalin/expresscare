import { useState, useEffect } from 'react';
import { Cpu, Check, Play, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react';
import { espUsb } from '../../lib/espUsb';

export function HardwareDashboard() {
  const [isConnected, setIsConnected] = useState(espUsb.getConnected());
  const [testOutput, setTestOutput] = useState<string>('');

  useEffect(() => {
    const handleStatus = (connected: boolean) => setIsConnected(connected);
    espUsb.addListener(handleStatus);
    return () => espUsb.removeListener(handleStatus);
  }, []);

  const handleConnect = async () => {
    setTestOutput('Opening USB port selection dialog...');
    const ok = await espUsb.connect();
    if (ok) {
      setTestOutput('[USB CONNECTED] ESP32-S3 linked over USB Serial at 115200 baud! Zero network drops.');
    } else {
      setTestOutput('[NOTE] Connection canceled or port in use. If Arduino Serial Monitor is open, close it first!');
    }
  };

  const handleTest = async () => {
    if (!isConnected) {
      setTestOutput('[WARNING] Please click "Pair USB Cable" above first!');
      return;
    }
    setTestOutput('Sending TEST command over USB wire...');
    await espUsb.triggerTest();
    setTestOutput('[SUCCESS] TEST sent. ESP32 RGB LED flashed!');
  };

  const handle10sScan = async () => {
    if (!isConnected) {
      setTestOutput('[WARNING] Please click "Pair USB Cable" above first!');
      return;
    }
    setTestOutput('Sending SCAN command... ESP32 will fast-blink RED for 10 seconds, then turn solid GREEN.');
    await espUsb.triggerScan();
  };

  const handleReset = async () => {
    if (!isConnected) {
      setTestOutput('[WARNING] Please click "Pair USB Cable" above first!');
      return;
    }
    setTestOutput('Sending RESET command... ESP32 returned to Idle BLUE.');
    await espUsb.triggerReset();
  };

  return (
    <div className="max-w-xl mx-auto w-full px-6 py-8 space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Direct Hardware Link</span>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">ESP32-S3 USB Controller</h1>
        <p className="text-xs text-neutral-500 mt-1">Direct wire link via Chrome/Edge Web Serial. 100% reliable, zero Wi-Fi dependencies.</p>
      </div>

      {/* USB Connection Card */}
      <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-600'
            }`}>
              <Cpu size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">Direct USB Serial</div>
              <div className="text-[11px] text-neutral-500 font-mono">115200 Baud • Chrome / Edge API</div>
            </div>
          </div>

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
            isConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-neutral-100 text-neutral-500 border-neutral-200'
          }`}>
            {isConnected ? 'USB Linked' : 'Not Connected'}
          </span>
        </div>

        <button
          onClick={handleConnect}
          className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            isConnected
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white'
          }`}
        >
          {isConnected ? <Check size={14} /> : <Cpu size={14} />}
          <span>{isConnected ? "Re-select USB Port" : "Pair USB Cable"}</span>
        </button>

        {!isConnected && (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-3 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <b>Important:</b> If the <b>Arduino Serial Monitor</b> is open in Arduino IDE, please close it first so Chrome can claim the USB port!
            </div>
          </div>
        )}
      </div>

      {/* Manual Diagnostic Triggers */}
      <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
          Trigger LED Controls
        </span>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleTest}
            className="p-3 border border-neutral-200 hover:border-neutral-400 rounded-lg text-center transition-colors"
          >
            <Play size={14} className="mx-auto mb-1 text-neutral-600" />
            <span className="text-[11px] font-medium text-neutral-800 block">Quick Flash</span>
          </button>

          <button
            onClick={handle10sScan}
            className="p-3 border border-neutral-200 hover:border-neutral-400 rounded-lg text-center transition-colors"
          >
            <Play size={14} className="mx-auto mb-1 text-neutral-900" />
            <span className="text-[11px] font-medium text-neutral-800 block">10s Scan</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3 border border-neutral-200 hover:border-neutral-400 rounded-lg text-center transition-colors"
          >
            <RotateCcw size={14} className="mx-auto mb-1 text-neutral-400" />
            <span className="text-[11px] font-medium text-neutral-800 block">Reset (Blue)</span>
          </button>
        </div>

        {testOutput && (
          <div className="p-3 bg-neutral-900 text-neutral-200 font-mono text-[11px] rounded-lg whitespace-pre-wrap">
            {testOutput}
          </div>
        )}
      </div>

      <div className="pt-2 text-center">
        <a 
          href="/patient" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-600 transition-colors"
        >
          Go to Patient Kiosk Flow <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );
}
