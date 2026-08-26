import { useState, useRef, useEffect } from 'react';
import { MediaLibraryItem, BirthdayConfig } from '../types';
import {
  uploadMediaToServer,
  fetchMediaListFromServer,
  deleteMediaFromServer,
  detectMediaType,
} from '../services/mediaCloudService';
import { sound } from '../utils/audio';
import {
  Folder,
  Music,
  Video,
  Image as ImageIcon,
  UploadCloud,
  Play,
  Pause,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
  Eye,
  X,
  Volume2,
} from 'lucide-react';

interface MediaFolderManagerProps {
  config: BirthdayConfig;
  onUpdateConfig: (updater: (prev: BirthdayConfig) => BirthdayConfig) => void;
  onSelectMediaFor?: (target: 'intro' | 'bgMusic' | 'celebrationVideo' | 'surpriseBox', item: MediaLibraryItem) => void;
  selectionMode?: 'all' | 'audio' | 'video' | 'image';
  isPickerModal?: boolean;
  onClosePicker?: () => void;
}

export function MediaFolderManager({
  config,
  onUpdateConfig,
  onSelectMediaFor,
  selectionMode = 'all',
  isPickerModal = false,
  onClosePicker,
}: MediaFolderManagerProps) {
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'video' | 'image'>(selectionMode);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Combine config.mediaLibrary with server files
  const mediaList: MediaLibraryItem[] = config.mediaLibrary || [];

  // Refresh media list from server on mount
  useEffect(() => {
    refreshMediaFiles();
  }, []);

  const refreshMediaFiles = async () => {
    setIsRefreshing(true);
    try {
      const serverFiles = await fetchMediaListFromServer();
      if (serverFiles.length > 0) {
        onUpdateConfig((prev) => {
          const existing = prev.mediaLibrary || [];
          const existingMap = new Map(existing.map((item) => [item.url, item]));

          serverFiles.forEach((sf) => {
            if (!existingMap.has(sf.url)) {
              existingMap.set(sf.url, sf);
            }
          });

          return {
            ...prev,
            mediaLibrary: Array.from(existingMap.values()),
          };
        });
      }
    } catch (err) {
      console.warn('Error refreshing media list:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    sound.playSparkleChime();

    const newItems: MediaLibraryItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${file.name} (${i + 1}/${files.length})...`);

      try {
        const detectedType = detectMediaType(file.name, file.type);
        const result = await uploadMediaToServer(file, file.name, file.type);

        if (result && result.url) {
          const item: MediaLibraryItem = result.item || {
            id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            type: detectedType,
            mimeType: file.type,
            url: result.url,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };
          newItems.push(item);
        }
      } catch (err) {
        console.error('Failed to upload file to media folder:', err);
      }
    }

    if (newItems.length > 0) {
      onUpdateConfig((prev) => ({
        ...prev,
        mediaLibrary: [...newItems, ...(prev.mediaLibrary || [])],
      }));
      sound.playCelebrationPop();
    }

    setIsUploading(false);
    setUploadProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteItem = async (item: MediaLibraryItem) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" from Media Folder?`)) {
      return;
    }

    // If it's a server file, call delete
    if (item.url.startsWith('/api/media/')) {
      const filename = item.url.replace('/api/media/', '');
      await deleteMediaFromServer(filename);
    }

    onUpdateConfig((prev) => ({
      ...prev,
      mediaLibrary: (prev.mediaLibrary || []).filter((m) => m.id !== item.id && m.url !== item.url),
    }));

    if (playingAudioId === item.id) {
      stopAudioPreview();
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    sound.playPop();
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleAudioPreview = (item: MediaLibraryItem) => {
    if (playingAudioId === item.id) {
      stopAudioPreview();
    } else {
      stopAudioPreview();
      const audio = new Audio(item.url);
      audio.volume = 0.85;
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => setPlayingAudioId(null);
      audio.play().catch(() => setPlayingAudioId(null));
      audioPreviewRef.current = audio;
      setPlayingAudioId(item.id);
    }
  };

  const stopAudioPreview = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.src = '';
      audioPreviewRef.current = null;
    }
    setPlayingAudioId(null);
  };

  // Actions to assign media to birthday config
  const assignToIntro = (item: MediaLibraryItem) => {
    onUpdateConfig((prev) => ({
      ...prev,
      introMusicEnabled: true,
      introMusicType: 'upload',
      introMusicAudioUrl: item.url,
      introMusicAudioName: item.name,
    }));
    sound.playSparkleChime();
    if (onClosePicker) onClosePicker();
  };

  const assignToBackground = (item: MediaLibraryItem) => {
    onUpdateConfig((prev) => ({
      ...prev,
      bgMusicEnabled: true,
      musicType: 'upload',
      musicAudioUrl: item.url,
      musicAudioName: item.name,
    }));
    sound.playSparkleChime();
    if (onClosePicker) onClosePicker();
  };

  const assignToCelebrationVideo = (item: MediaLibraryItem) => {
    onUpdateConfig((prev) => ({
      ...prev,
      celebrationVideoType: 'upload',
      celebrationVideoUrl: item.url,
      celebrationVideoName: item.name,
    }));
    sound.playSparkleChime();
    if (onClosePicker) onClosePicker();
  };

  const assignToSurpriseBox = (item: MediaLibraryItem) => {
    onUpdateConfig((prev) => ({
      ...prev,
      surpriseBoxMediaType: item.type === 'video' ? 'video' : 'image',
      surpriseBoxMediaUrl: item.url,
      surpriseBoxMediaName: item.name,
    }));
    sound.playSparkleChime();
    if (onClosePicker) onClosePicker();
  };

  const filteredMedia = mediaList.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Info */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-pink-500/10 border border-rose-200/50 dark:border-rose-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-romantic text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Media Folder & Storage Vault
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-sans-clean font-medium border border-emerald-500/30">
                  Global Sync Active
                </span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Yahan apne saare songs, birthday celebration videos aur images upload karein. Save hone par ye sabhi visitors ke mobile/PC par 100% same chalengi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={refreshMediaFiles}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-750 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              title="Refresh Folder"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-medium flex items-center gap-2 transition-all shadow-md shadow-rose-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Media</span>
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*,image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Upload Drag & Drop Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isUploading
            ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 animate-pulse'
            : 'border-stone-300 dark:border-stone-700 hover:border-rose-400 dark:hover:border-rose-500 bg-stone-50/50 dark:bg-stone-850/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
            <UploadCloud className="w-6 h-6 animate-bounce" />
          </div>
          <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            {isUploading ? uploadProgress : 'Click ya Drag karke Audio, Video ya Photos upload karein'}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
            Supports MP3, WAV, M4A songs • MP4, WebM videos • JPG, PNG pictures (Fast Streaming via Cloud Server)
          </p>
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            All ({mediaList.length})
          </button>
          <button
            onClick={() => setFilterType('audio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              filterType === 'audio'
                ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-400 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Songs ({mediaList.filter((m) => m.type === 'audio').length})
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              filterType === 'video'
                ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Videos ({mediaList.filter((m) => m.type === 'video').length})
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              filterType === 'image'
                ? 'bg-white dark:bg-stone-700 text-pink-600 dark:text-pink-400 shadow-sm font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photos ({mediaList.filter((m) => m.type === 'image').length})
          </button>
        </div>

        <span className="text-xs text-stone-500 dark:text-stone-400">
          Showing {filteredMedia.length} of {mediaList.length} files
        </span>
      </div>

      {/* Media Cards Grid */}
      {filteredMedia.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-stone-50 dark:bg-stone-850/50 border border-stone-200 dark:border-stone-800">
          <Folder className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Media Folder Khali Hai</p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            Upar diye gaye upload button se apna pehla song ya video upload karein.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredMedia.map((item) => {
            const isAudio = item.type === 'audio';
            const isVideo = item.type === 'video';
            const isImage = item.type === 'image';
            const isPlayingThis = playingAudioId === item.id;

            return (
              <div
                key={item.id || item.url}
                className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Media Type Icon / Thumbnail Preview */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative ${
                      isAudio
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        : isVideo
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        : 'bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400'
                    }`}
                  >
                    {isImage ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    ) : isAudio ? (
                      <Music className="w-6 h-6" />
                    ) : (
                      <Video className="w-6 h-6" />
                    )}

                    {/* Audio Play/Pause Overlay */}
                    {isAudio && (
                      <button
                        onClick={() => toggleAudioPreview(item)}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                        title={isPlayingThis ? 'Pause' : 'Play Song'}
                      >
                        {isPlayingThis ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                      </button>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-wide uppercase ${
                          isAudio
                            ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                            : isVideo
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            : 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                        {formatFileSize(item.size)}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 truncate mt-1" title={item.name}>
                      {item.name}
                    </h4>

                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 truncate font-mono">
                      {formatDate(item.uploadedAt)}
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-750 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    {isAudio && (
                      <>
                        <button
                          onClick={() => assignToIntro(item)}
                          className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-medium transition-colors"
                          title="Set this as envelope intro song"
                        >
                          ✉️ Set Intro
                        </button>
                        <button
                          onClick={() => assignToBackground(item)}
                          className="px-2 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 hover:bg-pink-100 text-[11px] font-medium transition-colors"
                          title="Set this as background romantic music"
                        >
                          🎵 Set Background
                        </button>
                      </>
                    )}

                    {isVideo && (
                      <>
                        <button
                          onClick={() => assignToCelebrationVideo(item)}
                          className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-[11px] font-medium transition-colors"
                          title="Set as candle blow celebration video"
                        >
                          🎂 Candle Blow Video
                        </button>
                        <button
                          onClick={() => assignToSurpriseBox(item)}
                          className="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[11px] font-medium transition-colors"
                          title="Set as Surprise Gift Box video"
                        >
                          🎁 Surprise Box
                        </button>
                        <button
                          onClick={() => setPreviewVideoUrl(item.url)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                          title="Preview Video"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {isImage && (
                      <button
                        onClick={() => assignToSurpriseBox(item)}
                        className="px-2 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 hover:bg-pink-100 text-[11px] font-medium transition-colors"
                      >
                        🎁 Use in Surprise Box
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(item.url, item.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete from Media Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Preview Lightbox Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-700">
            <div className="p-3 bg-stone-800 flex items-center justify-between border-b border-stone-700">
              <span className="text-xs font-semibold text-stone-200">Video Preview</span>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="p-1.5 rounded-full hover:bg-stone-700 text-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <video src={previewVideoUrl} controls autoPlay className="w-full max-h-[60vh] object-contain bg-black" />
          </div>
        </div>
      )}
    </div>
  );
}
