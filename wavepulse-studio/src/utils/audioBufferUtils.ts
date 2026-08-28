/**
 * Audio Buffer Utilities for Web Audio API:
 * - Peak extraction for responsive waveform visualization
 * - Audio slicing / sub-buffer extraction
 * - AudioBuffer to WAV Blob encoder
 * - Audio metadata extraction
 */

let sharedAudioContext: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioContextClass();
  }
  return sharedAudioContext;
}

/**
 * Extracts normalized peak amplitudes (0 to 1) for static waveform rendering.
 */
export async function extractPeaks(
  audioBuffer: AudioBuffer,
  numPeaks: number = 400
): Promise<number[]> {
  const channelData = audioBuffer.getChannelData(0); // primary channel
  const totalSamples = channelData.length;
  const blockSize = Math.max(1, Math.floor(totalSamples / numPeaks));
  const peaks: number[] = [];

  for (let i = 0; i < numPeaks; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, totalSamples);
    let max = 0;

    for (let j = start; j < end; j++) {
      const val = Math.abs(channelData[j]);
      if (val > max) {
        max = val;
      }
    }
    peaks.push(Math.min(1, Math.max(0.02, max)));
  }

  // Normalize peaks so highest peak is scaled proportionally
  const highest = Math.max(...peaks, 0.1);
  return peaks.map((p) => Number((p / highest).toFixed(3)));
}

/**
 * Decodes an ArrayBuffer or File into an AudioBuffer using AudioContext
 */
export async function decodeAudioData(
  arrayBuffer: ArrayBuffer,
  ctx?: AudioContext
): Promise<AudioBuffer> {
  const context = ctx || getSharedAudioContext();
  if (context.state === 'suspended') {
    await context.resume();
  }
  // Clone arrayBuffer before decoding because decodeAudioData detaches it
  const bufferCopy = arrayBuffer.slice(0);
  return await context.decodeAudioData(bufferCopy);
}

/**
 * Slices an AudioBuffer from startTime to endTime into a new AudioBuffer
 */
export function sliceAudioBuffer(
  audioBuffer: AudioBuffer,
  startTime: number,
  endTime: number,
  ctx?: AudioContext
): AudioBuffer {
  const context = ctx || getSharedAudioContext();
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;

  const startOffset = Math.max(0, Math.floor(startTime * sampleRate));
  const endOffset = Math.min(audioBuffer.length, Math.floor(endTime * sampleRate));
  const frameCount = Math.max(1, endOffset - startOffset);

  const slicedBuffer = context.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const srcData = audioBuffer.getChannelData(channel);
    const destData = slicedBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      destData[i] = srcData[startOffset + i];
    }
  }

  return slicedBuffer;
}

/**
 * Encodes an AudioBuffer into a 16-bit PCM stereo/mono WAV Blob
 */
export function audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numFrames = audioBuffer.length;
  const dataSize = numFrames * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const dataView = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      dataView.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  dataView.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  dataView.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  dataView.setUint16(20, format, true); // AudioFormat
  dataView.setUint16(22, numChannels, true); // NumChannels
  dataView.setUint32(24, sampleRate, true); // SampleRate
  dataView.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  dataView.setUint16(32, blockAlign, true); // BlockAlign
  dataView.setUint16(34, bitDepth, true); // BitsPerSample

  // data sub-chunk
  writeString(36, 'data');
  dataView.setUint32(40, dataSize, true);

  // Interleave and write PCM 16-bit samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      // Clamp
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      dataView.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Format seconds into mm:ss or mm:ss.ms
 */
export function formatTime(seconds: number, includeMs: boolean = false): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;

  if (includeMs) {
    const ms = Math.floor((seconds % 1) * 100);
    const formattedMs = ms < 10 ? `0${ms}` : `${ms}`;
    return `${mins}:${formattedSecs}.${formattedMs}`;
  }

  return `${mins}:${formattedSecs}`;
}

/**
 * Format bytes to readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
