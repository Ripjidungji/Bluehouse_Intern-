import React, { useState } from 'react';
import {
  EqualizerBands,
  EqualizerPreset,
} from '../types';
import { EQ_PRESETS } from '../hooks/useAudioPlayer';
import {
  Sliders,
  Sparkles,
  Volume2,
  Radio,
  Music,
  Zap,
} from 'lucide-react';

interface EqualizerPanelProps {
  eqBands: EqualizerBands;
  eqPreset: EqualizerPreset;
  pan: number;
  playbackRate: number;
  onSetEqBand: (band: keyof EqualizerBands, val: number) => void;
  onApplyPreset: (preset: EqualizerPreset) => void;
  onSetPan: (val: number) => void;
  onSetPlaybackRate: (val: number) => void;
  onPlaySynthTone: (freq: number, type?: OscillatorType, duration?: number) => void;
}

const EQ_BAND_CONFIG: Array<{
  key: keyof EqualizerBands;
  label: string;
  sublabel: string;
  color: string;
}> = [
  { key: 'sub60', label: '60 Hz', sublabel: 'Sub Bass', color: '#06b6d4' },
  { key: 'low250', label: '250 Hz', sublabel: 'Punch & Warmth', color: '#3b82f6' },
  { key: 'mid1k', label: '1 kHz', sublabel: 'Mid Vocals', color: '#10b981' },
  { key: 'high4k', label: '4 kHz', sublabel: 'Presence / Bite', color: '#f59e0b' },
  { key: 'air12k', label: '12 kHz', sublabel: 'Air / Brilliance', color: '#ec4899' },
];

const PRESET_LIST: Array<{ id: EqualizerPreset; name: string }> = [
  { id: 'flat', name: 'Flat / Bypass' },
  { id: 'bass_boost', name: 'Bass Booster' },
  { id: 'club_dance', name: 'Club / EDM' },
  { id: 'vocal_clarity', name: 'Vocal Clarity' },
  { id: 'rock_punch', name: 'Rock / Punch' },
  { id: 'lofi_chill', name: 'Lo-Fi Tape' },
  { id: 'electronic_warmth', name: 'Electro Warmth' },
  { id: 'treble_boost', name: 'Treble Boost' },
];

export const EqualizerPanel: React.FC<EqualizerPanelProps> = ({
  eqBands,
  eqPreset,
  pan,
  playbackRate,
  onSetEqBand,
  onApplyPreset,
  onSetPan,
  onSetPlaybackRate,
  onPlaySynthTone,
}) => {
  const [testToneFreq, setTestToneFreq] = useState<number>(440);
  const [testToneType, setTestToneType] = useState<OscillatorType>('sine');

  return (
    <div
      id="equalizer-dsp-panel"
      className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6 text-slate-200"
    >
      {/* Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white tracking-wide">5-Band Parametric EQ & DSP Studio</h3>
        </div>

        {/* EQ Preset Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full">
          {PRESET_LIST.map((p) => {
            const isSelected = eqPreset === p.id;
            return (
              <button
                key={p.id}
                id={`eq-preset-${p.id}`}
                onClick={() => onApplyPreset(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Band Slider Stage */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
        {EQ_BAND_CONFIG.map((band) => {
          const val = eqBands[band.key];
          return (
            <div key={band.key} className="flex flex-col items-center gap-3">
              {/* dB value */}
              <span
                className="font-mono text-xs font-bold"
                style={{ color: val === 0 ? '#94a3b8' : band.color }}
              >
                {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)} dB
              </span>

              {/* Vertical Slider Wrapper */}
              <div className="relative h-36 flex items-center justify-center">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={val}
                  onChange={(e) => onSetEqBand(band.key, parseFloat(e.target.value))}
                  className="w-32 h-1.5 -rotate-90 origin-center accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer appearance-none focus:outline-none"
                />
              </div>

              {/* Band Label */}
              <div className="text-center">
                <p className="text-xs font-semibold text-white font-mono">{band.label}</p>
                <p className="text-[10px] text-slate-500 hidden sm:block">{band.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary DSP: Stereo Pan, Speed, and Synthesizer Tone Tester */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
        {/* Stereo Balance (Panner) */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Stereo Pan
            </span>
            <span className="font-mono text-cyan-300">
              {pan === 0 ? 'Center' : pan < 0 ? `L ${Math.round(Math.abs(pan) * 100)}%` : `R ${Math.round(pan * 100)}%`}
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={pan}
            onChange={(e) => onSetPan(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>LEFT</span>
            <button onClick={() => onSetPan(0)} className="hover:text-cyan-400">RESET</button>
            <span>RIGHT</span>
          </div>
        </div>

        {/* Playback Speed Rate */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Playback Speed
            </span>
            <span className="font-mono text-amber-300">{playbackRate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={playbackRate}
            onChange={(e) => onSetPlaybackRate(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.5x</span>
            <button onClick={() => onSetPlaybackRate(1.0)} className="hover:text-amber-400">1.0x (NORMAL)</button>
            <span>2.0x</span>
          </div>
        </div>

        {/* Test Tone & Frequency Synth Generator */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Radio className="w-3.5 h-3.5 text-fuchsia-400" /> Signal Generator
            </span>
            <span className="font-mono text-fuchsia-300">{testToneFreq} Hz</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="60"
              max="2000"
              step="10"
              value={testToneFreq}
              onChange={(e) => setTestToneFreq(parseInt(e.target.value))}
              className="flex-1 accent-fuchsia-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <select
              value={testToneType}
              onChange={(e) => setTestToneType(e.target.value as OscillatorType)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="sine">Sine</option>
              <option value="sawtooth">Saw</option>
              <option value="triangle">Tri</option>
              <option value="square">Square</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPlaySynthTone(testToneFreq, testToneType, 0.4)}
              className="flex-1 py-1 rounded-lg bg-fuchsia-950/60 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-700/50 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
            >
              <Sparkles className="w-3 h-3" /> Test Tone
            </button>
            <button
              onClick={() => {
                // Play quick triad arpeggio
                [testToneFreq, testToneFreq * 1.25, testToneFreq * 1.5].forEach((f, i) => {
                  setTimeout(() => onPlaySynthTone(f, testToneType, 0.35), i * 140);
                });
              }}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
            >
              Triad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
