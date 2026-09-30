import React from 'react';
import { RuntimeEvent, RuntimeCheckpoint, AgentRun } from '../../../types/ai';
import { 
  IconPlay, 
  IconPause, 
  IconRefreshCw, 
  IconChevronLeft, 
  IconChevronRight, 
  IconCheckCircle, 
  IconLock, 
  IconShield,
  IconClock
} from '../../../components/Icons';

interface RuntimeReplayControllerProps {
  run: AgentRun;
  events: RuntimeEvent[];
  checkpoints: RuntimeCheckpoint[];
  replayStep: number;
  isPlaying: boolean;
  onSetReplayStep: (step: number) => void;
  onTogglePlay: () => void;
}

export const RuntimeReplayController: React.FC<RuntimeReplayControllerProps> = ({
  run,
  events,
  checkpoints,
  replayStep,
  isPlaying,
  onSetReplayStep,
  onTogglePlay
}) => {
  const currentEvent = events[replayStep] || events[0];
  const maxSteps = Math.max(events.length - 1, 0);

  return (
    <div className="space-y-6">
      {/* Replay Controls Strip */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
              <h3 className="text-sm font-extrabold tracking-tight text-white">
                Observable State Replay & Time Travel Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reconstruct and inspect execution state transitions over durable event sequences without private CoT.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSetReplayStep(Math.max(0, replayStep - 1))}
              disabled={replayStep === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Step Backward"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-primary-600/30 transition-all"
            >
              {isPlaying ? <IconPause className="w-3.5 h-3.5" /> : <IconPlay className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Replay' : 'Play Sequence'}</span>
            </button>

            <button
              onClick={() => onSetReplayStep(Math.min(maxSteps, replayStep + 1))}
              disabled={replayStep >= maxSteps}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Step Forward"
            >
              <IconChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSetReplayStep(0)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              title="Reset to Inception"
            >
              <IconRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrubber Range Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Step {replayStep + 1} of {events.length}</span>
            <span>Sequence #{currentEvent?.sequence || 1} ({currentEvent?.timestamp || '00:00'})</span>
          </div>

          <input
            type="range"
            min={0}
            max={maxSteps}
            value={replayStep}
            onChange={(e) => onSetReplayStep(Number(e.target.value))}
            className="w-full accent-primary-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Reconstructed State Snapshot Inspector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Reconstructed Observable State at Sequence #{currentEvent?.sequence || 1}
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {currentEvent?.type || 'AgentRunCreated'}
            </h4>
          </div>

          <span className="font-mono text-xs text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/40 px-3 py-1 rounded-xl">
            Timestamp: {currentEvent?.timestamp || '00:00:00'}
          </span>
        </div>

        {/* State Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Target Context</span>
            <div className="font-bold text-slate-900 dark:text-white">
              {run.targetEntityName} ({run.targetEntityType})
            </div>
            <div className="text-[11px] text-slate-500">Agent: {run.agentName} ({run.agentVersion})</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Event Category Payload</span>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
              {JSON.stringify(currentEvent, null, 2)}
            </div>
          </div>
        </div>

        {/* Checkpoint Alignment */}
        {checkpoints.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Associated Durable Checkpoints ({checkpoints.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {checkpoints.map(chk => (
                <div key={chk.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-2">
                  <IconCheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">{chk.nodeName || 'State Snapshot'}</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">{chk.snapshotSummary}</p>
                    <span className="text-[9px] font-mono text-slate-400">Sequence #{chk.sequence} · {chk.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
