export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  mimeType: string;
  blob?: Blob;
  url?: string;
  peaks?: number[]; // normalized peaks 0-1 for visual waveform
  createdAt: number;
  playlistId: string;
  isDemo?: boolean;
  bpm?: number;
  tags?: string[];
  annotations?: TrackAnnotation[];
  sampleRate?: number;
  numberOfChannels?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: number;
}

export interface TrackAnnotation {
  id: string;
  trackId: string;
  timestamp: number; // in seconds
  endTimestamp?: number; // for regions
  label: string;
  note?: string;
  color: string;
  type: 'cue' | 'note' | 'section' | 'drop' | 'vocal' | 'slice';
  createdAt: number;
}

export interface AudioSlice {
  id: string;
  trackId: string;
  trackTitle: string;
  startTime: number;
  endTime: number;
  duration: number;
  name: string;
  blob?: Blob;
  url?: string;
  createdAt: number;
}

export type VisualizerMode =
  | 'spectrum_bars'
  | 'oscilloscope_glow'
  | 'radial_mandala'
  | 'spectrogram_waterfall'
  | 'dual_stereo_phase'
  | 'vu_peak_meter'
  | 'cyber_grid';

export type VisualizerTheme =
  | 'cyber_neon'
  | 'sunset_amber'
  | 'emerald_matrix'
  | 'electric_violet'
  | 'ice_cyan'
  | 'crimson_pulse';

export interface VisualizerConfig {
  mode: VisualizerMode;
  theme: VisualizerTheme;
  fftSize: 512 | 1024 | 2048 | 4096;
  smoothing: number; // 0.1 - 0.95
  sensitivity: number; // 0.5 - 2.5
  barCount: number; // 32 - 256
  glowIntensity: number; // 0 - 1
  mirrorMode: boolean;
  peakHold: boolean;
  showEnergyHud: boolean;
}

export interface EqualizerBands {
  sub60: number;   // -12dB to +12dB
  low250: number;  // -12dB to +12dB
  mid1k: number;   // -12dB to +12dB
  high4k: number;  // -12dB to +12dB
  air12k: number;  // -12dB to +12dB
}

export type EqualizerPreset =
  | 'flat'
  | 'bass_boost'
  | 'club_dance'
  | 'vocal_clarity'
  | 'rock_punch'
  | 'lofi_chill'
  | 'electronic_warmth'
  | 'treble_boost';

export interface AudioEngineMetrics {
  rms: number; // 0 - 1
  peak: number; // 0 - 1
  bassEnergy: number; // 0 - 1
  midEnergy: number; // 0 - 1
  trebleEnergy: number; // 0 - 1
  spectralCentroid: number;
}

export interface SliceSelection {
  startTime: number;
  endTime: number;
  isActive: boolean;
}
