import React from 'react';

interface Phase {
  id: number;
  name: string;
  description: string;
  progress: number;
}

interface PhaseTrackerProps {
  currentPhase: number;
  phaseProgress: number;
  phases?: Phase[];
}

const defaultPhases: Phase[] = [
  { id: 1, name: 'Initial Contact', description: 'First client interaction and requirements gathering', progress: 25 },
  { id: 2, name: 'Proposal Development', description: 'Creating and refining the project proposal', progress: 50 },
  { id: 3, name: 'Contract Negotiation', description: 'Finalizing terms and conditions', progress: 75 },
  { id: 4, name: 'Project Execution', description: 'Active project implementation', progress: 100 },
];

export function PhaseTracker({ currentPhase, phaseProgress, phases = defaultPhases }: PhaseTrackerProps) {
  const activePhase = phases.find(phase => phase.id === currentPhase) || phases[0];

  return (
    <div className="space-y-6">
      <h2 className="text-[#101418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Phase Tracker
      </h2>
      
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-6 justify-between">
          <p className="text-[#101418] text-base font-medium leading-normal">
            Phase {activePhase.id}: {activePhase.name}
          </p>
          <span className="text-sm text-[#5c728a]">
            {phaseProgress}%
          </span>
        </div>
        <div className="rounded bg-[#d4dbe2] h-3 overflow-hidden">
          <div 
            className="h-full rounded bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${phaseProgress}%` }}
          />
        </div>
        <p className="text-[#5c728a] text-sm font-normal leading-normal">
          {activePhase.description}
        </p>
      </div>

      {/* Phase Overview */}
      <div className="px-4 space-y-3">
        <h3 className="text-[#101418] text-lg font-semibold">All Phases</h3>
        <div className="space-y-2">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                phase.id === currentPhase
                  ? 'bg-blue-50 border border-blue-200'
                  : phase.id < currentPhase
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  phase.id === currentPhase
                    ? 'bg-blue-600 text-white'
                    : phase.id < currentPhase
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {phase.id < currentPhase ? '✓' : phase.id}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  phase.id === currentPhase
                    ? 'text-blue-900'
                    : phase.id < currentPhase
                    ? 'text-green-900'
                    : 'text-gray-700'
                }`}>
                  {phase.name}
                </p>
                <p className="text-xs text-gray-500">{phase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}