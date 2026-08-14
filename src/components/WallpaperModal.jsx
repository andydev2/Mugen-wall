import React, { useState, useEffect, useRef } from 'react';
import { X, Download } from 'lucide-react';
import DevicePreview from './DevicePreview';
import AdBanner from './AdBanner';
import { downloadImage } from '../utils/downloadImage';
import './WallpaperModal.css';

export default function WallpaperModal({ wallpaper, onClose }) {
  const dialogRef = useRef(null);
  
  // Wallhaven API returns `.path` for full resolution image. Fallback to old format just in case.
  const imageUrl = wallpaper.path || wallpaper.url || `/wallpapers/${wallpaper.filename}`;
  const initialTitle = wallpaper.resolution ? `${wallpaper.category} - ${wallpaper.resolution}` : wallpaper.title || `Wallpaper ${wallpaper.id}`;
  const [displayTitle, setDisplayTitle] = useState(initialTitle);

  useEffect(() => {
    let isMounted = true;
    if (wallpaper.id) {
      fetch(`/api/v1/w/${wallpaper.id}`)
        .then(res => res.json())
        .then(json => {
          if (isMounted && json.data && json.data.tags) {
            const tags = json.data.tags.slice(0, 3).map(t => t.name.replace(/\b\w/g, c => c.toUpperCase())).join(' • ');
            if (tags) setDisplayTitle(tags);
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
          <DevicePreview imageUrl={imageUrl} title={displayTitle} />

          <div className="download-section">
            <h3>Download Options</h3>
            <div className="download-buttons">
              <button 
                className="btn-download" 
                onClick={() => handleDownload(3840, 2160, '4K')}
              >
                <Download size={18} aria-hidden="true" />
                <span>4K (3840x2160)</span>
              </button>
              
              <button 
                className="btn-download" 
                onClick={() => handleDownload(2560, 1440, '2K')}
              >
                <Download size={18} aria-hidden="true" />
                <span>2K (2560x1440)</span>
              </button>
              
              <button 
                className="btn-download" 
                onClick={() => handleDownload(1920, 1080, '1080p')}
              >
                <Download size={18} aria-hidden="true" />
                <span>1080p (1920x1080)</span>
              </button>
            </div>
          </div>
          
          <AdBanner format="horizontal" style={{ margin: '15px auto 0 auto' }} />
        </div>
      </div>
    </dialog>
  );
}
