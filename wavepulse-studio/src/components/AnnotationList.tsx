import React, { useState } from 'react';
import {
  TrackAnnotation,
  AudioTrack,
} from '../types';
import { formatTime } from '../utils/audioBufferUtils';
import {
  Bookmark,
  Play,
  Trash2,
  Download,
  Upload,
  Filter,
  Repeat,
  Sparkles,
  Layers,
} from 'lucide-react';

interface AnnotationListProps {
  currentTrack: AudioTrack | null;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onSetAbLoop: (start: number, end: number, enabled: boolean) => void;
  onDeleteAnnotation: (id: string) => void;
  onAddAnnotation: (ann: Omit<TrackAnnotation, 'id' | 'createdAt'>) => void;
}

export const AnnotationList: React.FC<AnnotationListProps> = ({
  currentTrack,
  currentTime,
  onSeek,
  onSetAbLoop,
  onDeleteAnnotation,
  onAddAnnotation,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const annotations = currentTrack?.annotations || [];

  const filtered = annotations.filter((a) => {
    if (selectedFilter === 'all') return true;
    return a.type === selectedFilter;
  });

  // Sort chronologically by timestamp
  const sorted = [...filtered].sort((a, b) => a.timestamp - b.timestamp);

  // Export annotations as Markdown or JSON
  const exportAnnotations = (format: 'json' | 'md') => {
    if (!currentTrack || annotations.length === 0) return;

    let content = '';
    let mime = 'application/json';
    let filename = `${currentTrack.title}-cue-sheet.${format}`;

    if (format === 'json') {
      content = JSON.stringify(annotations, null, 2);
    } else {
      mime = 'text/markdown';
      content = `# Cue Sheet & Annotations: ${currentTrack.title}\n\n`;
      content += `Artist: ${currentTrack.artist}\n`;
      content += `Duration: ${formatTime(currentTrack.duration)}\n\n`;
      content += `| Timecode | Type | Label | Notes |\n`;
      content += `| :--- | :--- | :--- | :--- |\n`;
      sorted.forEach((a) => {
        content += `| ${formatTime(a.timestamp, true)} | ${a.type.toUpperCase()} | ${a.label} | ${a.note || '-'} |\n`;
      });
    }

    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <div
      id="annotation-cue-list"
      className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200"
    >
      {/* Header & Export options */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white tracking-wide">Timecode Cue Sheet & Annotations</h3>
          <span className="text-xs bg-slate-800 text-cyan-300 font-mono px-2 py-0.5 rounded-full">
            {annotations.length} Markers
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700 p-0.5 text-xs">
            {['all', 'cue', 'drop', 'section', 'vocal'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                  selectedFilter === f
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <button
            onClick={() => exportAnnotations('md')}
            disabled={annotations.length === 0}
            title="Export Cue Sheet as Markdown Table"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export MD</span>
          </button>
        </div>
      </div>

      {/* Markers List */}
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
        {sorted.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center gap-2">
            <Bookmark className="w-8 h-8 text-slate-700" />
            <p>No markers or annotations yet for this track.</p>
            <p className="text-slate-400">
              Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-cyan-400">M</kbd> while listening to drop a marker!
            </p>
          </div>
        ) : (
          sorted.map((ann, idx) => {
            const isNearCurrentTime = Math.abs(currentTime - ann.timestamp) < 1.0;
            const nextMarker = sorted[idx + 1];
            return (
              <div
                key={ann.id}
                onClick={() => onSeek(ann.timestamp)}
                className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isNearCurrentTime
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                {/* Marker Time & Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow"
                    style={{ backgroundColor: ann.color }}
                  />

                  <span className="font-mono text-xs font-bold text-cyan-300 min-w-[54px]">
                    {formatTime(ann.timestamp, true)}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">
                        {ann.label}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {ann.type}
                      </span>
                    </div>
                    {ann.note && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">{ann.note}</p>
                    )}
                  </div>
                </div>

                {/* Actions: Jump / Loop to next marker / Delete */}
                <div className="flex items-center gap-1.5">
                  {/* Loop region from this marker to next */}
                  {nextMarker && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(ann.timestamp);
                        onSetAbLoop(ann.timestamp, nextMarker.timestamp, true);
                      }}
                      title={`Loop section: ${formatTime(ann.timestamp)} to ${formatTime(nextMarker.timestamp)}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Jump button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(ann.timestamp);
                    }}
                    title="Jump to time"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAnnotation(ann.id);
                    }}
                    title="Delete marker"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
