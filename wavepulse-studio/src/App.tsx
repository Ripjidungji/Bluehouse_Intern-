import React, { useState, useEffect, useCallback } from 'react';
import {
  AudioTrack,
  Playlist,
  TrackAnnotation,
  VisualizerConfig,
  VisualizerMode,
} from './types';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import {
  getAllTracks,
  saveTrack,
  deleteTrack as dbDeleteTrack,
  getAllPlaylists,
  savePlaylists,
  deletePlaylist as dbDeletePlaylist,
  saveAnnotation,
  deleteAnnotation as dbDeleteAnnotation,
} from './utils/indexedDb';
import { generateDemoTracks } from './utils/audioSynthesizer';
import {
  decodeAudioData,
  sliceAudioBuffer,
  audioBufferToWavBlob,
  extractPeaks,
} from './utils/audioBufferUtils';

import { AudioEngineHeader } from './components/AudioEngineHeader';
import { VisualizerStage } from './components/VisualizerStage';
import { WaveformScrubber } from './components/WaveformScrubber';
import { PlaylistManager } from './components/PlaylistManager';
import { EqualizerPanel } from './components/EqualizerPanel';
import { AnnotationList } from './components/AnnotationList';

import {
  ListMusic,
  Sliders,
  Bookmark,
  Sparkles,
} from 'lucide-react';

const DEFAULT_PLAYLISTS: Playlist[] = [
  { id: 'default', name: 'Main Collection', color: '#06b6d4', createdAt: Date.now() },
  { id: 'favorites', name: 'Favorites & Cues', color: '#ec4899', createdAt: Date.now() },
  { id: 'slices', name: 'Sample Cuts & Slices', color: '#8b5cf6', createdAt: Date.now() },
];

