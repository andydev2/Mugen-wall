import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import './DevicePreview.css';

export default function DevicePreview({ imageUrl, title }) {
  const [device, setDevice] = useState('desktop'); // 'desktop', 'tablet', 'mobile'

  return (
    <div className="device-preview-container">
      <div className="device-toggles">
        <button 
          className={`toggle-btn ${device === 'desktop' ? 'active' : ''}`}
          onClick={() => setDevice('desktop')}
          title="Desktop (16:9)"
          aria-label="Preview on Desktop"
          aria-pressed={device === 'desktop'}
        >
          <Monitor size={20} aria-hidden="true" />
        </button>
        <button 
          className={`toggle-btn ${device === 'tablet' ? 'active' : ''}`}
          onClick={() => setDevice('tablet')}
          title="Tablet (4:3)"
          aria-label="Preview on Tablet"
          aria-pressed={device === 'tablet'}
        >
          <Tablet size={20} aria-hidden="true" />
        </button>
        <button 
          className={`toggle-btn ${device === 'mobile' ? 'active' : ''}`}
          onClick={() => setDevice('mobile')}
          title="Mobile (9:16)"
          aria-label="Preview on Mobile"
          aria-pressed={device === 'mobile'}
        >
          <Smartphone size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="preview-wrapper">
        <div className={`preview-frame frame-${device}`}>
          <img src={imageUrl} alt={title || "Preview image"} className="preview-image" fetchPriority="high" loading="eager" decoding="async" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  );
}
