import { useState, useEffect } from 'react';
import { Play, Info, Heart, Star, Clock, Calendar, ArrowLeft, Search, X } from 'lucide-react';

// ============================================
// ALL COMPONENTS - CONSOLIDATED INTO SINGLE FILE
// ============================================

// Search Bar Component
export function SearchBar({ 
  value, 
  onChange, 
  onSearch 
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search movies, genres, years..."
          className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}

// Category Chip Component
export function CategoryChip({ 
  label, 
  isActive, 
  onClick 
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        isActive
          ? 'bg-red-600 text-white shadow-lg'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

// Loading Card Component
export function LoadingCard() {
  return (
    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 animate-pulse">
      <div className="w-full h-full bg-gray-700" />
    </div>
  );
}

// ============================================
// MOVIE COMPONENTS
// ============================================

// Types
interface Movie {
  id: string;
  title: string;
  year: string;
  poster: string;
  rating: number;
  genre: string;
}

interface MovieDetails extends Movie {
  description: string;
  longDescription: string;
  backdrop: string;
  duration: string;
  director: string;
  cast: string[];
}

// Mock data
const MOCK_FEATURED_MOVIE: MovieDetails = {
  id: '1',
  title: 'The Epic Adventure',
  description: 'An incredible journey through uncharted territories that will keep you on the edge of your seat. Follow our heroes as they discover new worlds and face impossible challenges.',
  longDescription: 'In this epic tale of courage and discovery, our protagonists embark on a quest that will test their limits and redefine their understanding of reality. With stunning visuals and heart-pounding action sequences, this film delivers an unforgettable cinematic experience that combines cutting-edge technology with timeless storytelling.',
  poster: 'https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTk1MzIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  backdrop: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBtb3ZpZSUyMHRoZWF0ZXJ8ZW58MXx8fHwxNzU5NDg3MjgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  rating: 8.5,
  year: '2024',
  genre: 'Action',
  duration: '2h 15m',
  director: 'John Anderson',
  cast: ['Emma Stone', 'Ryan Gosling', 'Michael Shannon', 'John Goodman']
};

const ALL_MOVIES: Movie[] = [
  { id: '1', title: 'The Epic Adventure', year: '2024', poster: 'https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTk1MzIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 8.5, genre: 'Action' },
  { id: '2', title: 'Comedy Central', year: '2024', poster: 'https://images.unsplash.com/photo-1572700432881-42c60fe8c869?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGNvbWVkeXxlbnwxfHx8fDE3NTk0ODA4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 7.8, genre: 'Comedy' },
  { id: '3', title: 'Drama Heights', year: '2023', poster: 'https://images.unsplash.com/photo-1572700432881-42c60fe8c869?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGRyYW1hfGVufDF8fHx8MTc1OTQ4Mjc2NHww&ixlib=rb-4.1.0&q=80&w=1080', rating: 9.1, genre: 'Drama' },
  { id: '4', title: 'Space Odyssey', year: '2024', poster: 'https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTk1MzIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 8.2, genre: 'Sci-Fi' },
  { id: '5', title: 'Romance Boulevard', year: '2023', poster: 'https://images.unsplash.com/photo-1572700432881-42c60fe8c869?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGNvbWVkeXxlbnwxfHx8fDE3NTk0ODA4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 7.5, genre: 'Romance' },
  { id: '6', title: 'Horror Night', year: '2024', poster: 'https://images.unsplash.com/photo-1572700432881-42c60fe8c869?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGRyYW1hfGVufDF8fHx8MTc1OTQ4Mjc2NHww&ixlib=rb-4.1.0&q=80&w=1080', rating: 7.2, genre: 'Horror' },
  { id: '7', title: 'Thunder Strike', year: '2024', poster: 'https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTk1MzIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 8.0, genre: 'Action' },
  { id: '8', title: 'Fast Lane', year: '2023', poster: 'https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTk1MzIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 7.7, genre: 'Action' },
  { id: '9', title: 'Combat Zone', year: '2024', poster: 'https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTk1MzIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 8.3, genre: 'Action' },
  { id: '10', title: 'Hero Rising', year: '2023', poster: 'https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTk1MzIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 7.9, genre: 'Action' },
  { id: '11', title: 'Battle Royale', year: '2024', poster: 'https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTk1MzIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 8.1, genre: 'Action' },
  { id: '12', title: 'Laugh Out Loud', year: '2024', poster: 'https://images.unsplash.com/photo-1572700432881-42c60fe8c869?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGNvbWVkeXxlbnwxfHx8fDE3NTk0ODA4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 8.2, genre: 'Comedy' },
  { id: '13', title: 'Funny Business', year: '2023', poster: 'https://images.unsplash.com/photo-1572700432881-42c60fe8c869?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGNvbWVkeXxlbnwxfHx8fDE3NTk0ODA4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 7.6, genre: 'Comedy' },
  { id: '14', title: 'Comic Relief', year: '2024', poster: 'https://images.unsplash.com/photo-1572700432881-42c60fe8c869?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGNvbWVkeXxlbnwxfHx8fDE3NTk0ODA4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 7.9, genre: 'Comedy' },
  { id: '15', title: 'Jokes Apart', year: '2023', poster: 'https://images.unsplash.com/photo-1572700432881-42c60fe8c869?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGNvbWVkeXxlbnwxfHx8fDE3NTk0ODA4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080', rating: 8.0, genre: 'Comedy' }
];

const MOVIE_CATEGORIES = {
  trending: ALL_MOVIES.slice(0, 6),
  action: ALL_MOVIES.filter(m => m.genre === 'Action'),
  comedy: ALL_MOVIES.filter(m => m.genre === 'Comedy')
};

const MOVIE_DETAILS: { [key: string]: MovieDetails } = {
  '1': {
    id: '1',
    title: 'The Epic Adventure',
    description: 'An incredible journey through uncharted territories that will keep you on the edge of your seat.',
    longDescription: 'In this epic tale of courage and discovery, our protagonists embark on a quest that will test their limits and redefine their understanding of reality. With stunning visuals and heart-pounding action sequences, this film delivers an unforgettable cinematic experience that combines cutting-edge technology with timeless storytelling.',
    poster: 'https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTk1MzIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    backdrop: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBtb3ZpZSUyMHRoZWF0ZXJ8ZW58MXx8fHwxNzU5NDg3MjgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 8.5,
    year: '2024',
    genre: 'Action',
    duration: '2h 15m',
    director: 'John Anderson',
    cast: ['Emma Stone', 'Ryan Gosling', 'Michael Shannon', 'John Goodman']
  }
};

// Movie Card Component
export function MovieCard({ 
  movie, 
  onPlay, 
  onInfo, 
  onToggleFavorite, 
  isFavorite 
}: {
  movie: Movie;
  onPlay: (movieId: string) => void;
  onInfo: (movieId: string) => void;
  onToggleFavorite: (movieId: string) => void;
  isFavorite: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
        <img
          src={movie.poster}
          alt={movie.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="text-gray-600">🎬</div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Heart Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(movie.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          } ${
            isFavorite 
              ? 'bg-red-600 text-white' 
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Action Buttons */}
        <div className={`absolute bottom-4 left-4 right-4 space-y-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(movie.id);
            }}
            className="w-full bg-white text-black py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            Play
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInfo(movie.id);
            }}
            className="w-full bg-gray-600/80 backdrop-blur-sm text-white py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-gray-500/80 transition-colors"
          >
            <Info className="w-4 h-4" />
            Info
          </button>
        </div>
      </div>

      {/* Movie Info */}
      <div className="pt-3">
        <h3 className="text-white font-medium truncate">{movie.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-400 mt-1">
          <span>{movie.year}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>{movie.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hero Section Component
export function HeroSection({ 
  movie, 
  onPlay, 
  onInfo 
}: {
  movie: MovieDetails;
  onPlay: (movieId: string) => void;
  onInfo: (movieId: string) => void;
}) {
  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-xl">
      <img
        src={movie.backdrop}
        alt={movie.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-2xl">
          <h1 className="text-white text-5xl font-bold mb-4">{movie.title}</h1>
          
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-white text-lg">{movie.rating}</span>
            </div>
            <span className="text-white/80">{movie.year}</span>
            <span className="bg-red-600 text-white px-3 py-1 rounded text-sm">
              {movie.genre}
            </span>
          </div>
          
          <p className="text-white/90 text-lg mb-6 leading-relaxed">{movie.description}</p>
          
          <div className="flex gap-4">
            <button
              onClick={() => onPlay(movie.id)}
              className="bg-white text-black px-8 py-3 rounded flex items-center gap-3 hover:bg-gray-200 transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
              Play Movie
            </button>
            <button
              onClick={() => onInfo(movie.id)}
              className="bg-gray-600/80 backdrop-blur-sm text-white px-8 py-3 rounded flex items-center gap-3 hover:bg-gray-500/80 transition-colors"
            >
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Movie Row Component
export function MovieRow({ 
  title, 
  movies, 
  onMoviePlay, 
  onMovieInfo, 
  onToggleFavorite, 
  favorites 
}: {
  title: string;
  movies: Movie[];
  onMoviePlay: (movieId: string) => void;
  onMovieInfo: (movieId: string) => void;
  onToggleFavorite: (movieId: string) => void;
  favorites: string[];
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-white text-2xl font-semibold">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-48">
            <MovieCard
              movie={movie}
              onPlay={onMoviePlay}
              onInfo={onMovieInfo}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.includes(movie.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Home Page Component
export function HomePage({ 
  onMoviePlay, 
  onMovieInfo, 
  onToggleFavorite, 
  favorites 
}: {
  onMoviePlay: (movieId: string) => void;
  onMovieInfo: (movieId: string) => void;
  onToggleFavorite: (movieId: string) => void;
  favorites: string[];
}) {
  return (
    <div className="space-y-8">
      <HeroSection
        movie={MOCK_FEATURED_MOVIE}
        onPlay={onMoviePlay}
        onInfo={onMovieInfo}
      />

      <MovieRow
        title="Trending Now"
        movies={MOVIE_CATEGORIES.trending}
        onMoviePlay={onMoviePlay}
        onMovieInfo={onMovieInfo}
        onToggleFavorite={onToggleFavorite}
        favorites={favorites}
      />

      <MovieRow
        title="Action Movies"
        movies={MOVIE_CATEGORIES.action}
        onMoviePlay={onMoviePlay}
        onMovieInfo={onMovieInfo}
        onToggleFavorite={onToggleFavorite}
        favorites={favorites}
      />

      <MovieRow
        title="Comedy Movies"
        movies={MOVIE_CATEGORIES.comedy}
        onMoviePlay={onMoviePlay}
        onMovieInfo={onMovieInfo}
        onToggleFavorite={onToggleFavorite}
        favorites={favorites}
      />
    </div>
  );
}

// Search Results Component
export function SearchPage({ 
  searchQuery, 
  onClearSearch, 
  onMoviePlay, 
  onMovieInfo, 
  onToggleFavorite, 
  favorites 
}: {
  searchQuery: string;
  onClearSearch: () => void;
  onMoviePlay: (movieId: string) => void;
  onMovieInfo: (movieId: string) => void;
  onToggleFavorite: (movieId: string) => void;
  favorites: string[];
}) {
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const results = ALL_MOVIES.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.year.includes(searchQuery)
      );
      setFilteredMovies(results);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-white text-3xl mb-4">Searching...</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-3xl mb-2">Search Results</h1>
        <p className="text-gray-400">
          {searchQuery ? `Showing results for "${searchQuery}"` : 'Search for movies'}
        </p>
        <p className="text-gray-500 text-sm mt-1">{filteredMovies.length} results found</p>
      </div>

      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={onMoviePlay}
              onInfo={onMovieInfo}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.includes(movie.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-600 text-6xl mb-4">🎬</div>
          <h3 className="text-white text-xl mb-2">No movies found</h3>
          <p className="text-gray-400 mb-4">
            We couldn't find any movies matching "{searchQuery}"
          </p>
          <button
            onClick={onClearSearch}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}

// Favorites Page Component
export function FavoritesPage({ 
  favorites, 
  onMoviePlay, 
  onMovieInfo, 
  onToggleFavorite 
}: {
  favorites: string[];
  onMoviePlay: (movieId: string) => void;
  onMovieInfo: (movieId: string) => void;
  onToggleFavorite: (movieId: string) => void;
}) {
  const favoriteMovies = ALL_MOVIES.filter(movie => favorites.includes(movie.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="w-8 h-8 text-red-500 fill-current" />
        <div>
          <h1 className="text-white text-3xl">My List</h1>
          <p className="text-gray-400">
            {favorites.length === 0 
              ? 'No favorite movies yet' 
              : `${favorites.length} favorite movie${favorites.length === 1 ? '' : 's'}`
            }
          </p>
        </div>
      </div>

      {favoriteMovies.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h2 className="text-white text-2xl mb-4">No Favorites Yet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Start exploring movies and click the heart icon to add them to your list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {favoriteMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={onMoviePlay}
              onInfo={onMovieInfo}
              onToggleFavorite={onToggleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Movie Details Page Component
export function MovieDetailsPage({ 
  movieId, 
  onBack, 
  onMoviePlay, 
  onMovieInfo, 
  onToggleFavorite, 
  favorites 
}: {
  movieId: string;
  onBack: () => void;
  onMoviePlay: (movieId: string) => void;
  onMovieInfo: (movieId: string) => void;
  onToggleFavorite: (movieId: string) => void;
  favorites: string[];
}) {
  const [movie, setMovie] = useState<MovieDetails | undefined>(MOVIE_DETAILS[movieId]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const movieData = MOVIE_DETAILS[movieId];
      setMovie(movieData);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [movieId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="animate-pulse">
          <div className="h-screen bg-gray-800 relative">
            <div className="absolute top-8 left-8">
              <div className="h-8 bg-gray-700 rounded w-20" />
            </div>
            <div className="absolute bottom-8 left-8 right-8">
              <div className="h-16 bg-gray-700 rounded w-1/2 mb-6" />
              <div className="flex gap-4 mb-8">
                <div className="h-12 bg-gray-700 rounded w-32" />
                <div className="h-12 bg-gray-700 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🎬</div>
          <h2 className="text-white text-2xl mb-2">Movie Not Found</h2>
          <p className="text-gray-400 mb-6">The movie you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(movie.id);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Full Screen Hero Section - Matches Netflix Design */}
      <div className="relative h-screen w-full overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        
        {/* Back Button - Top Left */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-gray-300 transition-colors bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        {/* Content - Bottom Left */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-12 max-w-4xl">
            {/* Netflix Branding */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-red-500 text-2xl font-bold">N</span>
              <span className="text-sm text-gray-300 uppercase tracking-wider font-medium">SERIES</span>
            </div>
            
            {/* Movie Title */}
            <h1 className="text-white text-6xl lg:text-8xl font-bold leading-none mb-8 max-w-3xl">
              {movie.title.toUpperCase()}
            </h1>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => onMoviePlay(movie.id)}
                className="bg-white text-black px-8 py-3 rounded flex items-center gap-3 hover:bg-gray-200 transition-colors font-semibold"
              >
                <Play className="w-5 h-5 fill-current" />
                Play
              </button>
              <button
                onClick={() => onMovieInfo(movie.id)}
                className="bg-gray-600/80 backdrop-blur-sm text-white px-8 py-3 rounded flex items-center gap-3 hover:bg-gray-500/80 transition-colors font-semibold"
              >
                <Info className="w-5 h-5" />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Movie Details Section */}
      <div className="px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-white text-2xl mb-4">About {movie.title}</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{movie.longDescription}</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-white text-xl mb-4">Details</h3>
              <div className="space-y-3 text-gray-300">
                <div>
                  <span className="text-gray-500">Director:</span>
                  <span className="ml-2">{movie.director}</span>
                </div>
                <div>
                  <span className="text-gray-500">Genre:</span>
                  <span className="ml-2">{movie.genre}</span>
                </div>
                <div>
                  <span className="text-gray-500">Release Year:</span>
                  <span className="ml-2">{movie.year}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2">{movie.duration}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rating:</span>
                  <span className="ml-2">{movie.rating}/10</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white text-xl mb-4">Cast</h3>
              <div className="space-y-2">
                {movie.cast.map((actor, index) => (
                  <div key={index} className="text-gray-300">{actor}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      <div className="px-8 pb-12 max-w-7xl mx-auto">
        <MovieRow
          title="More Like This"
          movies={MOVIE_CATEGORIES.action.slice(0, 5)}
          onMoviePlay={onMoviePlay}
          onMovieInfo={onMovieInfo}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />
      </div>
    </div>
  );
}