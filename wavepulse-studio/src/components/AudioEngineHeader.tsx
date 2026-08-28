import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Activity,
  HelpCircle,
  Cpu,
  Radio,
  Zap,
  Info,
  Sliders,
  Volume2,
} from 'lucide-react';

interface AudioEngineHeaderProps {
  audioContextState: AudioContextState;
  sampleRate?: number;
  isMicActive: boolean;
  isPlaying: boolean;
  onToggleMicrophone: () => void;
}

export const AudioEngineHeader: React.FC<AudioEngineHeaderProps> = ({
  audioContextState,
  sampleRate = 44100,
  isMicActive,
  isPlaying,
  onToggleMicrophone,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <header
      id="audio-studio-header"
      className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:px-6 shadow-2xl flex flex-wrap items-center justify-between gap-4 text-slate-200"
    >
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              WaveStudio <span className="text-cyan-400 font-mono text-xs font-normal px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">Web Audio DSP</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Interactive Audio-Visualizer & Playlist Workstation
          </p>
        </div>
      </div>

      {/* Center / Right: Audio Engine Telemetry & Actions */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Telemetry Capsule */}
        <div className="hidden md:flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                audioContextState === 'running' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-400 uppercase text-[10px]">{audioContextState}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 text-[11px]">{sampleRate / 1000} kHz</span>
          <span className="text-slate-600">|</span>
          <span className="text-fuchsia-400 text-[11px]">32-bit Float</span>
        </div>

        {/* Live Microphone Visualizer Toggle */}
        <button
          id="toggle-mic-input-btn"
          onClick={onToggleMicrophone}
          title={isMicActive ? 'Disconnect Microphone' : 'Enable Live Microphone Input'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isMicActive
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse'
              : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-400" />}
          <span>{isMicActive ? 'Mic Active' : 'Live Mic In'}</span>
        </button>

        {/* Web Audio API Guide & Info Modal */}
        <button
          id="open-guide-modal-btn"
          onClick={() => setShowInfoModal(true)}
          title="Web Audio Architecture Guide & Shortcuts"
          className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 transition-all hover:scale-105"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Web Audio Architecture & Guide Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-5 text-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-bold text-base">
                  Web Audio API Engine & Canvas Visualizer Architecture
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            {/* Architecture Node Diagram */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 font-mono text-xs">
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">
                Audio Processing Node Graph:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-white">
                  MediaElementSource / Mic
                </span>
                <span className="text-cyan-400">➔</span>
                <span className="bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-cyan-800">
                  5-Band BiquadFilter EQ
                </span>
                <span className="text-cyan-400">➔</span>
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-white">
                  StereoPannerNode
                </span>
                <span className="text-cyan-400">➔</span>
                <span className="bg-fuchsia-950 text-fuchsia-300 px-2 py-1 rounded border border-fuchsia-800">
                  AnalyserNode (FFT)
                </span>
                <span className="text-cyan-400">➔</span>
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-white">
                  GainNode (Master)
                </span>
                <span className="text-cyan-400">➔</span>
                <span className="bg-emerald-950 text-emerald-300 px-2 py-1 rounded border border-emerald-800">
                  AudioDestination
                </span>
              </div>
            </div>

            {/* Concepts explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                <span className="font-semibold text-cyan-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 60 FPS Decoupled Rendering
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Real-time visualizers poll the <code className="text-cyan-400">AnalyserNode</code> directly in a <code>requestAnimationFrame</code> loop without triggering React component re-renders, guaranteeing ultra-low latency and zero UI lag.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                <span className="font-semibold text-fuchsia-300 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" /> Audio Slicing & WAV Export
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Extracts PCM sub-buffers from the decoded <code>AudioBuffer</code> and encodes standard 16-bit stereo WAV files client-side using binary DataView headers.
                </p>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Keyboard Shortcuts
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Play / Pause</span>
                  <kbd className="bg-slate-800 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">Space</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Drop Marker</span>
                  <kbd className="bg-slate-800 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">M</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Toggle Slicer</span>
                  <kbd className="bg-slate-800 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">S</kbd>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
