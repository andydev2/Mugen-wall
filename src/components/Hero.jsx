import React from 'react';
import { Search } from 'lucide-react';
import './Hero.css';

export default function Hero({ searchQuery, setSearchQuery, activeCategory, setActiveCategory }) {
  const categories = ['All', 'Anime', 'Cars', 'Lo-Fi', 'Minimalist', 'Abstract', 'Nature', 'Sci-Fi'];

  return (
    <section className="hero-section">
      {/* Background Artwork (Planets, Orbits & Stars) */}
      <div className="hero-shapes">
        <div className="shape orbit"></div>
        <div className="shape planet-1"></div>
        <div className="shape planet-2"></div>
        <div className="shape planet-3"></div>
        <div className="shooting-star" style={{ top: '15%', right: '10%', animationDelay: '0s' }}></div>
        <div className="shooting-star" style={{ top: '35%', right: '40%', animationDelay: '3s' }}></div>
      </div>

      {/* Main Content */}
      <div className="hero-content animate-fade-in">
        <h1>MugenWall</h1>
        <p>Premium aesthetics for your devices. Download in maximum quality.</p>
        <div className="search-bar glass">
          <Search size={20} color="var(--color-primary)" aria-hidden="true" />
          <label htmlFor="search-input" className="sr-only">Search wallpapers</label>
          <input 
            id="search-input"
            name="search-query"
            type="search" 
            placeholder="Search wallpapers..." 
            aria-label="Search wallpapers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="category-shortcuts">
          {categories.map(category => (
            <button
              key={category}
              className={`category-pill glass ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Layered Waves */}
      <div className="hero-waves">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave wave-3">
          <path fill="var(--color-accent-1)" d="M0,128L60,149.3C120,171,240,213,360,208C480,203,600,149,720,144C840,139,960,181,1080,197.3C1200,213,1320,203,1380,197.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave wave-2">
          <path fill="var(--color-accent-2)" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,213.3C672,203,768,149,864,133.3C960,117,1056,139,1152,165.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave wave-1">
          <path fill="var(--color-bg)" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,160C960,139,1056,149,1152,165.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}
