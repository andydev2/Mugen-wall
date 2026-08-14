import React, { useState } from 'react';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="app-container">
      <ThemeToggle />
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
      {activeCategory !== 'All' && <Footer />}
    </div>
  );
}

export default App;
