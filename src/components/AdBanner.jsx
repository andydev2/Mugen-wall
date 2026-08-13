import React from 'react';
import './AdBanner.css';

export default function AdBanner({ format = "horizontal", style = {} }) {
  /* 
   * CÓDIGO FUTURO DE ADSENSE:
   * Cuando Google te apruebe, reemplazarás este contenido por el script de <ins> que te den.
   * Ejemplo:
   * useEffect(() => {
   *   try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
   * }, []);
   */

  return (
    <div className={`ad-banner ad-${format}`} style={style}>
      <span className="ad-label">Advertisement</span>
      <div className="ad-placeholder-content">
        <p>Google AdSense</p>
        <span className="ad-earn">Monetization Space</span>
      </div>
    </div>
  );
}
