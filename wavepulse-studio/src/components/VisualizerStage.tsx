import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  VisualizerConfig,
  VisualizerMode,
  VisualizerTheme,
  AudioEngineMetrics,
} from '../types';
import {
  Activity,
  BarChart2,
  Disc,
  Layers,
  Compass,
  Gauge,
  Grid,
  Maximize2,
  Minimize2,
  Camera,
  Eye,
  Zap,
  Sliders,
} from 'lucide-react';

interface VisualizerStageProps {
  isPlaying: boolean;
  isMicActive: boolean;
  trackTitle?: string;
  artistName?: string;
  getByteFrequencyData: (arr: Uint8Array) => void;
  getByteTimeDomainData: (arr: Uint8Array) => void;
  getAudioMetrics: () => AudioEngineMetrics;
  config: VisualizerConfig;
  onConfigChange: (newConfig: Partial<VisualizerConfig>) => void;
}

const THEME_PALETTES: Record<
  VisualizerTheme,
  {
    name: string;
    bg: string;
    colors: string[];
    accent: string;
    glow: string;
  }
> = {
  cyber_neon: {
    name: 'Cyber Neon',
    bg: '#090d16',
    colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'],
    accent: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.45)',
  },
  sunset_amber: {
    name: 'Sunset Amber',
    bg: '#140c09',
    colors: ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7'],
    accent: '#f97316',
    glow: 'rgba(249, 115, 22, 0.45)',
  },
  emerald_matrix: {
    name: 'Emerald Matrix',
    bg: '#05120c',
    colors: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'],
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
  },
  electric_violet: {
    name: 'Electric Violet',
    bg: '#0d0918',
    colors: ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#6366f1'],
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.45)',
  },
  ice_cyan: {
    name: 'Ice Cyan',
    bg: '#071217',
    colors: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'],
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
  },
  crimson_pulse: {
    name: 'Crimson Pulse',
    bg: '#16070a',
    colors: ['#dc2626', '#ef4444', '#f87171', '#f43f5e', '#fb7185'],
    accent: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.45)',
  },
};

const MODE_OPTIONS: Array<{
  id: VisualizerMode;
  label: string;
  icon: React.ElementType;
}> = [
  { id: 'spectrum_bars', label: 'Frequency Bars', icon: BarChart2 },
  { id: 'oscilloscope_glow', label: 'Oscilloscope', icon: Activity },
  { id: 'radial_mandala', label: 'Radial Mandala', icon: Disc },
  { id: 'spectrogram_waterfall', label: 'Spectrogram', icon: Layers },
  { id: 'dual_stereo_phase', label: 'Phase Scope', icon: Compass },
  { id: 'vu_peak_meter', label: 'VU Meters', icon: Gauge },
  { id: 'cyber_grid', label: '3D Cyber Grid', icon: Grid },
];

