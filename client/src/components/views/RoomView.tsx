import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { DoorOpen, DoorClosed, Users, ShieldCheck, ShieldAlert, Zap, UserCheck, AlertCircle } from 'lucide-react';

export const RoomView: React.FC = () => {
  const { roomOccupancy, toggleRoomPresence, otrkKey, currentUser } = useApp();

  const isCurrentUserInRoom = roomOccupancy?.members.includes(otrkKey || '') || false;
  const occupantCount = roomOccupancy?.members.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Room Presence & Security</h1>
        <p className="text-sm text-slate-400">
          Synchronize occupant presence to coordinate motion intrusion alarms and energy management.
        </p>
      </div>

      {/* Main Interactive Room Card */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-2xl ${
              isCurrentUserInRoom
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isCurrentUserInRoom ? (
                <DoorOpen className="w-10 h-10" />
              ) : (
                <DoorClosed className="w-10 h-10" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  occupantCount > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {occupantCount > 0 ? 'Room Occupied' : 'Room Vacant'}
                </span>
                <span className="text-xs text-slate-400">
                  {occupantCount} {occupantCount === 1 ? 'Person' : 'People'} Present
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1.5">
                {isCurrentUserInRoom ? 'You are INSIDE this room' : 'You are OUTSIDE this room'}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-lg">
                {isCurrentUserInRoom
                  ? 'Motion alarms are disabled for room members. Lighting is kept active.'
                  : 'Leaving the room arms intrusion detection. Any PIR movement will trigger a security alert.'}
              </p>
            </div>
          </div>

          {/* Toggle Action Button */}
          <button
            onClick={() => toggleRoomPresence()}
            className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center space-x-3 shrink-0 ${
              isCurrentUserInRoom
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 hover:scale-105'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40 hover:scale-105'
            }`}
          >
            {isCurrentUserInRoom ? (
              <>
                <DoorClosed className="w-5 h-5" />
                <span>EXIT ROOM (I Am Leaving)</span>
              </>
            ) : (
              <>
                <DoorOpen className="w-5 h-5" />
                <span>ENTER ROOM (I Am Here)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Logic Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Intrusion Protection Logic */}
        <div className="glass-panel p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Intruder Anomaly Guard</h3>
              <p className="text-xs text-slate-400">PIR radar vs. active room membership</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When the room has 0 registered occupants, any indoor motion reading flags an immediate <span className="text-rose-400 font-bold">INTRUDER_ALERT</span> incident. When members click "ENTER ROOM", motion is classified as normal activity and alarms remain silent.
          </p>
        </div>

        {/* Power Waste Logic */}
        <div className="glass-panel p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Energy Conservation Guard</h3>
              <p className="text-xs text-slate-400">Illumination tracking vs. room vacancy</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            If ambient light stays elevated (≥ 375 lux) while everyone has exited the room, the backend identifies power wastage and triggers a <span className="text-amber-400 font-bold">POWER_ALERT</span> to activate automated power cutoff.
          </p>
        </div>

      </div>

      {/* Current Occupant Details */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Current Registered Members in Room</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Room ID: {roomOccupancy?.roomId || 'default'}
          </span>
        </div>

        {roomOccupancy?.members && roomOccupancy.members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {roomOccupancy.members.map((memberId) => (
              <div
                key={memberId}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center space-x-3"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {memberId === otrkKey ? (currentUser ? currentUser.name : 'You (Current User)') : memberId}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{memberId}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2">
            No occupants are currently registered as inside. The room is secured.
          </p>
        )}
      </div>
    </div>
  );
};
