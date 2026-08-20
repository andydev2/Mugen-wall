import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Download, Heart, ThumbsDown, Eye } from 'lucide-react';
import DevicePreview from './DevicePreview';
import { downloadImage } from '../utils/downloadImage';
import './WallpaperModal.css';

export default function WallpaperModal({ wallpaper, onClose, activeCategory }) {
  const dialogRef = useRef(null);
  
  // Wallhaven API returns `.path` for full resolution image. Fallback to old format just in case.
  const imageUrl = wallpaper.path || wallpaper.url || `/wallpapers/${wallpaper.filename}`;
  const initialTitle = wallpaper.resolution ? `${wallpaper.category} - ${wallpaper.resolution}` : wallpaper.title || `Wallpaper ${wallpaper.id}`;
  const [displayTitle, setDisplayTitle] = useState(initialTitle);
  const [device, setDevice] = useState(activeCategory === 'Mobile' ? 'mobile' : 'desktop');

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  
  const hashString = (str) => {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };
  
  const baseStats = useMemo(() => {
    const hash = hashString(wallpaper.id.toString());
    return {
      dislikes: (hash % 50) + 2,
      downloads: wallpaper.stats?.downloads || (hash % 15000) + 1500 // Real if available, otherwise simulated
    };
  }, [wallpaper.id, wallpaper.stats]);

  const [realViews, setRealViews] = useState(wallpaper.views || wallpaper.stats?.views || 0);
  const [localLikes, setLocalLikes] = useState(wallpaper.favorites || wallpaper.stats?.likes || 0);
  const [localDislikes, setLocalDislikes] = useState(baseStats.dislikes);
  const [downloads, setDownloads] = useState(baseStats.downloads);

  useEffect(() => {
    const action = localStorage.getItem(`interaction_${wallpaper.id}`);
    if (action === 'like') {
      setIsLiked(true);
      setLocalLikes((wallpaper.favorites || wallpaper.stats?.likes || 0) + 1);
    } else if (action === 'dislike') {
      setIsDisliked(true);
      setLocalDislikes(baseStats.dislikes + 1);
    }
  }, [wallpaper.id, baseStats]);

  const handleLike = () => {
    const baseLikes = wallpaper.favorites || wallpaper.stats?.likes || 0;
    if (isLiked) {
      setIsLiked(false);
      setLocalLikes(baseLikes);
      localStorage.removeItem(`interaction_${wallpaper.id}`);
    } else {
      setIsLiked(true);
      setLocalLikes(baseLikes + 1);
      if (isDisliked) {
        setIsDisliked(false);
        setLocalDislikes(baseStats.dislikes);
      }
      localStorage.setItem(`interaction_${wallpaper.id}`, 'like');
    }
  };

  const handleDislike = () => {
    const baseLikes = wallpaper.favorites || wallpaper.stats?.likes || 0;
    if (isDisliked) {
      setIsDisliked(false);
      setLocalDislikes(baseStats.dislikes);
      localStorage.removeItem(`interaction_${wallpaper.id}`);
    } else {
      setIsDisliked(true);
      setLocalDislikes(baseStats.dislikes + 1);
      if (isLiked) {
        setIsLiked(false);
        setLocalLikes(baseLikes);
      }
      localStorage.setItem(`interaction_${wallpaper.id}`, 'dislike');
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (wallpaper.id && !wallpaper.id.toString().startsWith('tmdb-') && !wallpaper.id.toString().startsWith('px-')) {
      fetch(`/api/v1/w/${wallpaper.id}`)
        .then(res => res.json())
        .then(json => {
          if (isMounted && json.data) {
            if (json.data.views) setRealViews(json.data.views);
            if (json.data.tags) {
              const tags = json.data.tags.slice(0, 3).map(t => t.name.replace(/\b\w/g, c => c.toUpperCase())).join(' • ');
              if (tags) setDisplayTitle(tags);
            }
          }
        })
        .catch(err => console.error(err));
    }
    return () => { isMounted = false; };
  }, [wallpaper.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();

      // Fallback for browsers without closedby support
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const handleLightDismiss = (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (!isDialogContent) {
            dialog.close();
          }
        };
        dialog.addEventListener('click', handleLightDismiss);
        return () => dialog.removeEventListener('click', handleLightDismiss);
      }
    }
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleDownload = (width, height, qualityName) => {
    downloadImage(imageUrl, displayTitle, width, height, qualityName);
    setDownloads(prev => prev + 1);
  };

  return (
    <dialog 
      ref={dialogRef} 
      className="wallpaper-modal glass" 
      closedby="any" 
      onClose={handleClose}
    >
      <div className="modal-content animate-fade-in">
        <div className="modal-header">
          <h2>{displayTitle}</h2>
          <button className="close-btn" aria-label="Close modal" onClick={() => dialogRef.current.close()}>
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="wallpaper-stats">
            <button className={`stat-btn ${isLiked ? 'active-like' : ''}`} onClick={handleLike} aria-label="Like">
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{localLikes.toLocaleString()}</span>
            </button>
            <button className={`stat-btn ${isDisliked ? 'active-dislike' : ''}`} onClick={handleDislike} aria-label="Dislike">
              <ThumbsDown size={20} fill={isDisliked ? 'currentColor' : 'none'} />
              <span>{localDislikes.toLocaleString()}</span>
            </button>
            <div className="stat-info stat-views">
              <Eye size={20} />
              <span>{realViews.toLocaleString()} Views</span>
            </div>
            <div className="stat-info stat-downloads">
              <Download size={20} />
              <span>{downloads.toLocaleString()} Downloads</span>
            </div>
          </div>
          
          <div className="modal-preview-wrapper">
            <DevicePreview imageUrl={imageUrl} title={displayTitle} device={device} setDevice={setDevice} />
          </div>

          <div className="download-section">
            <h3>Download Options</h3>
            <div className="download-buttons">
              {device === 'desktop' && (
                <>
                  <button className="btn-download" onClick={() => handleDownload(3840, 2160, '4K Desktop')}>
                    <Download size={18} aria-hidden="true" /><span>4K (3840x2160)</span>
                  </button>
                  <button className="btn-download" onClick={() => handleDownload(2560, 1440, '2K Desktop')}>
                    <Download size={18} aria-hidden="true" /><span>2K (2560x1440)</span>
                  </button>
                  <button className="btn-download" onClick={() => handleDownload(1920, 1080, '1080p Desktop')}>
                    <Download size={18} aria-hidden="true" /><span>1080p (1920x1080)</span>
                  </button>
                </>
              )}
              {device === 'mobile' && (
                <>
                  <button className="btn-download" onClick={() => handleDownload(2160, 3840, '4K Mobile')}>
                    <Download size={18} aria-hidden="true" /><span>4K (2160x3840)</span>
                  </button>
                  <button className="btn-download" onClick={() => handleDownload(1440, 2560, '2K Mobile')}>
                    <Download size={18} aria-hidden="true" /><span>2K (1440x2560)</span>
                  </button>
                  <button className="btn-download" onClick={() => handleDownload(1080, 1920, '1080p Mobile')}>
                    <Download size={18} aria-hidden="true" /><span>1080p (1080x1920)</span>
                  </button>
                </>
              )}
              {device === 'tablet' && (
                <>
                  <button className="btn-download" onClick={() => handleDownload(2880, 2160, '4K Tablet')}>
                    <Download size={18} aria-hidden="true" /><span>4K (2880x2160)</span>
                  </button>
                  <button className="btn-download" onClick={() => handleDownload(2048, 1536, '2K Tablet')}>
                    <Download size={18} aria-hidden="true" /><span>2K (2048x1536)</span>
                  </button>
                  <button className="btn-download" onClick={() => handleDownload(1024, 768, 'iPad Tablet')}>
                    <Download size={18} aria-hidden="true" /><span>iPad (1024x768)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
