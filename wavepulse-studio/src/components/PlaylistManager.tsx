import React, { useState, useRef } from 'react';
import {
  AudioTrack,
  Playlist,
} from '../types';
import {
  formatTime,
  formatFileSize,
  decodeAudioData,
  extractPeaks,
} from '../utils/audioBufferUtils';
import {
  Music,
  Plus,
  Upload,
  Search,
  FolderPlus,
  Trash2,
  Play,
  Pause,
  Clock,
  Sparkles,
  Download,
  Folder,
  Tag,
  ListMusic,
  Layers,
} from 'lucide-react';

interface PlaylistManagerProps {
  tracks: AudioTrack[];
  playlists: Playlist[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  selectedPlaylistId: string;
  onSelectPlaylist: (playlistId: string) => void;
  onCreatePlaylist: (name: string, color: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onSelectTrack: (track: AudioTrack, autoPlay?: boolean) => void;
  onUploadTracks: (newTracks: AudioTrack[], blobs: Blob[]) => void;
  onDeleteTrack: (trackId: string) => void;
  onLoadDemoTracks: () => void;
  isGeneratingDemos?: boolean;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  tracks,
  playlists,
  currentTrack,
  isPlaying,
  selectedPlaylistId,
  onSelectPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onSelectTrack,
  onUploadTracks,
  onDeleteTrack,
  onLoadDemoTracks,
  isGeneratingDemos = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistColor, setNewPlaylistColor] = useState('#06b6d4');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter tracks
  const filteredTracks = tracks.filter((t) => {
    // Playlist filter
    const matchesPlaylist =
      selectedPlaylistId === 'all' ||
      (selectedPlaylistId === 'demo_playlist' && t.isDemo) ||
      (selectedPlaylistId === 'slices' && t.id.startsWith('slice-')) ||
      t.playlistId === selectedPlaylistId;

    if (!matchesPlaylist) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  // Handle file uploads (decoding & peak extraction)
  const processFiles = async (files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter(
      (f) =>
        f.type.startsWith('audio/') ||
        f.name.endsWith('.mp3') ||
        f.name.endsWith('.wav') ||
        f.name.endsWith('.ogg') ||
        f.name.endsWith('.flac') ||
        f.name.endsWith('.m4a') ||
        f.name.endsWith('.aac')
    );

    if (audioFiles.length === 0) return;

    setIsProcessingUpload(true);
    const newTracks: AudioTrack[] = [];
    const newBlobs: Blob[] = [];

    try {
      for (const file of audioFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await decodeAudioData(arrayBuffer);
        const peaks = await extractPeaks(audioBuffer, 400);

        // Derive track title from file name without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        const trackId = `track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const newTrack: AudioTrack = {
          id: trackId,
          title: cleanName,
          artist: 'Local Upload',
          duration: audioBuffer.duration,
          fileSize: file.size,
          mimeType: file.type || 'audio/mpeg',
          blob: file,
          url: URL.createObjectURL(file),
          peaks: peaks,
          createdAt: Date.now(),
          playlistId: selectedPlaylistId === 'all' ? 'default' : selectedPlaylistId,
          tags: ['Uploaded', `${audioBuffer.numberOfChannels}ch`, `${audioBuffer.sampleRate}Hz`],
          sampleRate: audioBuffer.sampleRate,
          numberOfChannels: audioBuffer.numberOfChannels,
        };

        newTracks.push(newTrack);
        newBlobs.push(file);
      }

      onUploadTracks(newTracks, newBlobs);
      if (newTracks.length > 0) {
        onSelectTrack(newTracks[0], true);
      }
    } catch (err) {
      console.error('Failed to process audio files:', err);
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim(), newPlaylistColor);
    setNewPlaylistName('');
    setShowNewPlaylistModal(false);
  };

  return (
    <div
      id="playlist-manager-panel"
      className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5 text-slate-200"
    >
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white tracking-wide">Audio Library & Playlists</h3>
          <span className="text-xs bg-slate-800 text-cyan-300 font-mono px-2 py-0.5 rounded-full">
            {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Demo Synthesizer Loader Button */}
          <button
            id="load-demos-btn"
            onClick={onLoadDemoTracks}
            disabled={isGeneratingDemos}
            title="Load or recreate high-quality Web Audio synth tracks"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingDemos ? 'Synthesizing...' : 'Load Synth Demos'}</span>
          </button>

          {/* Upload Button */}
          <button
            id="upload-track-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload MP3 / Audio</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac"
            multiple
            onChange={(e) => e.target.files && processFiles(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Playlist Folders Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onSelectPlaylist('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            selectedPlaylistId === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-inner'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Tracks ({tracks.length})</span>
        </button>

        <button
          onClick={() => onSelectPlaylist('demo_playlist')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            selectedPlaylistId === 'demo_playlist'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-inner'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Demo Synths ({tracks.filter((t) => t.isDemo).length})</span>
        </button>

        <button
          onClick={() => onSelectPlaylist('slices')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            selectedPlaylistId === 'slices'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-inner'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Sample Slices ({tracks.filter((t) => t.id.startsWith('slice-')).length})</span>
        </button>

        {/* User Playlists */}
        {playlists.map((pl) => {
          const isSelected = selectedPlaylistId === pl.id;
          const count = tracks.filter((t) => t.playlistId === pl.id).length;
          return (
            <div key={pl.id} className="flex items-center group">
              <button
                onClick={() => onSelectPlaylist(pl.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-r-0 border-cyan-500/50'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-r-0 border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pl.color }} />
                <span>{pl.name} ({count})</span>
              </button>
              <button
                onClick={() => onDeletePlaylist(pl.id)}
                title="Delete Playlist"
                className={`px-2 py-1.5 rounded-r-xl border text-slate-500 hover:text-red-400 transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-l-0 border-cyan-500/50'
                    : 'bg-slate-800/60 border-l-0 border-slate-700'
                }`}
              >
                ✕
              </button>
            </div>
          );
        })}

        {/* Add Playlist Button */}
        <button
          onClick={() => setShowNewPlaylistModal(true)}
          title="Create New Custom Playlist"
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border border-dashed border-slate-700 text-xs font-medium whitespace-nowrap transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Search Bar & Drag-Drop Target */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracks by title, artist, BPM, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3 sm:p-4 text-center cursor-pointer transition-all flex items-center justify-center gap-3 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
              : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 text-slate-400'
          }`}
        >
          <Upload className={`w-5 h-5 ${isDragging ? 'text-cyan-400 animate-bounce' : 'text-slate-500'}`} />
          <span className="text-xs">
            {isProcessingUpload
              ? 'Decoding audio & extracting waveforms...'
              : 'Drag & Drop MP3, WAV, OGG audio files here or click to browse'}
          </span>
        </div>
      </div>

      {/* Track List */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
        {filteredTracks.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs flex flex-col items-center gap-2">
            <Music className="w-8 h-8 text-slate-700" />
            <p>No tracks found in this category.</p>
            <button
              onClick={onLoadDemoTracks}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Generate Demo Synth Tracks
            </button>
          </div>
        ) : (
          filteredTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                id={`track-item-${track.id}`}
                onClick={() => onSelectTrack(track, true)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                {/* Left: Play State & Metadata */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrack(track, !isCurrent || !isPlaying);
                    }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-transform ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-950'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isCurrent ? 'text-cyan-300' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </h4>
                      {track.bpm && (
                        <span className="text-[10px] bg-slate-800 text-cyan-400 font-mono px-1.5 py-0.2 rounded border border-slate-700">
                          {track.bpm} BPM
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{track.artist}</span>
                      <span>•</span>
                      <span className="font-mono">{formatTime(track.duration)}</span>
                      <span>•</span>
                      <span>{formatFileSize(track.fileSize)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Waveform mini preview & actions */}
                <div className="flex items-center gap-3">
                  {/* Mini peak thumbnail */}
                  {track.peaks && (
                    <div className="hidden md:flex items-center gap-0.5 h-6 w-24 px-1 bg-slate-900 rounded border border-slate-800 overflow-hidden">
                      {track.peaks.slice(0, 24).map((p, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-cyan-500/60 rounded-full"
                          style={{ height: `${Math.max(15, p * 100)}%` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Download track */}
                  {track.blob && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(track.blob!);
                        a.download = `${track.title}.wav`;
                        a.click();
                      }}
                      title="Download audio file"
                      className="p-1.5 text-slate-500 hover:text-slate-200 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete track */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTrack(track.id);
                    }}
                    title="Delete track"
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Playlist Creation Modal */}
      {showNewPlaylistModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlaylistSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-4 text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-cyan-400" /> Create Custom Playlist
              </h4>
              <button
                type="button"
                onClick={() => setShowNewPlaylistModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1">Playlist Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Chillhop Beats, Slices & Loops"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1">Accent Color</label>
              <div className="flex items-center gap-2 pt-1">
                {['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewPlaylistColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      newPlaylistColor === c ? 'scale-125 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewPlaylistModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
