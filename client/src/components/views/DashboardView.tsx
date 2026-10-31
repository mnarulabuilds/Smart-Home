import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { MetricCard } from '../MetricCard.js';
import {
  Thermometer,
  Droplets,
  Sun,
  Activity,
  DoorOpen,
  DoorClosed,
  Flame,
  ShieldAlert,
  Zap,
  Users,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    latestSensor,
    roomOccupancy,
    toggleRoomPresence,
    activeAlerts,
    setActiveTab,
    simulateScenario,
    currentUser,
    otrkKey,
  } = useApp();

  const temp = latestSensor ? latestSensor.temp : 72;
  const humidity = latestSensor ? latestSensor.humidity : 45;
  const light = latestSensor ? latestSensor.light : 220;
  const motion = latestSensor ? latestSensor.motion : false;

  // Temperature status
  const tempStatus = temp >= 125 ? 'danger' : temp >= 95 ? 'warning' : 'normal';
  const tempLabel = temp >= 125 ? 'Fire Risk' : temp >= 95 ? 'Elevated' : 'Optimal';

  // Humidity status
  const humStatus = humidity <= 30 ? 'warning' : 'normal';
  const humLabel = humidity <= 30 ? 'Dry Air' : 'Comfortable';

  // Light status
  const lightStatus = light >= 375 ? 'warning' : 'normal';
  const lightLabel = light >= 375 ? 'High / Waste Risk' : 'Normal';

  const isRoomOccupied = roomOccupancy?.isOccupied || false;
  const isCurrentUserInRoom =
    roomOccupancy?.members.includes(otrkKey || '') || false;

  return (
    <div className="space-y-6">
      {/* Welcome & System State Banner */}
      <div className="glass-panel p-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                System Active
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              Welcome, {currentUser ? currentUser.name : 'Authorized User'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-sensor anomaly detection running. Sprinklers, intruder alarms, and power management armed.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold transition-all shadow-md"
            >
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>IoT Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/30"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{activeAlerts.length} Active Alerts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sensor Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Room Temperature"
          value={temp.toFixed(1)}
          unit="°F"
          icon={<Thermometer className="w-5 h-5 text-amber-400" />}
          statusText={tempLabel}
          statusType={tempStatus}
          percentage={(temp / 150) * 100}
          subtext={`Threshold: 125°F`}
          onClick={() => setActiveTab('sensors')}
        />

        <MetricCard
          title="Relative Humidity"
          value={humidity.toFixed(1)}
          unit="%"
          icon={<Droplets className="w-5 h-5 text-sky-400" />}
          statusText={humLabel}
          statusType={humStatus}
          percentage={humidity}
          subtext={`Threshold: ≤30%`}
          onClick={() => setActiveTab('sensors')}
        />

        <MetricCard
          title="Ambient Illuminance"
          value={Math.round(light)}
          unit="lux"
          icon={<Sun className="w-5 h-5 text-yellow-400" />}
          statusText={lightLabel}
          statusType={lightStatus}
          percentage={(light / 500) * 100}
          subtext={`Threshold: 375 lux`}
          onClick={() => setActiveTab('sensors')}
        />

        <MetricCard
          title="Motion Detection"
          value={motion ? 'MOTION' : 'CLEAR'}
          icon={<Activity className={`w-5 h-5 ${motion ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />}
          statusText={motion ? 'Movement Detected' : 'All Still'}
          statusType={motion ? 'danger' : 'normal'}
          subtext={
            latestSensor?.latestMovement
              ? `Last: ${new Date(latestSensor.latestMovement).toLocaleTimeString()}`
              : 'No recent motion'
          }
          onClick={() => setActiveTab('sensors')}
        />
      </div>

      {/* Room Occupancy & Quick Presence Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Presence Card */}
        <div className="lg:col-span-2 glass-panel p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Presence & Security State
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Smart Room Occupancy</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
                isRoomOccupied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <Users className="w-3.5 h-3.5" />
                <span>{roomOccupancy?.members.length || 0} Occupants</span>
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isCurrentUserInRoom
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700'
              }`}>
                {isCurrentUserInRoom ? (
                  <DoorOpen className="w-7 h-7" />
                ) : (
                  <DoorClosed className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">Your Presence Status</p>
                <p className="text-lg font-extrabold text-white">
                  {isCurrentUserInRoom ? 'You are INSIDE the room' : 'You are OUTSIDE the room'}
                </p>
                <p className="text-xs text-slate-400">
                  {isCurrentUserInRoom
                    ? 'Security system knows you are inside. Intrusion alerts are safely suppressed.'
                    : 'Room marked as unattended. Motion will trigger intrusion alerts.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleRoomPresence()}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2 ${
                isCurrentUserInRoom
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isCurrentUserInRoom ? (
                <>
                  <DoorClosed className="w-4 h-4" />
                  <span>EXIT ROOM</span>
                </>
              ) : (
                <>
                  <DoorOpen className="w-4 h-4" />
                  <span>ENTER ROOM</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Simulation Trigger Bar */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Instant Scenario Test Injection
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => simulateScenario('NORMAL')}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-slate-200">Normal</p>
                <p className="text-[10px] text-slate-400">72°F, 45% Hum, 220lx</p>
              </button>

              <button
                onClick={() => simulateScenario('FIRE')}
                className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 text-left transition-colors"
              >
                <Flame className="w-4 h-4 text-rose-400 mb-1" />
                <p className="text-xs font-bold text-rose-200">Fire Hazard</p>
                <p className="text-[10px] text-rose-400/80">135°F, 18% Hum</p>
              </button>

              <button
                onClick={() => simulateScenario('INTRUDER')}
                className="p-3 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-left transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 mb-1" />
                <p className="text-xs font-bold text-red-200">Intrusion</p>
                <p className="text-[10px] text-red-400/80">Motion in empty room</p>
              </button>

              <button
                onClick={() => simulateScenario('POWER_WASTE')}
                className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/40 text-left transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-400 mb-1" />
                <p className="text-xs font-bold text-amber-200">Power Waste</p>
                <p className="text-[10px] text-amber-400/80">480 lux without members</p>
              </button>
            </div>
          </div>
        </div>

        {/* Live Alerts Stream Card */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Alerts Feed</h3>
              <button
                onClick={() => setActiveTab('alerts')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                View History
              </button>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">All Systems Nominal</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  No active anomalies detected across fire sensors, intrusion radar, or lighting circuits.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{a.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Sensors Ingested</span>
            <span className="font-semibold text-slate-200">Every 1-3 seconds</span>
          </div>
        </div>

      </div>
    </div>
  );
};
