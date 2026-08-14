import React from 'react';
import { ExternalLink } from 'lucide-react';
import './Footer.css';

const InstagramIcon = ({ size = 24 }) => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const WhatsappIcon = ({ size = 24 }) => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const TiktokIcon = ({ size = 24 }) => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer glass">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>AKIRA</h3>
          <p>Wallpapers</p>
        </div>
        
        <div className="footer-links">
          <a href="https://akira-itzt.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Akira's Portfolio" className="portfolio-link">
            <span>My Portfolio</span>
            <ExternalLink size={16} aria-hidden="true" />
          </a>
          <div className="social-icons">
            <a href="https://www.instagram.com/akira.shiraishi78/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon size={20} />
            </a>
            <a href="https://wa.me/593998386973" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <WhatsappIcon size={20} />
            </a>
            <a href="https://www.tiktok.com/@akira_games77" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TiktokIcon size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Made with love by Akira</p>
      </div>
    </footer>
  );
}