export const VisualizerStage: React.FC<VisualizerStageProps> = ({
  isPlaying,
  isMicActive,
  trackTitle = 'No Track Selected',
  artistName = 'Ready to play',
  getByteFrequencyData,
  getByteTimeDomainData,
  getAudioMetrics,
  config,
  onConfigChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [metrics, setMetrics] = useState<AudioEngineMetrics>({
    rms: 0,
    peak: 0,
    bassEnergy: 0,
    midEnergy: 0,
    trebleEnergy: 0,
    spectralCentroid: 0,
  });

  // State refs for animation loop
  const peaksRef = useRef<number[]>([]);
  const particlesRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; hue: number }>
  >([]);
  const waterfallHistoryRef = useRef<ImageData | null>(null);
  const vuNeedleLeftRef = useRef(0);
  const vuNeedleRightRef = useRef(0);
  const gridPhaseRef = useRef(0);
  const rotationAngleRef = useRef(0);

  // High-frequency metrics throttle for React UI HUD
  const lastMetricsUpdateRef = useRef(0);

  // Capture canvas screenshot
  const handleScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `audio-visualizer-${config.mode}-${Date.now()}.png`;
    a.click();
  }, [config.mode]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(console.error);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Main 60 FPS Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let freqBuffer = new Uint8Array(512);
    let timeBuffer = new Uint8Array(512);

    const render = (time: number) => {
      animId = requestAnimationFrame(render);

      // Handle canvas resize
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      if (width === 0 || height === 0) return;

      // Ensure buffer sizes
      const fftBinCount = config.fftSize / 2;
      if (freqBuffer.length !== fftBinCount) {
        freqBuffer = new Uint8Array(fftBinCount);
        timeBuffer = new Uint8Array(fftBinCount);
      }

      // Fetch latest Web Audio data
      getByteFrequencyData(freqBuffer);
      getByteTimeDomainData(timeBuffer);

      // Throttle React HUD metrics (10 times per second)
      if (time - lastMetricsUpdateRef.current > 100) {
        lastMetricsUpdateRef.current = time;
        const currentMetrics = getAudioMetrics();
        setMetrics(currentMetrics);
      }

      const theme = THEME_PALETTES[config.theme] || THEME_PALETTES.cyber_neon;

      // Clear Canvas Background
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);

      // Render Active Mode
      switch (config.mode) {
        case 'spectrum_bars':
          renderSpectrumBars(ctx, width, height, freqBuffer, theme, config, peaksRef);
          break;
        case 'oscilloscope_glow':
          renderOscilloscope(ctx, width, height, timeBuffer, theme, config);
          break;
        case 'radial_mandala':
          renderRadialMandala(ctx, width, height, freqBuffer, theme, config, rotationAngleRef, particlesRef);
          break;
        case 'spectrogram_waterfall':
          renderSpectrogram(ctx, width, height, freqBuffer, theme, waterfallHistoryRef);
          break;
        case 'dual_stereo_phase':
          renderStereoPhase(ctx, width, height, timeBuffer, freqBuffer, theme);
          break;
        case 'vu_peak_meter':
          renderVuMeters(ctx, width, height, freqBuffer, timeBuffer, theme, vuNeedleLeftRef, vuNeedleRightRef);
          break;
        case 'cyber_grid':
          renderCyberGrid(ctx, width, height, freqBuffer, theme, gridPhaseRef);
          break;
        default:
          renderSpectrumBars(ctx, width, height, freqBuffer, theme, config, peaksRef);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [config, getAudioMetrics, getByteFrequencyData, getByteTimeDomainData]);

  return (
    <div
      ref={containerRef}
      id="visualizer-stage-container"
      className="relative flex flex-col w-full h-full min-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300"
    >
      {/* Visualizer Canvas */}
      <canvas
        ref={canvasRef}
        id="audio-visualizer-canvas"
        className="w-full h-full flex-1 block cursor-crosshair"
      />

      {/* Overlay: Top Bar Header & Mode Selector */}
      <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Track Title / Live State */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isPlaying || isMicActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
            }`}
          />
          <div>
            <h2 className="text-white font-semibold text-sm sm:text-base tracking-wide line-clamp-1 drop-shadow-md">
              {isMicActive ? '🎤 Live Microphone Visualizer' : trackTitle}
            </h2>
            <p className="text-slate-400 text-xs tracking-wider">
              {isMicActive ? 'Real-time Audio Input Active' : artistName}
            </p>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg overflow-x-auto max-w-full">
          {MODE_OPTIONS.map((mode) => {
            const Icon = mode.icon;
            const isActive = config.mode === mode.id;
            return (
              <button
                key={mode.id}
                id={`visualizer-mode-btn-${mode.id}`}
                onClick={() => onConfigChange({ mode: mode.id })}
                title={mode.label}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls: Theme / Config / Fullscreen / Screenshot */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Settings Drawer Toggle */}
          <button
            id="toggle-visualizer-settings-btn"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            title="Visualizer Settings & Themes"
            className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
              showSettingsDrawer
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-700/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Screenshot capture */}
          <button
            id="visualizer-screenshot-btn"
            onClick={handleScreenshot}
            title="Capture Canvas Snapshot"
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all hover:scale-105"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            id="visualizer-fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-700/60 backdrop-blur-md transition-all hover:scale-105"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Overlay: Real-Time Audio Energy HUD (Bottom Left) */}
      {config.showEnergyHud && (
        <div className="absolute bottom-4 left-4 pointer-events-none z-10 flex flex-col gap-1.5 bg-slate-950/75 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 shadow-lg text-xs font-mono text-slate-300">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Zap className="w-3 h-3" /> SUB-BASS
            </span>
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${Math.min(100, metrics.bassEnergy * 150)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Activity className="w-3 h-3" /> MID FREQ
            </span>
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-75"
                style={{ width: `${Math.min(100, metrics.midEnergy * 130)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1 text-fuchsia-400 font-semibold">
              <Eye className="w-3 h-3" /> TREBLE
            </span>
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-fuchsia-400 transition-all duration-75"
                style={{ width: `${Math.min(100, metrics.trebleEnergy * 140)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
            <span>RMS: {(metrics.rms * 100).toFixed(0)}%</span>
            <span>PEAK: {(metrics.peak * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Settings & Themes Floating Drawer */}
      {showSettingsDrawer && (
        <div className="absolute top-16 right-4 w-80 max-h-[80%] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-20 text-slate-200 text-xs flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-semibold text-white tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Visualizer Customizer
            </h3>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          {/* Color Palettes */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium tracking-wider uppercase text-[10px]">
              Color Palette
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(THEME_PALETTES) as VisualizerTheme[]).map((themeKey) => {
                const t = THEME_PALETTES[themeKey];
                const isSelected = config.theme === themeKey;
                return (
                  <button
                    key={themeKey}
                    id={`theme-btn-${themeKey}`}
                    onClick={() => onConfigChange({ theme: themeKey })}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex h-3 w-full rounded-md overflow-hidden gap-0.5">
                      {t.colors.slice(0, 3).map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-[10px] truncate w-full text-center">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FFT & Smoothing */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>FFT Resolution (Bins)</span>
                <span className="text-cyan-400 font-mono">{config.fftSize}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {([512, 1024, 2048, 4096] as const).map((fft) => (
                  <button
                    key={fft}
                    onClick={() => onConfigChange({ fftSize: fft })}
                    className={`py-1 rounded-lg border text-center font-mono transition-all ${
                      config.fftSize === fft
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {fft}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Smoothing Constant</span>
                <span className="text-cyan-400 font-mono">{config.smoothing.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={config.smoothing}
                onChange={(e) => onConfigChange({ smoothing: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Sensitivity / Gain</span>
                <span className="text-cyan-400 font-mono">{config.sensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={config.sensitivity}
                onChange={(e) => onConfigChange({ sensitivity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Bar Count for Spectrum */}
            {config.mode === 'spectrum_bars' && (
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Frequency Bar Count</span>
                  <span className="text-cyan-400 font-mono">{config.barCount}</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="160"
                  step="8"
                  value={config.barCount}
                  onChange={(e) => onConfigChange({ barCount: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-300">Peak Hold Indicators</span>
              <input
                type="checkbox"
                checked={config.peakHold}
                onChange={(e) => onConfigChange({ peakHold: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-300">Mirror / Symmetric Mode</span>
              <input
                type="checkbox"
                checked={config.mirrorMode}
                onChange={(e) => onConfigChange({ mirrorMode: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-300">Real-Time Energy HUD</span>
              <input
                type="checkbox"
                checked={config.showEnergyHud}
                onChange={(e) => onConfigChange({ showEnergyHud: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 rounded"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 1. SPECTRUM FREQUENCY BARS RENDERER
// ==========================================
function renderSpectrumBars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  freqData: Uint8Array,
  theme: typeof THEME_PALETTES['cyber_neon'],
  config: VisualizerConfig,
  peaksRef: React.MutableRefObject<number[]>
) {
  const barCount = config.barCount;
  const barWidth = width / (config.mirrorMode ? barCount * 2 : barCount);
  const gap = Math.max(1, barWidth * 0.2);
  const actualBarW = Math.max(1, barWidth - gap);

  // Initialize peak array
  if (peaksRef.current.length !== barCount) {
    peaksRef.current = new Array(barCount).fill(0);
  }

  const step = Math.floor(freqData.length / barCount);
  const grad = ctx.createLinearGradient(0, height, 0, 0);
  theme.colors.forEach((c, idx) => {
    grad.addColorStop(idx / (theme.colors.length - 1), c);
  });

  ctx.fillStyle = grad;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 12;

  const renderSingleSide = (startIndex: number, direction: 1 | -1, originX: number) => {
    for (let i = 0; i < barCount; i++) {
      const freqVal = freqData[i * step] || 0;
      const normalized = (freqVal / 255) * config.sensitivity;
      const barHeight = Math.min(height * 0.88, Math.max(4, normalized * height * 0.85));

      // Peak decay
      if (barHeight > (peaksRef.current[i] || 0)) {
        peaksRef.current[i] = barHeight;
      } else {
        peaksRef.current[i] = Math.max(0, (peaksRef.current[i] || 0) - 1.8);
      }

      const x = originX + direction * (i * barWidth + gap / 2);
      const y = height - barHeight;

      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect(x, y, actualBarW, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Peak hold cap
      if (config.peakHold && peaksRef.current[i] > 6) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, height - peaksRef.current[i] - 3, actualBarW, 2.5);
        ctx.fillStyle = grad;
      }
    }
  };

  if (config.mirrorMode) {
    const centerX = width / 2;
    renderSingleSide(0, 1, centerX);
    renderSingleSide(0, -1, centerX - barWidth);
  } else {
    renderSingleSide(0, 1, 0);
  }

  // Reflection glow on floor
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, height - 2, width, 2);
  ctx.shadowBlur = 0;
}

// ==========================================
// 2. OSCILLOSCOPE TIME-DOMAIN GLOW RENDERER
// ==========================================
function renderOscilloscope(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: Uint8Array,
  theme: typeof THEME_PALETTES['cyber_neon'],
  config: VisualizerConfig
) {
  const centerY = height / 2;
  const sliceWidth = width / (timeData.length - 1);

  // Background phosphor grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let y = 0; y <= height; y += height / 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = 0; x <= width; x += width / 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Multi-pass neon bloom wave
  const passes = [
    { width: 10, color: theme.glow, blur: 20 },
    { width: 4, color: theme.colors[0], blur: 10 },
    { width: 1.8, color: '#ffffff', blur: 4 },
  ];

  passes.forEach((p) => {
    ctx.beginPath();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.width;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = p.blur;

    let x = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128; // -1 to +1
      const y = centerY + v * (height * 0.42) * config.sensitivity;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
  });

  ctx.shadowBlur = 0;
}

// ==========================================
// 3. RADIAL MANDALA 360° PULSAR RENDERER
// ==========================================
function renderRadialMandala(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  freqData: Uint8Array,
  theme: typeof THEME_PALETTES['cyber_neon'],
  config: VisualizerConfig,
  rotRef: React.MutableRefObject<number>,
  particlesRef: React.MutableRefObject<
    Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; hue: number }>
  >
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(centerX, centerY) * 0.35;
  const numBars = 120;
  const step = Math.floor(freqData.length / numBars);

  rotRef.current += 0.004;
  const rotation = rotRef.current;

  // Calculate sub-bass energy to pulse the center core
  let bassSum = 0;
  for (let i = 0; i < 15; i++) bassSum += freqData[i] || 0;
  const bassNorm = (bassSum / (15 * 255)) * config.sensitivity;
  const currentRadius = baseRadius + bassNorm * 25;

  // Spawn star particles on bass hits
  if (bassNorm > 0.45 && particlesRef.current.length < 90) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particlesRef.current.push({
      x: centerX + Math.cos(angle) * currentRadius,
      y: centerY + Math.sin(angle) * currentRadius,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      alpha: 1,
      hue: Math.random() * 360,
    });
  }

  // Draw and update particles
  ctx.save();
  for (let i = particlesRef.current.length - 1; i >= 0; i--) {
    const p = particlesRef.current[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.015;

    if (p.alpha <= 0) {
      particlesRef.current.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Radial frequency beams
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);

  for (let i = 0; i < numBars; i++) {
    const freqVal = freqData[i * step] || 0;
    const barHeight = ((freqVal / 255) * baseRadius * 1.4 * config.sensitivity) + 4;
    const angle = (i / numBars) * Math.PI * 2;

    const colorIdx = Math.floor((i / numBars) * theme.colors.length);
    ctx.strokeStyle = theme.colors[colorIdx % theme.colors.length];
    ctx.lineWidth = Math.max(2, (2 * Math.PI * currentRadius) / numBars - 2);
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 8;

    const x1 = Math.cos(angle) * currentRadius;
    const y1 = Math.sin(angle) * currentRadius;
    const x2 = Math.cos(angle) * (currentRadius + barHeight);
    const y2 = Math.sin(angle) * (currentRadius + barHeight);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Inner pulsing core
  ctx.beginPath();
  ctx.arc(0, 0, currentRadius * 0.85, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10, 15, 30, 0.8)';
  ctx.fill();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

// ==========================================
// 4. SPECTROGRAM WATERFALL SCROLL RENDERER
// ==========================================
function renderSpectrogram(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  freqData: Uint8Array,
  theme: typeof THEME_PALETTES['cyber_neon'],
  historyRef: React.MutableRefObject<ImageData | null>
) {
  // Shift existing canvas up by 2 pixels
  if (historyRef.current) {
    ctx.drawImage(ctx.canvas, 0, -3);
  }

  // Draw new bottom line
  const numBins = Math.min(freqData.length, width);
  const binWidth = width / numBins;
  const bottomY = height - 4;

  for (let i = 0; i < numBins; i++) {
    const val = freqData[i] / 255;
    const colorIdx = Math.min(theme.colors.length - 1, Math.floor(val * theme.colors.length));
    ctx.fillStyle = val > 0.05 ? theme.colors[colorIdx] : theme.bg;
    ctx.fillRect(i * binWidth, bottomY, binWidth + 0.5, 4);
  }

  historyRef.current = ctx.getImageData(0, 0, 1, 1);
}

// ==========================================
// 5. DUAL STEREO PHASE / LISSAJOUS SCOPE
// ==========================================
function renderStereoPhase(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: Uint8Array,
  freqData: Uint8Array,
  theme: typeof THEME_PALETTES['cyber_neon']
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) * 0.8;

  // Draw Target Scope Grids & Degrees
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, radius * 0.66, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, radius * 0.33, 0, Math.PI * 2);
  ctx.moveTo(centerX - radius, centerY);
  ctx.lineTo(centerX + radius, centerY);
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX, centerY + radius);
  ctx.stroke();

  // Phase Scope Vector
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 10;

  const halfLen = Math.floor(timeData.length / 2);
  for (let i = 0; i < halfLen; i++) {
    const leftSample = (timeData[i] - 128) / 128;
    const rightSample = (timeData[i + halfLen] - 128) / 128;

    // Rotate 45 degrees for Lissajous M/S representation
    const x = centerX + (leftSample - rightSample) * radius * 0.7;
    const y = centerY - (leftSample + rightSample) * radius * 0.7;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

// ==========================================
// 6. VINTAGE ANALOG VU METERS RENDERER
// ==========================================
function renderVuMeters(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  freqData: Uint8Array,
  timeData: Uint8Array,
  theme: typeof THEME_PALETTES['cyber_neon'],
  leftNeedleRef: React.MutableRefObject<number>,
  rightNeedleRef: React.MutableRefObject<number>
) {
  // Compute RMS for Left / Right estimation
  let sumL = 0, sumR = 0;
  const half = Math.floor(timeData.length / 2);
  for (let i = 0; i < half; i++) {
    const valL = (timeData[i] - 128) / 128;
    sumL += valL * valL;
    const valR = (timeData[i + half] - 128) / 128;
    sumR += valR * valR;
  }
  const rmsL = Math.min(1, Math.sqrt(sumL / half) * 2.2);
  const rmsR = Math.min(1, Math.sqrt(sumR / half) * 2.2);

  // Ballistics decay
  leftNeedleRef.current += (rmsL - leftNeedleRef.current) * 0.25;
  rightNeedleRef.current += (rmsR - rightNeedleRef.current) * 0.25;

  const meterW = Math.min(320, width * 0.44);
  const meterH = Math.min(180, height * 0.55);
  const gap = 24;

  const startX1 = width / 2 - meterW - gap / 2;
  const startX2 = width / 2 + gap / 2;
  const startY = height / 2 - meterH / 2;

  const drawSingleMeter = (x: number, y: number, value: number, label: string) => {
    // Meter Casing
    ctx.fillStyle = '#1e1c18';
    ctx.strokeStyle = '#38342c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, meterW, meterH, 12);
    ctx.fill();
    ctx.stroke();

    // Dial scale arc
    const pivotX = x + meterW / 2;
    const pivotY = y + meterH * 0.95;
    const needleLen = meterH * 0.78;

    // Dial background
    ctx.fillStyle = '#f6f0db';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 10, meterW - 20, meterH * 0.7, 8);
    ctx.fill();

    // Scale marks: -20dB to +3dB
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1.5;
    for (let db = -20; db <= 3; db += 4) {
      const angle = Math.PI * 1.25 + ((db + 20) / 23) * (Math.PI * 0.5);
      const isRed = db > 0;
      ctx.strokeStyle = isRed ? '#dc2626' : '#222222';
      ctx.beginPath();
      ctx.moveTo(pivotX + Math.cos(angle) * (needleLen * 0.8), pivotY + Math.sin(angle) * (needleLen * 0.8));
      ctx.lineTo(pivotX + Math.cos(angle) * needleLen, pivotY + Math.sin(angle) * needleLen);
      ctx.stroke();
    }

    // Needle
    const needleAngle = Math.PI * 1.25 + value * (Math.PI * 0.5);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX + Math.cos(needleAngle) * needleLen, pivotY + Math.sin(needleAngle) * needleLen);
    ctx.stroke();

    // Needle Pivot Cap
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#d4d4d4';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, pivotX, y + meterH - 8);
  };

  drawSingleMeter(startX1, startY, leftNeedleRef.current, 'LEFT CHANNEL (VU)');
  drawSingleMeter(startX2, startY, rightNeedleRef.current, 'RIGHT CHANNEL (VU)');
}

// ==========================================
// 7. CYBERPUNK 3D GRID RENDERER
// ==========================================
function renderCyberGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  freqData: Uint8Array,
  theme: typeof THEME_PALETTES['cyber_neon'],
  phaseRef: React.MutableRefObject<number>
) {
  phaseRef.current = (phaseRef.current + 0.03) % 1;
  const horizonY = height * 0.45;

  // Neon Horizon Sun
  let bassVal = (freqData[2] || 0) / 255;
  const sunRadius = Math.min(width, height) * 0.22 * (1 + bassVal * 0.3);
  const sunGrad = ctx.createRadialGradient(
    width / 2,
    horizonY,
    10,
    width / 2,
    horizonY,
    sunRadius
  );
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.3, theme.colors[0]);
  sunGrad.addColorStop(1, 'transparent');

  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(width / 2, horizonY, sunRadius, Math.PI, 0);
  ctx.fill();

  // Perspective 3D Grid floor
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 8;

  // Vanishing perspective vertical lines
  const numLines = 24;
  for (let i = 0; i <= numLines; i++) {
    const bottomX = (i / numLines) * width * 1.6 - width * 0.3;
    ctx.beginPath();
    ctx.moveTo(width / 2, horizonY);
    ctx.lineTo(bottomX, height);
    ctx.stroke();
  }

  // Horizontal moving lines with bass deformation
  const numHoriz = 14;
  for (let i = 0; i < numHoriz; i++) {
    const progress = Math.pow((i + phaseRef.current) / numHoriz, 2.2);
    const y = horizonY + progress * (height - horizonY);
    
    // Wave bump in middle from bass frequencies
    const waveAmp = bassVal * 25 * (1 - progress);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(width / 2, y - waveAmp, width, y);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
}