export default function App() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'library' | 'equalizer' | 'annotations'>('library');
  const [isGeneratingDemos, setIsGeneratingDemos] = useState<boolean>(false);
  const [sliceToastMessage, setSliceToastMessage] = useState<string | null>(null);

  // Visualizer Configuration State
  const [visualizerConfig, setVisualizerConfig] = useState<VisualizerConfig>({
    mode: 'spectrum_bars',
    theme: 'cyber_neon',
    fftSize: 1024,
    smoothing: 0.8,
    sensitivity: 1.2,
    barCount: 64,
    glowIntensity: 0.8,
    mirrorMode: true,
    peakHold: true,
    showEnergyHud: true,
  });

  // Custom Audio Player Hook
  const {
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
    audioContext,
    getByteFrequencyData,
    getByteTimeDomainData,
    getAudioMetrics,
    updateAnalyserSettings,
  } = useAudioPlayer();

  // Keep AnalyserNode in sync when config changes
  useEffect(() => {
    updateAnalyserSettings(visualizerConfig.fftSize, visualizerConfig.smoothing);
  }, [visualizerConfig.fftSize, visualizerConfig.smoothing, updateAnalyserSettings]);

  // Load Initial Library from IndexedDB
  useEffect(() => {
    async function initLibrary() {
      try {
        const [storedTracks, storedPlaylists] = await Promise.all([
          getAllTracks(),
          getAllPlaylists(),
        ]);

        if (storedPlaylists.length > 0) {
          setPlaylists(storedPlaylists);
        } else {
          await savePlaylists(DEFAULT_PLAYLISTS);
          setPlaylists(DEFAULT_PLAYLISTS);
        }

        if (storedTracks.length > 0) {
          setTracks(storedTracks);
          // Preload first track
          loadTrack(storedTracks[0], false);
        } else {
          // Generate high quality demo tracks on first load!
          handleLoadDemoTracks();
        }
      } catch (err) {
        console.error('Failed to initialize database:', err);
      }
    }
    initLibrary();
  }, []);

  // Generate / Reload Built-in Demo Tracks
  const handleLoadDemoTracks = useCallback(async () => {
    setIsGeneratingDemos(true);
    try {
      const demoTracks = await generateDemoTracks();
      for (const t of demoTracks) {
        await saveTrack(t, t.blob);
      }
      setTracks((prev) => {
        // Replace or merge demo tracks
        const nonDemos = prev.filter((p) => !p.isDemo);
        return [...demoTracks, ...nonDemos];
      });
      if (demoTracks.length > 0) {
        loadTrack(demoTracks[0], false);
      }
      showToast('Synthesized 4 demo audio tracks with annotations!');
    } catch (err) {
      console.error('Error generating demo tracks:', err);
    } finally {
      setIsGeneratingDemos(false);
    }
  }, [loadTrack]);

  // Toast notifier
  const showToast = (msg: string) => {
    setSliceToastMessage(msg);
    setTimeout(() => setSliceToastMessage(null), 4000);
  };

  // Upload New Tracks Handler
  const handleUploadTracks = async (newTracks: AudioTrack[], blobs: Blob[]) => {
    for (let i = 0; i < newTracks.length; i++) {
      await saveTrack(newTracks[i], blobs[i]);
    }
    setTracks((prev) => [...newTracks, ...prev]);
    showToast(`Imported ${newTracks.length} audio file(s) to library`);
  };

  // Delete Track Handler
  const handleDeleteTrack = async (trackId: string) => {
    await dbDeleteTrack(trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      const remaining = tracks.filter((t) => t.id !== trackId);
      if (remaining.length > 0) {
        loadTrack(remaining[0], false);
      }
    }
    showToast('Track removed from library');
  };

  // Playlist Management
  const handleCreatePlaylist = async (name: string, color: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      color,
      createdAt: Date.now(),
    };
    const updated = [...playlists, newPl];
    await savePlaylists(updated);
    setPlaylists(updated);
    setSelectedPlaylistId(newPl.id);
    showToast(`Created playlist "${name}"`);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    await dbDeletePlaylist(playlistId);
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId('all');
    }
  };

  // Annotation Handlers
  const handleAddAnnotation = async (annData: Omit<TrackAnnotation, 'id' | 'createdAt'>) => {
    if (!currentTrack) return;
    const newAnn: TrackAnnotation = {
      ...annData,
      id: `ann-${Date.now()}`,
      createdAt: Date.now(),
    };

    await saveAnnotation(newAnn);

    // Update in-memory track state
    const updatedAnnotations = [...(currentTrack.annotations || []), newAnn];
    const updatedTrack: AudioTrack = {
      ...currentTrack,
      annotations: updatedAnnotations,
    };

    await saveTrack(updatedTrack);
    setTracks((prev) => prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)));
    showToast(`Added marker @ ${annData.timestamp.toFixed(2)}s`);
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (!currentTrack) return;
    await dbDeleteAnnotation(annotationId);

    const updatedAnnotations = (currentTrack.annotations || []).filter((a) => a.id !== annotationId);
    const updatedTrack: AudioTrack = {
      ...currentTrack,
      annotations: updatedAnnotations,
    };

    await saveTrack(updatedTrack);
    setTracks((prev) => prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)));
    showToast('Marker deleted');
  };

  // Audio Slicing / Trimming Execution
  const handleSliceTrack = async (
    startTime: number,
    endTime: number,
    action: 'save_track' | 'download_wav'
  ) => {
    if (!currentTrack || !currentTrack.blob) {
      alert('No audio data available to slice.');
      return;
    }

    try {
      showToast('Processing audio slice...');
      const arrayBuffer = await currentTrack.blob.arrayBuffer();
      const decodedBuffer = await decodeAudioData(arrayBuffer, audioContext || undefined);
      const slicedBuffer = sliceAudioBuffer(decodedBuffer, startTime, endTime, audioContext || undefined);
      const wavBlob = audioBufferToWavBlob(slicedBuffer);

      const sliceDuration = slicedBuffer.duration;
      const sliceTitle = `${currentTrack.title} [Cut ${startTime.toFixed(1)}s-${endTime.toFixed(1)}s]`;

      if (action === 'download_wav') {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(wavBlob);
        a.download = `${sliceTitle}.wav`;
        a.click();
        showToast(`Exported sliced WAV (${sliceDuration.toFixed(2)}s) to disk`);
      } else {
        const slicePeaks = await extractPeaks(slicedBuffer, 300);
        const sliceTrackId = `slice-${Date.now()}`;

        const slicedTrack: AudioTrack = {
          id: sliceTrackId,
          title: sliceTitle,
          artist: `Sample Cut of ${currentTrack.title}`,
          duration: sliceDuration,
          fileSize: wavBlob.size,
          mimeType: 'audio/wav',
          blob: wavBlob,
          url: URL.createObjectURL(wavBlob),
          peaks: slicePeaks,
          createdAt: Date.now(),
          playlistId: 'slices',
          tags: ['Sample Cut', `${sliceDuration.toFixed(1)}s`, 'Sliced'],
          sampleRate: slicedBuffer.sampleRate,
          numberOfChannels: slicedBuffer.numberOfChannels,
        };

        await saveTrack(slicedTrack, wavBlob);
        setTracks((prev) => [slicedTrack, ...prev]);
        showToast(`Saved new slice track to "Sample Cuts" playlist!`);
        // Switch to slice track
        loadTrack(slicedTrack, true);
      }
    } catch (err) {
      console.error('Failed to slice track:', err);
      showToast('Failed to slice track.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-5 flex flex-col gap-5 max-w-7xl mx-auto selection:bg-cyan-500 selection:text-black">
      {/* Top Header & Telemetry */}
      <AudioEngineHeader
        audioContextState={audioContextState}
        sampleRate={audioContext?.sampleRate || currentTrack?.sampleRate || 44100}
        isMicActive={isMicActive}
        isPlaying={isPlaying}
        onToggleMicrophone={toggleMicrophone}
      />

      {/* Main Real-Time 60 FPS Visualizer Stage */}
      <section className="w-full h-[400px] sm:h-[460px]">
        <VisualizerStage
          isPlaying={isPlaying}
          isMicActive={isMicActive}
          trackTitle={currentTrack?.title}
          artistName={currentTrack?.artist}
          getByteFrequencyData={getByteFrequencyData}
          getByteTimeDomainData={getByteTimeDomainData}
          getAudioMetrics={getAudioMetrics}
          config={visualizerConfig}
          onConfigChange={(newConfig) =>
            setVisualizerConfig((prev) => ({ ...prev, ...newConfig }))
          }
        />
      </section>

      {/* Interactive Waveform Scrubber & Slicing Tool */}
      <section className="w-full">
        <WaveformScrubber
          currentTrack={currentTrack}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          isLoopingTrack={isLoopingTrack}
          volume={volume}
          isMuted={isMuted}
          playbackRate={playbackRate}
          abLoop={abLoop}
          onTogglePlay={togglePlay}
          onSeek={seek}
          onToggleLoopTrack={toggleLoopTrack}
          onSetVolume={setVolume}
          onToggleMute={toggleMute}
          onSetPlaybackRate={setPlaybackRate}
          onSetAbLoop={setAbLoop}
          onClearAbLoop={clearAbLoop}
          onAddAnnotation={handleAddAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          onSliceTrack={handleSliceTrack}
        />
      </section>

      {/* Studio Workbench Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            id="tab-btn-library"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>Audio Playlists ({tracks.length})</span>
          </button>

          <button
            id="tab-btn-equalizer"
            onClick={() => setActiveTab('equalizer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'equalizer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>5-Band EQ & DSP</span>
          </button>

          <button
            id="tab-btn-annotations"
            onClick={() => setActiveTab('annotations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'annotations'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Timecode Cue Sheet ({currentTrack?.annotations?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Active Tab Panel Stage */}
      <main className="w-full">
        {activeTab === 'library' && (
          <PlaylistManager
            tracks={tracks}
            playlists={playlists}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            selectedPlaylistId={selectedPlaylistId}
            onSelectPlaylist={setSelectedPlaylistId}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onSelectTrack={(track, autoPlay) => loadTrack(track, autoPlay ?? true)}
            onUploadTracks={handleUploadTracks}
            onDeleteTrack={handleDeleteTrack}
            onLoadDemoTracks={handleLoadDemoTracks}
            isGeneratingDemos={isGeneratingDemos}
          />
        )}

        {activeTab === 'equalizer' && (
          <EqualizerPanel
            eqBands={eqBands}
            eqPreset={eqPreset}
            pan={pan}
            playbackRate={playbackRate}
            onSetEqBand={setEqBand}
            onApplyPreset={applyEqPreset}
            onSetPan={setPan}
            onSetPlaybackRate={setPlaybackRate}
            onPlaySynthTone={playSynthTone}
          />
        )}

        {activeTab === 'annotations' && (
          <AnnotationList
            currentTrack={currentTrack}
            currentTime={currentTime}
            onSeek={seek}
            onSetAbLoop={setAbLoop}
            onDeleteAnnotation={handleDeleteAnnotation}
            onAddAnnotation={handleAddAnnotation}
          />
        )}
      </main>

      {/* Floating Status Toast Notification */}
      {sliceToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-cyan-500/60 text-cyan-200 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{sliceToastMessage}</span>
        </div>
      )}
    </div>
  );
}
