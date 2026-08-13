import React from 'react';
import { Search } from 'lucide-react';
import './Hero.css';

export default function Hero({ searchQuery, setSearchQuery, activeCategory, setActiveCategory }) {
  const categories = ['All', 'Anime', 'Cars', 'Lo-Fi', 'Minimalist', 'Abstract', 'Nature', 'Sci-Fi'];

  return (
    <section className="hero-section">
      <div className="hero-content animate-fade-in">
        <h1>MugenWall</h1>
        <p>Premium aesthetics for your devices. Download in maximum quality.</p>
        <div className="search-bar glass">
          <Search size={20} color="var(--color-primary)" />
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
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
