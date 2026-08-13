import React, { useState } from 'react';
import Hero from './components/Hero';
import Gallery from './components/Gallery';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="app-container">
      <header>
        <Hero 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />
      </header>
      <main>
        <Gallery 
          searchQuery={searchQuery} 
          activeCategory={activeCategory} 
        />
      </main>
    </div>
  );
}

export default App;
