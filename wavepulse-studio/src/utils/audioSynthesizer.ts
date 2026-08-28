import { AudioTrack, TrackAnnotation } from '../types';
import { audioBufferToWavBlob, extractPeaks } from './audioBufferUtils';

interface SynthTrackSpec {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number; // in seconds
  tags: string[];
  annotations: Array<{
    timestamp: number;
    endTimestamp?: number;
    label: string;
    note: string;
    color: string;
    type: TrackAnnotation['type'];
  }>;
  generator: (offlineCtx: OfflineAudioContext) => void;
}

const DEMO_SPECS: SynthTrackSpec[] = [
  {
    id: 'demo-synthwave-pulse',
    title: 'Neon Horizon (Synthwave)',
    artist: 'WebAudio Synth Engine',
    bpm: 120,
    duration: 32,
    tags: ['Synthwave', '120 BPM', 'Retro', 'Sub-Bass'],
    annotations: [
      { timestamp: 0, label: 'Intro Arp', note: 'Filter sweeps opening 16th notes', color: '#06b6d4', type: 'section' },
      { timestamp: 8, label: 'Bassline Kick', note: '808 Sub-bass enters with punchy 4-on-the-floor', color: '#3b82f6', type: 'drop' },
      { timestamp: 16, label: 'Main Synth Drop', note: 'Lead synth opens up with stereo width', color: '#ec4899', type: 'drop' },
      { timestamp: 24, label: 'Filter Breakdown', note: 'Low-pass filter resonance sweep down', color: '#8b5cf6', type: 'section' },
      { timestamp: 28, label: 'Outro Climax', note: 'Harmonic peak and decay tail', color: '#10b981', type: 'cue' },
    ],
    generator: (ctx) => {
      const sampleRate = ctx.sampleRate;
      const totalTime = 32;
      const bpm = 120;
      const beat = 60 / bpm; // 0.5s

      // Master bus
      const master = ctx.createGain();
      master.gain.value = 0.85;
      master.connect(ctx.destination);

      // 1. Kick & Snare Drums
      for (let t = 8; t < totalTime; t += beat) {
        const beatNum = Math.round(t / beat);
        
        // Kick on beats 1 & 3 (and 4-on-floor after 16s)
        if (beatNum % 2 === 0 || t >= 16) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
          
          gain.gain.setValueAtTime(0.9, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          
          osc.connect(gain);
          gain.connect(master);
          osc.start(t);
          osc.stop(t + 0.3);
        }

        // Snare / Clap on beats 2 & 4
        if (beatNum % 2 === 1 && t < totalTime - 2) {
          // Noise burst
          const bufferSize = sampleRate * 0.15;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1800;
          filter.Q.value = 1.2;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.6, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(master);
          noise.start(t);
          noise.stop(t + 0.2);
        }
      }

      // 2. Hi-Hats (16th notes)
      const sixteenth = beat / 4;
      for (let t = 4; t < totalTime; t += sixteenth) {
        const bufferSize = sampleRate * 0.04;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7500;

        const gain = ctx.createGain();
        const accent = (Math.round(t / sixteenth) % 4 === 2) ? 0.35 : 0.15;
        gain.gain.setValueAtTime(accent, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        noise.start(t);
        noise.stop(t + 0.05);
      }

      // 3. Bassline (Punchy Saw + Sub)
      const bassNotes = [55, 55, 65.4, 49, 43.65, 43.65, 49, 55]; // A1, C2, B1, F1, G1, A1
      for (let t = 8; t < totalTime; t += beat) {
        const noteIndex = Math.floor((t - 8) / (beat * 2)) % bassNotes.length;
        const freq = bassNotes[noteIndex];

        const sawOsc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const bFilter = ctx.createBiquadFilter();
        const bGain = ctx.createGain();

        sawOsc.type = 'sawtooth';
        sawOsc.frequency.setValueAtTime(freq, t);
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq / 2, t);

        bFilter.type = 'lowpass';
        bFilter.frequency.setValueAtTime(600, t);
        bFilter.frequency.exponentialRampToValueAtTime(150, t + beat * 0.8);
        bFilter.Q.value = 3.5;

        bGain.gain.setValueAtTime(0.45, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9);

        sawOsc.connect(bFilter);
        subOsc.connect(bFilter);
        bFilter.connect(bGain);
        bGain.connect(master);

        sawOsc.start(t);
        subOsc.start(t);
        sawOsc.stop(t + beat);
        subOsc.stop(t + beat);
      }

      // 4. Arpeggiator (Chords: Am - F - C - G)
      const chordArps = [
        [220, 261.63, 329.63, 440, 523.25, 659.25], // Am
        [174.61, 220, 261.63, 349.23, 440, 523.25], // F
        [261.63, 329.63, 392, 523.25, 659.25, 783.99], // C
        [196, 246.94, 293.66, 392, 493.88, 587.33]  // G
      ];

      for (let t = 0; t < totalTime; t += sixteenth) {
        const chordIdx = Math.floor(t / (beat * 4)) % chordArps.length;
        const currentChord = chordArps[chordIdx];
        const noteIdx = Math.floor(t / sixteenth) % currentChord.length;
        const freq = currentChord[noteIdx];

        const osc = ctx.createOscillator();
        const panner = ctx.createStereoPanner();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        // Gentle stereo pan oscillation
        panner.pan.setValueAtTime(Math.sin(t * 2) * 0.6, t);

        const volume = t < 16 ? 0.22 : 0.16;
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + sixteenth * 1.5);

        osc.connect(panner);
        panner.connect(gain);
        gain.connect(master);

        osc.start(t);
        osc.stop(t + sixteenth * 2);
      }

      // 5. Lead Melody (Enters at 16s)
      const leadNotes = [
        { time: 16, note: 659.25, dur: 1 },
        { time: 17, note: 587.33, dur: 0.5 },
        { time: 17.5, note: 523.25, dur: 0.5 },
        { time: 18, note: 440, dur: 1.5 },
        { time: 20, note: 523.25, dur: 1 },
        { time: 21, note: 659.25, dur: 1 },
        { time: 22, note: 783.99, dur: 2 },
        { time: 24, note: 880, dur: 1.5 },
        { time: 26, note: 659.25, dur: 1 },
        { time: 27, note: 587.33, dur: 1 },
        { time: 28, note: 440, dur: 3 },
      ];

      leadNotes.forEach((ln) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(ln.note, ln.time);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(ln.note * 1.004, ln.time); // slight detune

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, ln.time);

        gain.gain.setValueAtTime(0.2, ln.time);
        gain.gain.exponentialRampToValueAtTime(0.001, ln.time + ln.dur * 0.95);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc1.start(ln.time);
        osc2.start(ln.time);
        osc1.stop(ln.time + ln.dur);
        osc2.stop(ln.time + ln.dur);
      });
    },
  },
  {
    id: 'demo-lofi-midnight',
    title: 'Midnight Coffee (Lo-Fi Chill)',
    artist: 'WebAudio Synth Engine',
    bpm: 85,
    duration: 28,
    tags: ['Lo-Fi', '85 BPM', 'Chillhop', 'Warm Rhodes'],
    annotations: [
      { timestamp: 0, label: 'Vinyl Atmosphere', note: 'Lo-Fi tape noise & warm Rhodes chords', color: '#f59e0b', type: 'section' },
      { timestamp: 6, label: 'Boom-Bap Beat', note: 'Downtempo kick and sidechain groove', color: '#10b981', type: 'drop' },
      { timestamp: 14, label: 'Piano Melodic Hook', note: 'Gentle pentatonic jazz melody', color: '#8b5cf6', type: 'vocal' },
      { timestamp: 22, label: 'Warm Fadeout', note: 'Filtered acoustic release', color: '#6b7280', type: 'cue' },
    ],
    generator: (ctx) => {
      const sampleRate = ctx.sampleRate;
      const totalTime = 28;
      const bpm = 85;
      const beat = 60 / bpm; // ~0.705s

      const master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);

      // 1. Vinyl crackle noise
      const crackleBuffer = ctx.createBuffer(1, sampleRate * totalTime, sampleRate);
      const crackleData = crackleBuffer.getChannelData(0);
      for (let i = 0; i < crackleData.length; i++) {
        const noise = (Math.random() * 2 - 1) * 0.015;
        const pop = Math.random() > 0.9995 ? (Math.random() * 2 - 1) * 0.2 : 0;
        crackleData[i] = noise + pop;
      }
      const crackle = ctx.createBufferSource();
      crackle.buffer = crackleBuffer;
      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = 'bandpass';
      crackleFilter.frequency.value = 3000;
      crackle.connect(crackleFilter);
      crackleFilter.connect(master);
      crackle.start(0);
      crackle.stop(totalTime);

      // 2. Chords (Fmaj7 - Em7 - Dm7 - Cmaj7)
      const lofiChords = [
        [174.61, 220, 261.63, 329.63], // Fmaj7
        [164.81, 196, 246.94, 293.66], // Em7
        [146.83, 174.61, 220, 261.63], // Dm7
        [130.81, 164.81, 196, 246.94], // Cmaj7
      ];

      for (let t = 0; t < totalTime; t += beat * 2) {
        const chord = lofiChords[Math.floor(t / (beat * 2)) % lofiChords.length];
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'sine';
          // warm detuning
          osc.frequency.setValueAtTime(freq * (1 + (idx - 1.5) * 0.002), t);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, t);

          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + beat * 2.2);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(master);

          osc.start(t);
          osc.stop(t + beat * 2.3);
        });
      }

      // 3. Boom-Bap Drums (starts at 6s)
      for (let t = 6; t < totalTime - 2; t += beat) {
        const b = Math.round(t / beat);
        if (b % 2 === 0) {
          // Soft kick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
          gain.gain.setValueAtTime(0.7, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.connect(gain);
          gain.connect(master);
          osc.start(t);
          osc.stop(t + 0.35);
        } else {
          // Snare / Rim
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, t);
          gain.gain.setValueAtTime(0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          osc.connect(gain);
          gain.connect(master);
          osc.start(t);
          osc.stop(t + 0.2);
        }
      }
    },
  },
  {
    id: 'demo-cyber-bass',
    title: 'Cyber Circuit (Heavy Electro)',
    artist: 'WebAudio Synth Engine',
    bpm: 130,
    duration: 25,
    tags: ['Cyberpunk', '130 BPM', 'Heavy Bass', 'Aggressive'],
    annotations: [
      { timestamp: 0, label: 'Modulated Drone', note: 'Heavy distorted saw sweep', color: '#ef4444', type: 'section' },
      { timestamp: 6.5, label: 'Glitch Riser', note: 'Pitch bend upwards into drop', color: '#f59e0b', type: 'cue' },
      { timestamp: 9.2, label: 'MAIN BASS DROP', note: 'Sub-bass wobble and aggressive resonance', color: '#ec4899', type: 'drop' },
      { timestamp: 18.5, label: 'Second Phase', note: 'High frequency stutter and stereo ping-pong', color: '#3b82f6', type: 'section' },
    ],
    generator: (ctx) => {
      const totalTime = 25;
      const bpm = 130;
      const beat = 60 / bpm; // ~0.46s

      const master = ctx.createGain();
      master.gain.value = 0.85;
      master.connect(ctx.destination);

      // Heavy distorted bass notes
      const notes = [41.2, 41.2, 46.25, 49, 41.2, 55, 49, 36.7]; // E1 ...
      for (let t = 0; t < totalTime; t += beat * 0.5) {
        const note = notes[Math.floor(t / beat) % notes.length];
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(note, t);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(note * 2, t);

        filter.type = 'lowpass';
        // LFO resonance modulation
        const cutoff = 400 + 1200 * Math.abs(Math.sin(t * 3.5));
        filter.frequency.setValueAtTime(cutoff, t);
        filter.Q.value = 6;

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.48);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + beat * 0.5);
        osc2.stop(t + beat * 0.5);
      }

      // Hard Kick on every beat
      for (let t = 0; t < totalTime; t += beat) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + 0.25);
      }
    },
  },
  {
    id: 'demo-ambient-soundscape',
    title: 'Cosmic Drift (Ambient Drone)',
    artist: 'WebAudio Synth Engine',
    bpm: 70,
    duration: 30,
    tags: ['Ambient', 'Pads', 'Ethereal', 'Harmonics'],
    annotations: [
      { timestamp: 0, label: 'Root Drone', note: 'Low C fundamental drone with warm sub', color: '#10b981', type: 'section' },
      { timestamp: 8, label: 'Harmonic Sweep', note: 'Resonant harmonic overtones sweeping', color: '#06b6d4', type: 'section' },
      { timestamp: 16, label: 'Shimmer Peaks', note: 'High frequency crystalline crystal bell tones', color: '#a855f7', type: 'drop' },
      { timestamp: 24, label: 'Infinite Reverb Tail', note: 'Gentle dissolve into silence', color: '#6366f1', type: 'cue' },
    ],
    generator: (ctx) => {
      const totalTime = 30;
      const master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);

      // Low drone (C2 - 65.41 Hz)
      const rootFrequencies = [65.41, 130.81, 196.0, 261.63, 392.0];
      rootFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const panner = ctx.createStereoPanner();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, 0);

        panner.pan.setValueAtTime((idx % 2 === 0 ? 1 : -1) * 0.4, 0);

        gain.gain.setValueAtTime(0.001, 0);
        gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), 4);
        gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), totalTime - 5);
        gain.gain.linearRampToValueAtTime(0.001, totalTime);

        osc.connect(panner);
        panner.connect(gain);
        gain.connect(master);

        osc.start(0);
        osc.stop(totalTime);
      });

      // Crystal shimmer bells
      const bellTimes = [4, 8, 12, 16, 20, 24];
      const bellPitches = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];

      bellTimes.forEach((time, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(bellPitches[i % bellPitches.length], time);
        panner.pan.setValueAtTime(Math.sin(i * 1.5) * 0.7, time);

        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 4);

        osc.connect(panner);
        panner.connect(gain);
        gain.connect(master);

        osc.start(time);
        osc.stop(time + 4.5);
      });
    },
  },
];

