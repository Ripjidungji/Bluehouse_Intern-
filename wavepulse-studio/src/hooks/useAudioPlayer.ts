import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AudioTrack,
  EqualizerBands,
  EqualizerPreset,
  AudioEngineMetrics,
} from '../types';

export const EQ_PRESETS: Record<EqualizerPreset, EqualizerBands> = {
  flat: { sub60: 0, low250: 0, mid1k: 0, high4k: 0, air12k: 0 },
  bass_boost: { sub60: 7, low250: 4.5, mid1k: 0, high4k: -1, air12k: 1 },
  club_dance: { sub60: 6, low250: 3, mid1k: -1.5, high4k: 3.5, air12k: 5 },
  vocal_clarity: { sub60: -3, low250: -1.5, mid1k: 3.5, high4k: 4, air12k: 2 },
  rock_punch: { sub60: 5, low250: 2.5, mid1k: -2, high4k: 3, air12k: 4 },
  lofi_chill: { sub60: 3, low250: 4, mid1k: -2, high4k: -5, air12k: -8 },
  electronic_warmth: { sub60: 4, low250: 2, mid1k: 1, high4k: 2.5, air12k: 3 },
  treble_boost: { sub60: -2, low250: -1, mid1k: 1, high4k: 5, air12k: 7 },
};

export interface UseAudioPlayerReturn {
  // Audio state
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  pan: number;
  isLoopingTrack: boolean;
  isMicActive: boolean;
  audioContextState: AudioContextState;
  
  // Equalizer
  eqBands: EqualizerBands;
  eqPreset: EqualizerPreset;
  
  // A-B Loop
  abLoop: { start: number; end: number; enabled: boolean };
  
  // Actions
  loadTrack: (track: AudioTrack, autoPlay?: boolean) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setPan: (panValue: number) => void;
  toggleLoopTrack: () => void;
  setEqBand: (band: keyof EqualizerBands, dbValue: number) => void;
  applyEqPreset: (preset: EqualizerPreset) => void;
  setAbLoop: (start: number, end: number, enabled: boolean) => void;
  clearAbLoop: () => void;
  toggleMicrophone: () => Promise<boolean>;
  playSynthTone: (freq: number, type?: OscillatorType, duration?: number) => void;
  
  // Web Audio Nodes & High-frequency data accessors for Canvas
  analyserNode: AnalyserNode | null;
  audioContext: AudioContext | null;
  getByteFrequencyData: (outputArray: Uint8Array) => void;
  getByteTimeDomainData: (outputArray: Uint8Array) => void;
  getAudioMetrics: () => AudioEngineMetrics;
  updateAnalyserSettings: (fftSize: number, smoothingTimeConstant: number) => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [pan, setPanState] = useState<number>(0);
  const [isLoopingTrack, setIsLoopingTrack] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [audioContextState, setAudioContextState] = useState<AudioContextState>('suspended');

  const [eqBands, setEqBands] = useState<EqualizerBands>(EQ_PRESETS.flat);
  const [eqPreset, setEqPreset] = useState<EqualizerPreset>('flat');

  const [abLoop, setAbLoopState] = useState<{ start: number; end: number; enabled: boolean }>({
    start: 0,
    end: 0,
    enabled: false,
  });

  // Web Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // FX Nodes
  const eqFiltersRef = useRef<{
    sub60: BiquadFilterNode;
    low250: BiquadFilterNode;
    mid1k: BiquadFilterNode;
    high4k: BiquadFilterNode;
    air12k: BiquadFilterNode;
  } | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Time tracking ref to avoid stale closure in animation loops
  const abLoopRef = useRef(abLoop);
  abLoopRef.current = abLoop;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Initialize Web Audio graph
  const initAudioGraph = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    // Create HTMLAudioElement
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audioElementRef.current = audio;

    // Create Analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyserNodeRef.current = analyser;

    // Create Master Gain
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
    gainNodeRef.current = gain;

