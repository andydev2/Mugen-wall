import React, { useState, useEffect, useRef } from 'react';
import WallpaperModal from './WallpaperModal';
import AdBanner from './AdBanner';
import './Gallery.css';

export default function Gallery({ searchQuery, activeCategory }) {
  const [wallpapers, setWallpapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const loaderRef = useRef(null);

  // Debounce search query to prevent API rate limiting
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setWallpapers([]); // Clear existing to show loading state properly on switch
  }, [debouncedSearch, activeCategory]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchWallpapers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let q = '';
        if (debouncedSearch) q += debouncedSearch;
        
        let categoryQuery = '111'; // General, Anime, People
        if (activeCategory === 'Anime') {
          categoryQuery = '010'; // Only Anime
        } else if (activeCategory !== 'All') {
          q += ` ${activeCategory}`;
        }

        const sorting = q ? 'relevance' : 'toplist';
        const url = `/api/v1/search?q=${encodeURIComponent(q.trim())}&categories=${categoryQuery}&purity=100&sorting=${sorting}&page=${currentPage}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          if (response.status === 429) throw new Error("Rate limit exceeded. Please wait a few seconds and try again.");
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const json = await response.json();
        
        if (isMounted && json.data) {
          if (activeCategory === 'All' && currentPage > 1) {
            setWallpapers(prev => [...prev, ...json.data]);
          } else {
            setWallpapers(json.data);
          }
          setTotalPages(json.meta?.last_page || 1);
        }
      } catch (err) {
        console.error("API Error:", err);
        if (isMounted) setError(err.message || "Failed to load wallpapers.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWallpapers();
    
    return () => { isMounted = false; };
  }, [debouncedSearch, activeCategory, currentPage]);

  // Intersection Observer for infinite scrolling on "All"
  useEffect(() => {
    if (activeCategory !== 'All' || isLoading || currentPage >= totalPages) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setCurrentPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => observer.disconnect();
  }, [activeCategory, isLoading, currentPage, totalPages]);

  const handleOpenModal = (wallpaper) => {
    setSelectedWallpaper(wallpaper);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWallpaper(null);
  };

  const isPaginated = activeCategory !== 'All';

  return (
    <section className="gallery-section">
      <AdBanner format="horizontal" />

      {error && <div className="no-results" style={{color: '#ff6b6b'}}>{error}</div>}
      
      <div className="gallery-grid">
        {!isLoading && wallpapers.length === 0 && !error ? (
          <div className="no-results">No wallpapers found. Try a different search or category.</div>
        ) : (
          wallpapers.map((wallpaper, index) => (
            <div 
              key={`${wallpaper.id}-${index}`} 
              className="gallery-item glass-card animate-fade-in"
              style={{ animationDelay: `${(index % 24) * 0.05}s` }}
              role="button"
              tabIndex={0}
              aria-label={`View wallpaper ${wallpaper.id}`}
              onClick={() => handleOpenModal(wallpaper)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenModal(wallpaper);
                }
              }}
            >
              <img 
                src={wallpaper.thumbs?.large || wallpaper.path} 
                alt={`Wallpaper ${wallpaper.id}`}
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                referrerPolicy="no-referrer"
                width={wallpaper.dimension_x}
                height={wallpaper.dimension_y}
                className="gallery-image"
              />
              <div className="gallery-item-overlay">
                <h3 style={{textTransform: 'capitalize'}}>
                  {debouncedSearch ? `${debouncedSearch}` : `${wallpaper.category} Wallpaper`}
                </h3>
                <div className="tags">
                  <span className="tag glass">{wallpaper.resolution || `${wallpaper.dimension_x}x${wallpaper.dimension_y}`}</span>
                  <span className="tag glass">{(wallpaper.file_size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading wallpapers...</p>
        </div>
      )}

      {!isPaginated && !isLoading && currentPage < totalPages && (
        <div ref={loaderRef} style={{ height: '50px', width: '100%' }}></div>
      )}

      {isPaginated && totalPages > 1 && !isLoading && (
        <div className="pagination">
          <button 
            className="pagination-btn glass" 
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(prev => Math.max(prev - 1, 1));
              document.querySelector('.gallery-section').scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Previous
          </button>
          <span className="pagination-info">Page {currentPage} of {totalPages}</span>
          <button 
            className="pagination-btn glass" 
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage(prev => Math.min(prev + 1, totalPages));
              document.querySelector('.gallery-section').scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && selectedWallpaper && (
        <WallpaperModal 
          wallpaper={selectedWallpaper} 
          onClose={handleCloseModal} 
        />
      )}
    </section>
  );
}