/**
 * Generates all demo tracks into AudioTrack objects with WAV blobs & extracted peaks
 */
export async function generateDemoTracks(): Promise<AudioTrack[]> {
  const tracks: AudioTrack[] = [];

  for (const spec of DEMO_SPECS) {
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(2, sampleRate * spec.duration, sampleRate);
    spec.generator(offlineCtx);

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWavBlob(renderedBuffer);
    const peaks = await extractPeaks(renderedBuffer, 400);

    const annotations: TrackAnnotation[] = spec.annotations.map((a, index) => ({
      id: `${spec.id}-ann-${index}`,
      trackId: spec.id,
      timestamp: a.timestamp,
      endTimestamp: a.endTimestamp,
      label: a.label,
      note: a.note,
      color: a.color,
      type: a.type,
      createdAt: Date.now(),
    }));

    tracks.push({
      id: spec.id,
      title: spec.title,
      artist: spec.artist,
      duration: spec.duration,
      fileSize: wavBlob.size,
      mimeType: 'audio/wav',
      blob: wavBlob,
      url: URL.createObjectURL(wavBlob),
      peaks: peaks,
      createdAt: Date.now(),
      playlistId: 'demo_playlist',
      isDemo: true,
      bpm: spec.bpm,
      tags: spec.tags,
      annotations: annotations,
      sampleRate: sampleRate,
      numberOfChannels: 2,
    });
  }

  return tracks;
}
