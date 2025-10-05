import { useState, useEffect } from 'react';
import { Home as HomeIcon, Search, Heart, User, Menu, X } from 'lucide-react';
import { SearchBar } from './components/UIComponents';
import { HomePage, SearchPage, FavoritesPage, MovieDetailsPage } from './components/MovieComponents';

type Page = 'home' | 'search' | 'favorites' | 'movie-details';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('movieFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('movieFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setCurrentPage('search');
      setIsMobileMenuOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage('home');
  };

  const handleMoviePlay = (movieId: string) => {
    // In a real app, this would open a video player
    alert(`Playing movie: ${movieId}`);
  };

  const handleMovieInfo = (movieId: string) => {
    setSelectedMovieId(movieId);
    setCurrentPage('movie-details');
    setIsMobileMenuOpen(false);
  };

  const handleToggleFavorite = (movieId: string) => {
    setFavorites(prev => 
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    if (page === 'home') {
      setSearchQuery('');
    }
  };

  const handleBackFromMovie = () => {
    setCurrentPage('home');
    setSelectedMovieId('');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-red-600">
                MovieMax
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleNavigation('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  currentPage === 'home'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => handleNavigation('favorites')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  currentPage === 'favorites'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Heart className="w-4 h-4" />
                Favorites
                {favorites.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-gray-800">
            <nav className="px-4 py-4 space-y-2">
              <button
                onClick={() => handleNavigation('home')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === 'home'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </button>
              <button
                onClick={() => handleNavigation('favorites')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === 'favorites'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5" />
                  Favorites
                </div>
                {favorites.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={currentPage === 'movie-details' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {currentPage === 'home' && (
          <HomePage
            onMoviePlay={handleMoviePlay}
            onMovieInfo={handleMovieInfo}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        )}

        {currentPage === 'search' && (
          <SearchPage
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            onMoviePlay={handleMoviePlay}
            onMovieInfo={handleMovieInfo}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        )}

        {currentPage === 'favorites' && (
          <FavoritesPage
            favorites={favorites}
            onMoviePlay={handleMoviePlay}
            onMovieInfo={handleMovieInfo}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentPage === 'movie-details' && (
          <MovieDetailsPage
            movieId={selectedMovieId}
            onBack={handleBackFromMovie}
            onMoviePlay={handleMoviePlay}
            onMovieInfo={handleMovieInfo}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        )}
      </main>
    </div>
  );
}