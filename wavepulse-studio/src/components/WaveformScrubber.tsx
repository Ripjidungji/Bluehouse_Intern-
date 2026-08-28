import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  AudioTrack,
  TrackAnnotation,
  SliceSelection,
} from '../types';
import { formatTime } from '../utils/audioBufferUtils';
import {
  Play,
  Pause,
  Scissors,
  Bookmark,
  Repeat,
  ZoomIn,
  ZoomOut,
  Download,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface WaveformScrubberProps {
  currentTrack: AudioTrack | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoopingTrack: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  abLoop: { start: number; end: number; enabled: boolean };
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onToggleLoopTrack: () => void;
  onSetVolume: (vol: number) => void;
  onToggleMute: () => void;
  onSetPlaybackRate: (rate: number) => void;
  onSetAbLoop: (start: number, end: number, enabled: boolean) => void;
  onClearAbLoop: () => void;
  onAddAnnotation: (annotation: Omit<TrackAnnotation, 'id' | 'createdAt'>) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  onSliceTrack: (start: number, end: number, action: 'save_track' | 'download_wav') => void;
}

export const WaveformScrubber: React.FC<WaveformScrubberProps> = ({
  currentTrack,
  currentTime,
  duration,
  isPlaying,
  isLoopingTrack,
  volume,
  isMuted,
  playbackRate,
  abLoop,
  onTogglePlay,
  onSeek,
  onToggleLoopTrack,
  onSetVolume,
  onToggleMute,
  onSetPlaybackRate,
  onSetAbLoop,
  onClearAbLoop,
  onAddAnnotation,
  onDeleteAnnotation,
  onSliceTrack,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom level: 1x to 8x
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // Slicing Tool Mode
  const [isSliceMode, setIsSliceMode] = useState<boolean>(false);
  const [sliceSelection, setSliceSelection] = useState<SliceSelection>({
    startTime: 0,
    endTime: 0,
    isActive: false,
  });

  // Modal / Popover for new Annotation
  const [showAnnotationModal, setShowAnnotationModal] = useState<boolean>(false);
  const [newAnnotationTime, setNewAnnotationTime] = useState<number>(0);
  const [newAnnotationLabel, setNewAnnotationLabel] = useState<string>('');
  const [newAnnotationNote, setNewAnnotationNote] = useState<string>('');
  const [newAnnotationColor, setNewAnnotationColor] = useState<string>('#06b6d4');
  const [newAnnotationType, setNewAnnotationType] = useState<TrackAnnotation['type']>('cue');

  // Active hover annotation
  const [hoveredAnnotation, setHoveredAnnotation] = useState<TrackAnnotation | null>(null);

  // Auto-set slice boundaries when entering slice mode
  useEffect(() => {
    if (isSliceMode && duration > 0) {
      if (!sliceSelection.isActive || sliceSelection.endTime === 0) {
        const start = Math.max(0, currentTime - 2);
        const end = Math.min(duration, currentTime + 6);
        setSliceSelection({
          startTime: Number(start.toFixed(2)),
          endTime: Number(end.toFixed(2)),
          isActive: true,
        });
      }
    }
  }, [isSliceMode, currentTime, duration, sliceSelection.endTime, sliceSelection.isActive]);

  // Keyboard shortcuts (Space = Play/Pause, M = Add Marker, S = Toggle Slice)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        openAddAnnotationModal(currentTime);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsSliceMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, onTogglePlay]);

  // Render Static Waveform on Canvas with Zoom support
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(rect.width * dpr);
    const height = Math.floor(rect.height * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Fallback if no track or peaks
    const peaks = currentTrack?.peaks || [];
    const effectiveDuration = duration || currentTrack?.duration || 1;
    const progressRatio = effectiveDuration > 0 ? currentTime / effectiveDuration : 0;

    const totalBars = Math.max(60, Math.floor((width / 4) * zoomLevel));
    const barWidth = width / totalBars;
    const centerY = height / 2;

    // Draw baseline center divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Draw Amplitude Bars
    for (let i = 0; i < totalBars; i++) {
      const barRatio = i / totalBars;
      const peakIndex = Math.floor(barRatio * peaks.length);
      const amp = peaks.length > 0 ? peaks[peakIndex] || 0.15 : (Math.sin(i * 0.1) * 0.4 + 0.5) * 0.5;

      const barHeight = Math.max(4, amp * (height * 0.85));
      const x = i * barWidth;
      const y = centerY - barHeight / 2;

      const isPlayed = barRatio <= progressRatio;

      // Color styling
      if (isPlayed) {
        ctx.fillStyle = '#06b6d4'; // Cyan for played section
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
        ctx.shadowBlur = 4;
      } else {
        ctx.fillStyle = '#475569'; // Slate for unplayed
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.roundRect(x + 0.5, y, Math.max(1, barWidth - 1.5), barHeight, 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }, [currentTrack, currentTime, duration, zoomLevel]);

  // Calculate time from mouse position
  const getTimeFromMouseEvent = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return 0;
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const totalDur = duration || currentTrack?.duration || 0;
      return ratio * totalDur;
    },
    [currentTrack?.duration, duration]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    const targetTime = getTimeFromMouseEvent(e);
    onSeek(targetTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const time = getTimeFromMouseEvent(e);
    setHoverTime(time);
    if (isScrubbing) {
      onSeek(time);
    }
  };

  const handleMouseUp = () => {
    setIsScrubbing(false);
  };

  const handleMouseLeave = () => {
    setIsScrubbing(false);
    setHoverTime(null);
  };

  // Open Add Annotation Modal
  const openAddAnnotationModal = (timestamp: number) => {
    setNewAnnotationTime(Number(timestamp.toFixed(2)));
    setNewAnnotationLabel(`Marker @ ${formatTime(timestamp, true)}`);
    setNewAnnotationNote('');
    setNewAnnotationColor('#06b6d4');
    setNewAnnotationType('cue');
    setShowAnnotationModal(true);
  };

  const handleSaveAnnotation = () => {
    if (!currentTrack) return;
    onAddAnnotation({
      trackId: currentTrack.id,
      timestamp: newAnnotationTime,
      label: newAnnotationLabel || `Marker @ ${formatTime(newAnnotationTime)}`,
      note: newAnnotationNote,
      color: newAnnotationColor,
      type: newAnnotationType,
    });
    setShowAnnotationModal(false);
  };

  const annotations = currentTrack?.annotations || [];
  const effectiveDuration = duration || currentTrack?.duration || 0;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;
  const hoverPercent =
    hoverTime !== null && effectiveDuration > 0 ? (hoverTime / effectiveDuration) * 100 : null;

  return (
    <div
      id="waveform-scrubber-widget"
      className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 text-slate-200"
    >
      {/* Top Controls Bar: Track Info, Actions & Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        {/* Left: Play/Pause, Track Title & Timecode */}
        <div className="flex items-center gap-3">
          <button
            id="play-pause-main-btn"
            onClick={onTogglePlay}
            disabled={!currentTrack}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider">
                {formatTime(currentTime, true)}
              </span>
              <span className="text-slate-500 text-xs">/</span>
              <span className="font-mono text-xs sm:text-sm text-slate-400">
                {formatTime(effectiveDuration, true)}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">
              {currentTrack ? `${currentTrack.title} • ${currentTrack.artist}` : 'Select a track to start playback'}
            </p>
          </div>
        </div>

        {/* Right Tools: Slicer Toggle, Add Marker, A-B Loop, Zoom, Volume */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Slicing Tool Mode Toggle */}
          <button
            id="toggle-slice-mode-btn"
            onClick={() => setIsSliceMode(!isSliceMode)}
            disabled={!currentTrack}
            title="Toggle Waveform Slicing Bar (S)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isSliceMode
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-inner'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Slicing Tool</span>
          </button>

          {/* Add Marker @ Current Time */}
          <button
            id="add-marker-quick-btn"
            onClick={() => openAddAnnotationModal(currentTime)}
            disabled={!currentTrack}
            title="Add Timestamped Annotation Marker (M)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all"
          >
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Add Marker</span>
          </button>

          {/* Repeat / Loop Track */}
          <button
            id="toggle-repeat-track-btn"
            onClick={onToggleLoopTrack}
            title={isLoopingTrack ? 'Track Loop: ON' : 'Track Loop: OFF'}
            className={`p-2 rounded-xl border text-xs transition-all ${
              isLoopingTrack
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700 p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 1))}
              disabled={zoomLevel <= 1}
              title="Zoom Out Waveform"
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-cyan-400 font-bold">{zoomLevel}x</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(8, z + 1))}
              disabled={zoomLevel >= 8}
              title="Zoom In Waveform"
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Playback Speed Selector */}
          <select
            value={playbackRate}
            onChange={(e) => onSetPlaybackRate(parseFloat(e.target.value))}
            className="bg-slate-800 text-slate-300 border border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x (Normal)</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>

          {/* Volume & Mute */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-xl border border-slate-700 px-2 py-1">
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="text-slate-400 hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onSetVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Waveform Canvas Container */}
      <div className="relative flex flex-col gap-1 select-none">
        {/* Annotation Markers Pin Bar (Top Ribbon) */}
        <div className="relative w-full h-6 bg-slate-950/60 rounded-t-lg border border-b-0 border-slate-800 overflow-hidden">
          {annotations.map((ann) => {
            const leftPercent = effectiveDuration > 0 ? (ann.timestamp / effectiveDuration) * 100 : 0;
            return (
              <div
                key={ann.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(ann.timestamp);
                }}
                onMouseEnter={() => setHoveredAnnotation(ann)}
                onMouseLeave={() => setHoveredAnnotation(null)}
                style={{ left: `${leftPercent}%` }}
                className="absolute -top-0.5 -translate-x-1/2 cursor-pointer group flex flex-col items-center z-20"
              >
                <div
                  className="w-3 h-3 rounded-full shadow-md transition-transform group-hover:scale-125 flex items-center justify-center"
                  style={{ backgroundColor: ann.color }}
                >
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
                <div className="w-0.5 h-3" style={{ backgroundColor: ann.color }} />
              </div>
            );
          })}

          {/* Hover marker preview */}
          {hoverPercent !== null && (
            <div
              style={{ left: `${hoverPercent}%` }}
              className="absolute top-0 bottom-0 w-px bg-cyan-400/40 pointer-events-none"
            />
          )}
        </div>

        {/* Waveform Scrubber Stage */}
        <div
          ref={containerRef}
          id="waveform-interactive-area"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-24 sm:h-28 bg-slate-950 rounded-b-xl border border-slate-800 overflow-hidden cursor-pointer group"
        >
          {/* Static Waveform Canvas */}
          <canvas
            ref={waveformCanvasRef}
            id="waveform-peaks-canvas"
            className="w-full h-full block"
          />

          {/* A-B Loop Region Overlay */}
          {abLoop.enabled && abLoop.end > abLoop.start && effectiveDuration > 0 && (
            <div
              className="absolute top-0 bottom-0 bg-amber-500/20 border-x-2 border-amber-400 pointer-events-none z-10"
              style={{
                left: `${(abLoop.start / effectiveDuration) * 100}%`,
                width: `${((abLoop.end - abLoop.start) / effectiveDuration) * 100}%`,
              }}
            >
              <span className="absolute top-1 left-1.5 text-[9px] font-mono bg-amber-500/80 text-black px-1 rounded font-bold">
                A-B LOOP
              </span>
            </div>
          )}

          {/* Active Slicing Region Overlay & Draggable Slicers */}
          {isSliceMode && sliceSelection.isActive && effectiveDuration > 0 && (
            <div
              className="absolute top-0 bottom-0 bg-fuchsia-500/25 border-x-2 border-fuchsia-400 z-10 pointer-events-none"
              style={{
                left: `${(sliceSelection.startTime / effectiveDuration) * 100}%`,
                width: `${((sliceSelection.endTime - sliceSelection.startTime) / effectiveDuration) * 100}%`,
              }}
            >
              <div className="absolute top-1 left-2 flex items-center gap-1 bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40 text-[10px] font-mono px-2 py-0.5 rounded-md shadow">
                <Scissors className="w-3 h-3" />
                <span>
                  {formatTime(sliceSelection.startTime, true)} - {formatTime(sliceSelection.endTime, true)} ({(sliceSelection.endTime - sliceSelection.startTime).toFixed(2)}s)
                </span>
              </div>
            </div>
          )}

          {/* Scrubbing Playhead Line */}
          <div
            id="waveform-playhead"
            style={{ left: `${progressPercent}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-300 shadow-[0_0_12px_#06b6d4] pointer-events-none z-20 flex flex-col items-center"
          >
            <div className="w-3 h-3 bg-cyan-300 rounded-full shadow-lg -mt-1" />
          </div>

          {/* Hover Time Tooltip */}
          {hoverTime !== null && hoverPercent !== null && (
            <div
              style={{ left: `${hoverPercent}%` }}
              className="absolute top-2 -translate-x-1/2 pointer-events-none z-30 bg-slate-900/90 text-cyan-300 border border-cyan-500/40 font-mono text-[11px] px-2 py-0.5 rounded shadow-lg"
            >
              {formatTime(hoverTime, true)}
            </div>
          )}
        </div>

        {/* Hovered Annotation Tooltip Card */}
        {hoveredAnnotation && (
          <div
            className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-2xl z-30 min-w-[200px] flex flex-col gap-1 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: hoveredAnnotation.color }}
                />
                {hoveredAnnotation.label}
              </span>
              <span className="font-mono text-[11px] text-cyan-400">
                {formatTime(hoveredAnnotation.timestamp, true)}
              </span>
            </div>
            {hoveredAnnotation.note && (
              <p className="text-slate-400 text-[11px]">{hoveredAnnotation.note}</p>
            )}
            <button
              onClick={() => onDeleteAnnotation(hoveredAnnotation.id)}
              className="mt-1 text-red-400 hover:text-red-300 text-[10px] flex items-center gap-1 self-end"
            >
              <Trash2 className="w-3 h-3" /> Remove Marker
            </button>
          </div>
        )}
      </div>

      {/* Slicing Controls Toolbar (Visible when isSliceMode is active) */}
      {isSliceMode && (
        <div
          id="slicing-action-toolbar"
          className="bg-fuchsia-950/30 border border-fuchsia-800/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-fuchsia-400 font-semibold flex items-center gap-1.5">
              <Scissors className="w-4 h-4" /> Slice Range:
            </span>

            {/* In / Out timestamp numerical inputs */}
            <div className="flex items-center gap-2 font-mono">
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[10px]">IN:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={sliceSelection.endTime}
                  value={sliceSelection.startTime}
                  onChange={(e) =>
                    setSliceSelection((s) => ({
                      ...s,
                      startTime: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-14 bg-transparent text-white focus:outline-none"
                />
                <span className="text-slate-500">s</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[10px]">OUT:</span>
                <input
                  type="number"
                  step="0.1"
                  min={sliceSelection.startTime}
                  max={effectiveDuration}
                  value={sliceSelection.endTime}
                  onChange={(e) =>
                    setSliceSelection((s) => ({
                      ...s,
                      endTime: Math.min(effectiveDuration, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-14 bg-transparent text-white focus:outline-none"
                />
                <span className="text-slate-500">s</span>
              </div>

              <span className="text-fuchsia-300 font-bold">
                = {(sliceSelection.endTime - sliceSelection.startTime).toFixed(2)}s
              </span>
            </div>
          </div>

          {/* Slice Actions */}
          <div className="flex items-center gap-2">
            {/* Play Slice Preview */}
            <button
              onClick={() => {
                onSeek(sliceSelection.startTime);
                onSetAbLoop(sliceSelection.startTime, sliceSelection.endTime, true);
                if (!isPlaying) onTogglePlay();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-fuchsia-900/60 hover:bg-fuchsia-800 text-fuchsia-200 border border-fuchsia-600/50 transition-all"
            >
              <Play className="w-3 h-3" />
              <span>Preview Cut</span>
            </button>

            {/* Save Slice into Playlist */}
            <button
              id="save-slice-as-track-btn"
              onClick={() =>
                onSliceTrack(sliceSelection.startTime, sliceSelection.endTime, 'save_track')
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-medium shadow-md shadow-fuchsia-900/40 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save as New Track</span>
            </button>

            {/* Download Sliced WAV File */}
            <button
              id="download-slice-wav-btn"
              onClick={() =>
                onSliceTrack(sliceSelection.startTime, sliceSelection.endTime, 'download_wav')
              }
              title="Download sliced WAV to disk"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export WAV</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Annotation Modal */}
      {showAnnotationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-4 text-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-white font-semibold text-base flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cyan-400" /> Add Timestamp Annotation
              </h3>
              <button
                onClick={() => setShowAnnotationModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Timecode (seconds)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAnnotationTime}
                  onChange={(e) => setNewAnnotationTime(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Marker Title / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Bass Drop, Vocal Intro, Solo, Chorus"
                  value={newAnnotationLabel}
                  onChange={(e) => setNewAnnotationLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Add details, mixing notes, or structural breakdown..."
                  value={newAnnotationNote}
                  onChange={(e) => setNewAnnotationNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Marker Type</label>
                  <select
                    value={newAnnotationType}
                    onChange={(e) =>
                      setNewAnnotationType(e.target.value as TrackAnnotation['type'])
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="cue">Cue Point</option>
                    <option value="drop">Drop / Climax</option>
                    <option value="section">Section Change</option>
                    <option value="vocal">Vocal / Hook</option>
                    <option value="note">Production Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Pin Color</label>
                  <div className="flex items-center gap-2 pt-1">
                    {['#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewAnnotationColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          newAnnotationColor === c ? 'scale-125 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAnnotationModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                id="save-annotation-confirm-btn"
                onClick={handleSaveAnnotation}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25"
              >
                Save Marker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
