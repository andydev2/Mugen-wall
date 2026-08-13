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
        
        let dataToSet = [];
        let newTotalPages = 1;

        if (json.data && json.data.length > 0) {
          dataToSet = json.data;
          newTotalPages = json.meta?.last_page || 1;
        } else if (q) {
          // Fallback 1: TMDB
          const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
          let tmdbFound = false;

          if (tmdbKey) {
            try {
              const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(q.trim())}&page=${currentPage}`;
              const tmdbRes = await fetch(tmdbUrl);
              if (tmdbRes.ok) {
                const tmdbJson = await tmdbRes.json();
                let backdrops = [];
                
                tmdbJson.results?.forEach(item => {
                  if (item.backdrop_path) {
                    backdrops.push({
                       id: `tmdb-${item.id}`,
                       path: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
                       thumbs: { large: `https://image.tmdb.org/t/p/w780${item.backdrop_path}` },
                       dimension_x: 3840,
                       dimension_y: 2160,
                       category: item.media_type === 'movie' ? 'Movie' : 'TV Show',
                       resolution: '3840x2160',
                       file_size: 2000000,
                       title: item.title || item.name || 'TMDB Image'
                    });
                  } else if (item.known_for) {
                    item.known_for.forEach(known => {
                      if (known.backdrop_path) {
                        backdrops.push({
                           id: `tmdb-${known.id}`,
                           path: `https://image.tmdb.org/t/p/original${known.backdrop_path}`,
                           thumbs: { large: `https://image.tmdb.org/t/p/w780${known.backdrop_path}` },
                           dimension_x: 3840,
                           dimension_y: 2160,
                           category: 'Actor/Movie',
                           resolution: '3840x2160',
                           file_size: 2000000,
                           title: known.title || known.name || 'TMDB Image'
                        });
                      }
                    });
                  }
                });

                // Remove potential duplicates (if multiple actors are known for the same movie)
                const uniqueBackdrops = [];
                const seenIds = new Set();
                for (const item of backdrops) {
                  if (!seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    uniqueBackdrops.push(item);
                  }
                }

                if (uniqueBackdrops.length > 0) {
                  dataToSet = uniqueBackdrops;
                  newTotalPages = tmdbJson.total_pages || 1;
                  tmdbFound = true;
                }
              }
            } catch (err) {
              console.error("TMDB fallback error:", err);
            }
          }

          // Fallback 2: Pixabay (if TMDB found nothing)
          if (!tmdbFound) {
            const pixabayKey = import.meta.env.VITE_PIXABAY_API_KEY;
            if (pixabayKey) {
              const pxUrl = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(q.trim())}&image_type=photo&orientation=horizontal&page=${currentPage}&per_page=24&safesearch=true`;
              try {
                const pxResponse = await fetch(pxUrl);
                if (pxResponse.ok) {
                  const pxJson = await pxResponse.json();
                  if (pxJson.hits && pxJson.hits.length > 0) {
                    dataToSet = pxJson.hits.map(item => ({
                      id: `px-${item.id}`,
                      path: item.largeImageURL,
                      thumbs: { large: item.webformatURL },
                      dimension_x: item.imageWidth,
                      dimension_y: item.imageHeight,
                      category: 'Photo',
                      resolution: `${item.imageWidth}x${item.imageHeight}`,
                      file_size: item.imageSize,
                      title: item.tags,
                    }));
                    newTotalPages = Math.ceil(pxJson.totalHits / 24);
                  }
                }
              } catch (pxErr) {
                console.error("Pixabay fallback error:", pxErr);
              }
            }
          }
        }
        
        if (isMounted) {
          if (activeCategory === 'All' && currentPage > 1) {
            setWallpapers(prev => [...prev, ...dataToSet]);
          } else {
            setWallpapers(dataToSet);
          }
          setTotalPages(newTotalPages);
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
