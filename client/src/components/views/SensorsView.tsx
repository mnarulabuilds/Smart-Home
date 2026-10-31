import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import {
  Thermometer,
  Droplets,
  Sun,
  Activity,
  Compass,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

export const SensorsView: React.FC = () => {
  const { latestSensor, sensorHistory } = useApp();
  const [useCelsius, setUseCelsius] = useState(false);

  const rawTemp = latestSensor ? latestSensor.temp : 72;
  const displayTemp = useCelsius ? ((rawTemp - 32) * 5) / 9 : rawTemp;
  const tempUnit = useCelsius ? '°C' : '°F';

  const humidity = latestSensor ? latestSensor.humidity : 45;
  const light = latestSensor ? latestSensor.light : 220;
  const motion = latestSensor ? latestSensor.motion : false;

  const ax = latestSensor?.ax ?? 0;
  const ay = latestSensor?.ay ?? 0;
  const az = latestSensor?.az ?? 9.8;
  const netMagnitude = Math.sqrt(ax * ax + ay * ay + az * az).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header with Unit Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Sensor Telemetry</h1>
          <p className="text-sm text-slate-400">
            Real-time multisensory stream from microcontrollers & IoT edge nodes.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start">
          <button
            onClick={() => setUseCelsius(false)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              !useCelsius ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fahrenheit (°F)
          </button>
          <button
            onClick={() => setUseCelsius(true)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              useCelsius ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Celsius (°C)
          </button>
        </div>
      </div>

      {/* Main Sensor Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Temperature Detail */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Thermal Probe
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{displayTemp.toFixed(1)}</span>
            <span className="text-lg font-bold text-slate-400">{tempUnit}</span>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Fire Hazard Trigger:</span>
              <span className="text-rose-400 font-bold">≥ {useCelsius ? '51.7 °C' : '125 °F'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Thermal Comfort:</span>
              <span className="text-emerald-400 font-bold">{useCelsius ? '20 - 24 °C' : '68 - 75 °F'}</span>
            </div>
          </div>
        </div>

        {/* Humidity Detail */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hygrometer
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Droplets className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{humidity.toFixed(1)}</span>
            <span className="text-lg font-bold text-slate-400">% RH</span>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Dry / Combustion Limit:</span>
              <span className="text-rose-400 font-bold">≤ 30%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Range:</span>
              <span className="text-emerald-400 font-bold">35% - 55%</span>
            </div>
          </div>
        </div>

        {/* Ambient Light Detail */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Photometer
            </span>
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Sun className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-white">{Math.round(light)}</span>
            <span className="text-lg font-bold text-slate-400">lux</span>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Power Waste Threshold:</span>
              <span className="text-amber-400 font-bold">≥ 375 lux (unoccupied)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Standard Illumination:</span>
              <span className="text-slate-200 font-bold">150 - 300 lux</span>
            </div>
          </div>
        </div>

      </div>

      {/* Motion & 3-Axis Accelerometer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Motion Visualizer */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">PIR Motion Radar</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              motion ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {motion ? 'ACTIVE MOTION' : 'NO MOTION'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Radar Circles */}
              <div className={`absolute inset-0 rounded-full border ${
                motion ? 'border-rose-500/40 animate-radar' : 'border-slate-800'
              }`} />
              <div className={`absolute inset-4 rounded-full border ${
                motion ? 'border-rose-500/60 animate-ping' : 'border-slate-800/80'
              }`} />
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                motion
                  ? 'bg-rose-600 text-white shadow-rose-600/40 scale-110'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                <Activity className="w-8 h-8" />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
              {latestSensor?.latestMovement
                ? `Latest movement event logged at ${new Date(latestSensor.latestMovement).toLocaleTimeString()}`
                : 'No movement registered in current session'}
            </p>
          </div>
        </div>

        {/* 3-Axis IMU Accelerometer */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">3-Axis Accelerometer (IMU)</h3>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              |G| = {netMagnitude} m/s²
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-400 block mb-1">X-Axis</span>
              <span className="text-xl font-black text-blue-400 font-mono">
                {ax.toFixed(2)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-400 block mb-1">Y-Axis</span>
              <span className="text-xl font-black text-indigo-400 font-mono">
                {ay.toFixed(2)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-400 block mb-1">Z-Axis</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {az.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Measures structural vibration, tilt, and tamper acceleration. Baseline gravity vector is ~9.81 m/s² along Z.
          </p>
        </div>

      </div>

      {/* Historical Telemetry Stream Table */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Recent Sensor Log</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {sensorHistory.length} Samples in Window
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Humidity</th>
                <th className="py-3 px-4">Light</th>
                <th className="py-3 px-4">Motion</th>
                <th className="py-3 px-4">Accel (X, Y, Z)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sensorHistory.slice(-10).reverse().map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors font-mono">
                  <td className="py-2.5 px-4 text-slate-300">
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-100">
                    {r.temp.toFixed(1)}°F
                  </td>
                  <td className="py-2.5 px-4 text-sky-400">
                    {r.humidity.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-yellow-400">
                    {Math.round(r.light)} lux
                  </td>
                  <td className="py-2.5 px-4">
                    {r.motion ? (
                      <span className="text-rose-400 font-bold">YES</span>
                    ) : (
                      <span className="text-slate-500">NO</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    ({r.ax ?? 0}, {r.ay ?? 0}, {r.az ?? 9.8})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
