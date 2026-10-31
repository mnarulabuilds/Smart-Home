import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import {
  Sliders,
  Flame,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Send,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../services/api.js';

export const SimulatorView: React.FC = () => {
  const { refreshData, simulateScenario } = useApp();

  const [temp, setTemp] = useState<number>(72);
  const [humidity, setHumidity] = useState<number>(45);
  const [light, setLight] = useState<number>(220);
  const [motion, setMotion] = useState<boolean>(false);
  const [ax, setAx] = useState<number>(0);
  const [ay, setAy] = useState<number>(0);
  const [az, setAz] = useState<number>(9.8);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [resultNotice, setResultNotice] = useState<string | null>(null);

  const handleCustomPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResultNotice(null);
    try {
      const response = await api.postSensorReading({
        temp,
        humidity,
        light,
        motion,
        ax,
        ay,
        az,
        timestamp: Date.now(),
      });
      await refreshData();
      if (response.alertsTriggered && response.alertsTriggered.length > 0) {
        setResultNotice(`⚠️ Ingested! Triggered ${response.alertsTriggered.length} alert(s): ${response.alertsTriggered.map((a: any) => a.title).join(', ')}`);
      } else {
        setResultNotice('✅ Ingested successfully. All telemetry within nominal thresholds.');
      }
    } catch (err: any) {
      setResultNotice(`❌ Ingestion error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setTemp(72);
    setHumidity(45);
    setLight(220);
    setMotion(false);
    setAx(0);
    setAy(0);
    setAz(9.8);
    setResultNotice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>IoT Hardware Simulator</span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
            Virtual Edge Device
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          Simulate real-world hardware telemetry packets and stress-test the anomaly detection engine.
        </p>
      </div>

      {resultNotice && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white flex items-center space-x-2">
          <span>{resultNotice}</span>
        </div>
      )}

      {/* Preset Emergency Scenarios */}
      <div className="glass-panel p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-white text-base">One-Click Emergency Scenarios</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => simulateScenario('FIRE')}
            className="p-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/50 text-left transition-all hover:scale-[1.02]"
          >
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 w-fit mb-2">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Simulate Fire Outbreak</h3>
            <p className="text-xs text-rose-300/80 mt-1">
              Temp: 135°F (≥125) • Humidity: 18% (≤30)
            </p>
            <span className="inline-block mt-2 text-[11px] font-bold text-rose-400">
              Triggers FIRE_ALERT →
            </span>
          </button>

          <button
            onClick={() => simulateScenario('INTRUDER')}
            className="p-4 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-800/50 text-left transition-all hover:scale-[1.02]"
          >
            <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400 w-fit mb-2">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Simulate Intruder</h3>
            <p className="text-xs text-red-300/80 mt-1">
              Indoor motion active while room is empty
            </p>
            <span className="inline-block mt-2 text-[11px] font-bold text-rose-400">
              Triggers INTRUDER_ALERT →
            </span>
          </button>

          <button
            onClick={() => simulateScenario('POWER_WASTE')}
            className="p-4 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/50 text-left transition-all hover:scale-[1.02]"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 w-fit mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Simulate Power Waste</h3>
            <p className="text-xs text-amber-300/80 mt-1">
              Light: 480 lux (≥375) with no occupants
            </p>
            <span className="inline-block mt-2 text-[11px] font-bold text-amber-400">
              Triggers POWER_ALERT →
            </span>
          </button>

          <button
            onClick={() => simulateScenario('NORMAL')}
            className="p-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/50 text-left transition-all hover:scale-[1.02]"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 w-fit mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Simulate Normal Room</h3>
            <p className="text-xs text-emerald-300/80 mt-1">
              72°F • 45% Humidity • 220 lux
            </p>
            <span className="inline-block mt-2 text-[11px] font-bold text-emerald-400">
              Normal Operation →
            </span>
          </button>
        </div>
      </div>

      {/* Manual Sensor Slider Controls */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-white text-base">Custom Edge Telemetry Injection</h2>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>

        <form onSubmit={handleCustomPush} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Temperature Slider */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Temperature</span>
                <span className="font-mono font-bold text-base text-amber-400">{temp}°F</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0°F</span>
                <span className="text-rose-400 font-semibold">Fire: ≥125°F</span>
                <span>200°F</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Relative Humidity</span>
                <span className="font-mono font-bold text-base text-sky-400">{humidity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span className="text-rose-400 font-semibold">Dry: ≤30%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Light Slider */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Ambient Light</span>
                <span className="font-mono font-bold text-base text-yellow-400">{light} lux</span>
              </div>
              <input
                type="range"
                min="0"
                max="800"
                step="5"
                value={light}
                onChange={(e) => setLight(Number(e.target.value))}
                className="w-full accent-yellow-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 lux</span>
                <span className="text-amber-400 font-semibold">Waste: ≥375 lux</span>
                <span>800 lux</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Motion Switch */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Indoor Motion Sensor (PIR)</p>
                <p className="text-[11px] text-slate-400">
                  Simulate human or object movement in the monitored zone
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMotion(!motion)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  motion
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {motion ? 'MOTION ACTIVE' : 'NO MOTION'}
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Ingesting...' : 'Push Telemetry Packet'}</span>
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};
