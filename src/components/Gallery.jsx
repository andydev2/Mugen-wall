import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import './Gallery.css';

const WallpaperModal = lazy(() => import('./WallpaperModal'));

const GalleryItem = ({ wallpaper, debouncedSearch, index, onOpenModal, activeCategory }) => {
  const [title, setTitle] = useState(wallpaper.title || null);
  const [hasHovered, setHasHovered] = useState(false);

  const handleMouseEnter = () => {
    if (title || !wallpaper.id || hasHovered) return;
    setHasHovered(true);
    
    if (!wallpaper.id.toString().startsWith('tmdb-') && !wallpaper.id.toString().startsWith('px-')) {
      fetch(`/api/v1/w/${wallpaper.id}`)
        .then(res => res.json())
        .then(json => {
          if (json.data && json.data.tags && json.data.tags.length > 0) {
            const tags = json.data.tags.slice(0, 3).map(t => t.name.replace(/\b\w/g, c => c.toUpperCase())).join(' • ');
            if (tags) setTitle(tags);
            else setTitle('MugenWall Art');
          } else {
            setTitle('MugenWall Art');
          }
        })
        .catch(() => {});
    }
  };

  const displayTitle = title || (debouncedSearch ? debouncedSearch : `Wallpaper #${wallpaper.id}`);

  return (
    <a 
      href={`/?w=${wallpaper.id}`}
      className={`gallery-item glass-card animate-fade-in ${activeCategory === 'Mobile' ? 'mobile-aspect' : ''}`}
      style={{ animationDelay: `${(index % 24) * 0.05}s` }}
      aria-label={`View wallpaper ${wallpaper.id}`}
      onMouseEnter={handleMouseEnter}
      onClick={(e) => {
        e.preventDefault();
        window.history.pushState(null, '', `/?w=${wallpaper.id}`);
        onOpenModal(wallpaper);
      }}
    >
      <img 
        src={wallpaper.thumbs?.large || wallpaper.path} 
        alt={displayTitle}
        fetchPriority={index <= 3 ? "high" : "auto"}
        loading={index <= 3 ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        width={wallpaper.dimension_x}
        height={wallpaper.dimension_y}
        className="gallery-image"
      />
      <div className="gallery-item-overlay">
        <h2 style={{textTransform: 'capitalize', margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {displayTitle}
        </h2>
        <div className="tags">
          <span className="tag glass">{wallpaper.resolution || `${wallpaper.dimension_x}x${wallpaper.dimension_y}`}</span>
          <span className="tag glass">{(wallpaper.file_size / 1024 / 1024).toFixed(1)} MB</span>
        </div>
      </div>
    </a>
  );
};

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
        } else if (activeCategory !== 'All' && activeCategory !== 'Mobile') {
          q += ` ${activeCategory}`;
        }

        const sorting = q ? 'relevance' : 'toplist';
        let url = `/api/v1/search?q=${encodeURIComponent(q.trim())}&categories=${categoryQuery}&purity=100&sorting=${sorting}&page=${currentPage}`;
        if (activeCategory === 'Mobile') {
          url += '&ratios=portrait';
        }
        
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
        } 
        
        if (q) {


          // Fallback 2: Pixabay (always merge if searching)
          const pixabayKey = import.meta.env.VITE_PIXABAY_API_KEY;
            if (pixabayKey) {
              const orientation = activeCategory === 'Mobile' ? 'vertical' : 'horizontal';
              const pxUrl = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(q.trim())}&image_type=photo&orientation=${orientation}&page=${currentPage}&per_page=24&safesearch=true`;
              try {
                const pxResponse = await fetch(pxUrl);
                if (pxResponse.ok) {
                  const pxJson = await pxResponse.json();
                  if (pxJson.hits && pxJson.hits.length > 0) {
                    const pxData = pxJson.hits.map(item => ({
                      id: `px-${item.id}`,
                      path: item.largeImageURL,
                      thumbs: { large: item.webformatURL },
                      dimension_x: item.imageWidth,
                      dimension_y: item.imageHeight,
                      category: 'Photo',
                      resolution: `${item.imageWidth}x${item.imageHeight}`,
                      file_size: item.imageSize,
                      title: item.tags,
                      stats: {
                        views: item.views || 0,
                        likes: item.likes || 0,
                        downloads: item.downloads || 0
                      }
                    }));
                    
                    dataToSet = [...dataToSet, ...pxData];
                    newTotalPages = Math.max(newTotalPages, Math.ceil(pxJson.totalHits / 24));
                  }
                }
              } catch (pxErr) {
                console.error("Pixabay fallback error:", pxErr);
              }
            }
          // } -> removed extra brace for tmdbFound
        }
        
        // Randomize merged results to make it feel natural
        if (q && dataToSet.length > 0) {
          dataToSet.sort(() => Math.random() - 0.5);
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
    window.history.pushState(null, '', window.location.pathname);
  };

  // Check URL on mount for direct wallpaper link
  useEffect(() => {
    const checkUrlForWallpaper = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const wId = urlParams.get('w');
      
      if (wId && !wId.startsWith('tmdb-') && !wId.startsWith('px-')) {
        try {
          const res = await fetch(`/api/v1/w/${wId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              handleOpenModal(json.data);
            }
          }
        } catch (err) {
          console.error("Failed to load direct wallpaper:", err);
        }
      } else if (!wId) {
        setIsModalOpen(false);
        setSelectedWallpaper(null);
      }
    };

    checkUrlForWallpaper();

    const handlePopState = () => {
      checkUrlForWallpaper();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isPaginated = activeCategory !== 'All';

  return (
    <section className="gallery-section">

      {error && <div className="no-results" style={{color: '#ff6b6b'}}>{error}</div>}
      
      <div className={`gallery-grid ${activeCategory === 'Mobile' ? 'mobile-grid' : ''}`}>
        {!isLoading && wallpapers.length === 0 && !error ? (
          <div className="no-results">No wallpapers found. Try a different search or category.</div>
        ) : (
          wallpapers.map((wallpaper, index) => (
            <GalleryItem 
              key={`${wallpaper.id}-${index}`} 
              wallpaper={wallpaper} 
              debouncedSearch={debouncedSearch} 
              index={index} 
              onOpenModal={handleOpenModal} 
              activeCategory={activeCategory}
            />
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
            aria-label="Previous Page"
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
            aria-label="Next Page"
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
        <Suspense fallback={null}>
          <WallpaperModal 
            wallpaper={selectedWallpaper} 
            onClose={handleCloseModal} 
            activeCategory={activeCategory}
          />
        </Suspense>
      )}
    </section>
  );
}