    // Create Stereo Panner (fallback check for browsers)
    let panner: StereoPannerNode | null = null;
    if (typeof ctx.createStereoPanner === 'function') {
      panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, ctx.currentTime);
      pannerNodeRef.current = panner;
    }

    // Create 5-Band Equalizer filters
    const sub60 = ctx.createBiquadFilter();
    sub60.type = 'lowshelf';
    sub60.frequency.value = 60;
    sub60.gain.value = eqBands.sub60;

    const low250 = ctx.createBiquadFilter();
    low250.type = 'peaking';
    low250.frequency.value = 250;
    low250.Q.value = 1.0;
    low250.gain.value = eqBands.low250;

    const mid1k = ctx.createBiquadFilter();
    mid1k.type = 'peaking';
    mid1k.frequency.value = 1000;
    mid1k.Q.value = 1.0;
    mid1k.gain.value = eqBands.mid1k;

    const high4k = ctx.createBiquadFilter();
    high4k.type = 'peaking';
    high4k.frequency.value = 4000;
    high4k.Q.value = 1.0;
    high4k.gain.value = eqBands.high4k;

    const air12k = ctx.createBiquadFilter();
    air12k.type = 'highshelf';
    air12k.frequency.value = 12000;
    air12k.gain.value = eqBands.air12k;

    eqFiltersRef.current = { sub60, low250, mid1k, high4k, air12k };

    // Connect Filter chain: sub60 -> low250 -> mid1k -> high4k -> air12k
    sub60.connect(low250);
    low250.connect(mid1k);
    mid1k.connect(high4k);
    high4k.connect(air12k);

    // Connect air12k -> panner (or directly to analyser)
    if (panner) {
      air12k.connect(panner);
      panner.connect(analyser);
    } else {
      air12k.connect(analyser);
    }

    // Connect Analyser -> Gain -> Destination
    analyser.connect(gain);
    gain.connect(ctx.destination);

    // Media element source connection
    const sourceNode = ctx.createMediaElementSource(audio);
    sourceNodeRef.current = sourceNode;
    sourceNode.connect(sub60);

    // Setup audio element listeners
    audio.addEventListener('timeupdate', () => {
      const current = audio.currentTime;
      setCurrentTime(current);

      // Handle A-B Loop
      const loop = abLoopRef.current;
      if (loop.enabled && loop.end > loop.start && current >= loop.end) {
        audio.currentTime = loop.start;
      }
    });

    audio.addEventListener('durationchange', () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    ctx.onstatechange = () => {
      setAudioContextState(ctx.state);
    };
    setAudioContextState(ctx.state);

    return ctx;
  }, [eqBands, isMuted, pan, volume]);

  // Ensure AudioContext is resumed on user actions
  const ensureContextRunning = useCallback(async () => {
    const ctx = initAudioGraph();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
      setAudioContextState(ctx.state);
    }
  }, [initAudioGraph]);

  // Load Track
  const loadTrack = useCallback(
    async (track: AudioTrack, autoPlay: boolean = false) => {
      await ensureContextRunning();
      const audio = audioElementRef.current;
      if (!audio) return;

      // Stop any active mic
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
        setIsMicActive(false);
      }

      setCurrentTrack(track);

      let srcUrl = track.url;
      if (!srcUrl && track.blob) {
        srcUrl = URL.createObjectURL(track.blob);
      }

      if (srcUrl) {
        audio.src = srcUrl;
        audio.playbackRate = playbackRate;
        audio.loop = isLoopingTrack;
        audio.load();

        if (autoPlay) {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (err) {
            console.warn('AutoPlay blocked by browser policy:', err);
          }
        }
      }
    },
    [ensureContextRunning, isLoopingTrack, playbackRate]
  );

  // Playback controls
  const play = useCallback(async () => {
    await ensureContextRunning();
    const audio = audioElementRef.current;
    if (audio) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Failed to play audio:', err);
      }
    }
  }, [ensureContextRunning]);

  const pause = useCallback(() => {
    const audio = audioElementRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const seek = useCallback((seconds: number) => {
    const audio = audioElementRef.current;
    if (audio && !isNaN(seconds)) {
      const clamped = Math.max(0, Math.min(seconds, audio.duration || duration || seconds));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
    }
  }, [duration]);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        isMuted ? 0 : clamped,
        audioContextRef.current.currentTime,
        0.02
      );
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(
          next ? 0 : volume,
          audioContextRef.current.currentTime,
          0.02
        );
      }
      return next;
    });
  }, [volume]);

  const setPlaybackRate = useCallback((rate: number) => {
    const clamped = Math.max(0.25, Math.min(4.0, rate));
    setPlaybackRateState(clamped);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = clamped;
    }
  }, []);

  const setPan = useCallback((panValue: number) => {
    const clamped = Math.max(-1, Math.min(1, panValue));
    setPanState(clamped);
    if (pannerNodeRef.current && audioContextRef.current) {
      pannerNodeRef.current.pan.setTargetAtTime(
        clamped,
        audioContextRef.current.currentTime,
        0.02
      );
    }
  }, []);

  const toggleLoopTrack = useCallback(() => {
    setIsLoopingTrack((prev) => {
      const next = !prev;
      if (audioElementRef.current) {
        audioElementRef.current.loop = next;
      }
      return next;
    });
  }, []);

  // Equalizer adjustment
  const setEqBand = useCallback(
    (band: keyof EqualizerBands, dbValue: number) => {
      const clamped = Math.max(-15, Math.min(15, dbValue));
      setEqBands((prev) => ({ ...prev, [band]: clamped }));
      setEqPreset('flat'); // custom preset

      if (eqFiltersRef.current && audioContextRef.current) {
        const filter = eqFiltersRef.current[band];
        filter.gain.setTargetAtTime(clamped, audioContextRef.current.currentTime, 0.02);
      }
    },
    []
  );

  const applyEqPreset = useCallback((preset: EqualizerPreset) => {
    const bands = EQ_PRESETS[preset];
    setEqBands(bands);
    setEqPreset(preset);

    if (eqFiltersRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      eqFiltersRef.current.sub60.gain.setTargetAtTime(bands.sub60, ctx.currentTime, 0.03);
      eqFiltersRef.current.low250.gain.setTargetAtTime(bands.low250, ctx.currentTime, 0.03);
      eqFiltersRef.current.mid1k.gain.setTargetAtTime(bands.mid1k, ctx.currentTime, 0.03);
      eqFiltersRef.current.high4k.gain.setTargetAtTime(bands.high4k, ctx.currentTime, 0.03);
      eqFiltersRef.current.air12k.gain.setTargetAtTime(bands.air12k, ctx.currentTime, 0.03);
    }
  }, []);

  // A-B Loop Controls
  const setAbLoop = useCallback((start: number, end: number, enabled: boolean) => {
    setAbLoopState({ start, end, enabled });
  }, []);

  const clearAbLoop = useCallback(() => {
    setAbLoopState({ start: 0, end: 0, enabled: false });
  }, []);

  // Live Microphone input toggle
  const toggleMicrophone = useCallback(async (): Promise<boolean> => {
    await ensureContextRunning();
    const ctx = audioContextRef.current;
    if (!ctx) return false;

    if (isMicActive) {
      // Disconnect mic
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (micSourceNodeRef.current) {
        micSourceNodeRef.current.disconnect();
        micSourceNodeRef.current = null;
      }
      setIsMicActive(false);
      return false;
    } else {
      // Connect mic
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micStreamRef.current = stream;

        // Pause current audio track if playing
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          setIsPlaying(false);
        }

        const micSource = ctx.createMediaStreamSource(stream);
        micSourceNodeRef.current = micSource;

        if (eqFiltersRef.current) {
          micSource.connect(eqFiltersRef.current.sub60);
        } else if (analyserNodeRef.current) {
          micSource.connect(analyserNodeRef.current);
        }

        setIsMicActive(true);
        setIsPlaying(true);
        return true;
      } catch (err) {
        console.error('Microphone access denied or failed:', err);
        return false;
      }
    }
  }, [ensureContextRunning, isMicActive]);

  // Synthesizer tone generator (Sine, Triangle, Sawtooth, Square)
  const playSynthTone = useCallback(
    (freq: number, type: OscillatorType = 'sine', noteDuration: number = 0.5) => {
      const ctx = audioContextRef.current || initAudioGraph();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      toneGain.gain.setValueAtTime(0.3, ctx.currentTime);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + noteDuration);

      if (eqFiltersRef.current) {
        osc.connect(toneGain);
        toneGain.connect(eqFiltersRef.current.sub60);
      } else {
        osc.connect(toneGain);
        toneGain.connect(ctx.destination);
      }

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + noteDuration);
    },
    [initAudioGraph]
  );

  // High-Frequency Canvas data getters
  const getByteFrequencyData = useCallback((outputArray: Uint8Array) => {
    if (analyserNodeRef.current) {
      analyserNodeRef.current.getByteFrequencyData(outputArray);
    } else {
      outputArray.fill(0);
    }
  }, []);

  const getByteTimeDomainData = useCallback((outputArray: Uint8Array) => {
    if (analyserNodeRef.current) {
      analyserNodeRef.current.getByteTimeDomainData(outputArray);
    } else {
      outputArray.fill(128); // center baseline
    }
  }, []);

  // Update Analyser settings
  const updateAnalyserSettings = useCallback((fftSize: number, smoothingTimeConstant: number) => {
    if (analyserNodeRef.current) {
      try {
        analyserNodeRef.current.fftSize = fftSize;
        analyserNodeRef.current.smoothingTimeConstant = Math.max(0, Math.min(0.99, smoothingTimeConstant));
      } catch (err) {
        console.warn('Could not update analyser settings:', err);
      }
    }
  }, []);

  // Compute real-time Audio Engine Metrics (RMS, Peak, Bass, Mid, Treble)
  const metricsFreqBufferRef = useRef<Uint8Array | null>(null);
  const metricsTimeBufferRef = useRef<Uint8Array | null>(null);

  const getAudioMetrics = useCallback((): AudioEngineMetrics => {
    const analyser = analyserNodeRef.current;
    if (!analyser) {
      return { rms: 0, peak: 0, bassEnergy: 0, midEnergy: 0, trebleEnergy: 0, spectralCentroid: 0 };
    }

    const bufferLength = analyser.frequencyBinCount;
    if (!metricsFreqBufferRef.current || metricsFreqBufferRef.current.length !== bufferLength) {
      metricsFreqBufferRef.current = new Uint8Array(bufferLength);
      metricsTimeBufferRef.current = new Uint8Array(bufferLength);
    }

    const freqData = metricsFreqBufferRef.current;
    const timeData = metricsTimeBufferRef.current!;

    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);

    // RMS & Peak from time domain
    let sumSquares = 0;
    let peak = 0;
    for (let i = 0; i < timeData.length; i++) {
      const normalized = (timeData[i] - 128) / 128;
      const absVal = Math.abs(normalized);
      if (absVal > peak) peak = absVal;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / timeData.length);

    // Bass (0 - ~250Hz), Mid (250Hz - 4kHz), Treble (4kHz - 20kHz)
    // Bin freq = index * (sampleRate / 2) / bufferLength
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const binWidth = (sampleRate / 2) / bufferLength;

    let bassSum = 0, bassCount = 0;
    let midSum = 0, midCount = 0;
    let trebleSum = 0, trebleCount = 0;
    let weightedFreqSum = 0, totalEnergySum = 0;

    for (let i = 0; i < freqData.length; i++) {
      const freq = i * binWidth;
      const val = freqData[i] / 255;

      weightedFreqSum += freq * val;
      totalEnergySum += val;

      if (freq <= 250) {
        bassSum += val;
        bassCount++;
      } else if (freq <= 4000) {
        midSum += val;
        midCount++;
      } else {
        trebleSum += val;
        trebleCount++;
      }
    }

    const bassEnergy = bassCount > 0 ? bassSum / bassCount : 0;
    const midEnergy = midCount > 0 ? midSum / midCount : 0;
    const trebleEnergy = trebleCount > 0 ? trebleSum / trebleCount : 0;
    const spectralCentroid = totalEnergySum > 0 ? weightedFreqSum / totalEnergySum : 0;

    return {
      rms,
      peak,
      bassEnergy,
      midEnergy,
      trebleEnergy,
      spectralCentroid,
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    pan,
    isLoopingTrack,
    isMicActive,
    audioContextState,
    eqBands,
    eqPreset,
    abLoop,
    loadTrack,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setPan,
    toggleLoopTrack,
    setEqBand,
    applyEqPreset,
    setAbLoop,
    clearAbLoop,
    toggleMicrophone,
    playSynthTone,
    analyserNode: analyserNodeRef.current,
    audioContext: audioContextRef.current,
    getByteFrequencyData,
    getByteTimeDomainData,
    getAudioMetrics,
    updateAnalyserSettings,
  };
}
