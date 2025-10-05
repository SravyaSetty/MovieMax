import { useState, useEffect } from 'react';
import { Play, Info, Heart, Star, Clock, Calendar, ArrowLeft } from 'lucide-react';

// ============================================
// MOVIE COMPONENTS - Movie-specific components and pages
// ============================================

// OMDb API Configuration
const OMDB_API_KEY = 'e90f0c4d';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

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

// OMDb API Response Types
interface OMDbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OMDbMovieDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

// API Helper Functions
const fetchFromOMDb = async (params: Record<string, string>) => {
  const url = new URL(OMDB_BASE_URL);
  url.searchParams.append('apikey', OMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  const response = await fetch(url.toString());
  const data = await response.json();
  return data;
};

const transformOMDbToMovie = (omdbMovie: OMDbSearchResult): Movie => {
  // OMDb posters are high quality - no modifications needed
  const posterUrl = omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
  
  return {
    id: omdbMovie.imdbID,
    title: omdbMovie.Title,
    year: omdbMovie.Year,
    poster: posterUrl,
    rating: 0, // Will be fetched with details if needed
    genre: 'Movie'
  };
};

const transformOMDbToMovieDetails = (omdbDetails: OMDbMovieDetails): MovieDetails => {
  const rating = omdbDetails.imdbRating !== 'N/A' ? parseFloat(omdbDetails.imdbRating) : 0;
  const actors = omdbDetails.Actors !== 'N/A' ? omdbDetails.Actors.split(', ') : [];
  
  return {
    id: omdbDetails.imdbID,
    title: omdbDetails.Title,
    year: omdbDetails.Year,
    poster: omdbDetails.Poster !== 'N/A' ? omdbDetails.Poster : 'https://via.placeholder.com/300x450?text=No+Poster',
    backdrop: omdbDetails.Poster !== 'N/A' ? omdbDetails.Poster : 'https://via.placeholder.com/1920x1080?text=No+Backdrop',
    rating: rating,
    genre: omdbDetails.Genre !== 'N/A' ? omdbDetails.Genre.split(',')[0].trim() : 'Movie',
    description: omdbDetails.Plot !== 'N/A' ? omdbDetails.Plot : 'No description available.',
    longDescription: omdbDetails.Plot !== 'N/A' ? omdbDetails.Plot : 'No description available.',
    duration: omdbDetails.Runtime !== 'N/A' ? omdbDetails.Runtime : 'N/A',
    director: omdbDetails.Director !== 'N/A' ? omdbDetails.Director : 'Unknown',
    cast: actors.slice(0, 4)
  };
};

// Cache for movie data
let movieCache: {
  trending: Movie[];
  action: Movie[];
  comedy: Movie[];
  allMovies: Movie[];
  detailsCache: { [key: string]: MovieDetails };
  featuredMovie: MovieDetails | null;
} = {
  trending: [],
  action: [],
  comedy: [],
  allMovies: [],
  detailsCache: {},
  featuredMovie: null
};

// Fetch movies by search term
const fetchMoviesBySearch = async (searchTerm: string, limit: number = 10): Promise<Movie[]> => {
  try {
    const data = await fetchFromOMDb({ s: searchTerm, type: 'movie' });
    if (data.Response === 'True' && data.Search) {
      return data.Search.slice(0, limit).map(transformOMDbToMovie);
    }
    return [];
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

// Fetch movie details by ID
const fetchMovieDetails = async (imdbID: string): Promise<MovieDetails | null> => {
  // Check cache first
  if (movieCache.detailsCache[imdbID]) {
    return movieCache.detailsCache[imdbID];
  }
  
  try {
    const data = await fetchFromOMDb({ i: imdbID });
    if (data.Response === 'True') {
      const details = transformOMDbToMovieDetails(data);
      movieCache.detailsCache[imdbID] = details;
      return details;
    }
    return null;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

// Initialize movie categories
const initializeMovies = async () => {
  if (movieCache.trending.length > 0) {
    return movieCache;
  }

  try {
    // Fetch different categories with popular search terms
    const [trending, action, comedy] = await Promise.all([
      fetchMoviesBySearch('avengers', 10),
      fetchMoviesBySearch('batman', 10),
      fetchMoviesBySearch('hangover', 10)
    ]);

    movieCache.trending = trending;
    movieCache.action = action;
    movieCache.comedy = comedy;
    
    // Combine all movies and deduplicate by ID
    const combinedMovies = [...trending, ...action, ...comedy];
    const uniqueMoviesMap = new Map<string, Movie>();
    combinedMovies.forEach(movie => {
      if (!uniqueMoviesMap.has(movie.id)) {
        uniqueMoviesMap.set(movie.id, movie);
      }
    });
    movieCache.allMovies = Array.from(uniqueMoviesMap.values());
    
    // Set featured movie (first trending movie with details)
    if (trending.length > 0) {
      const featuredDetails = await fetchMovieDetails(trending[0].id);
      if (featuredDetails) {
        movieCache.featuredMovie = featuredDetails;
      }
    }

    return movieCache;
  } catch (error) {
    console.error('Error initializing movies:', error);
    return movieCache;
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
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="eager"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ imageRendering: 'high-quality' }}
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
        loading="eager"
        className="w-full h-full object-cover"
        style={{ imageRendering: 'high-quality' }}
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
  // Deduplicate movies by ID to avoid key conflicts
  const uniqueMovies = movies.filter((movie, index, self) => 
    index === self.findIndex((m) => m.id === movie.id)
  );

  return (
    <div className="space-y-4">
      <h2 className="text-white text-2xl font-semibold">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {uniqueMovies.map((movie) => (
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
  const [isLoading, setIsLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState<MovieDetails | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const loadMovies = async () => {
      setIsLoading(true);
      const cache = await initializeMovies();
      setFeaturedMovie(cache.featuredMovie);
      setTrendingMovies(cache.trending);
      setActionMovies(cache.action);
      setComedyMovies(cache.comedy);
      setIsLoading(false);
    };
    
    loadMovies();
  }, []);

  if (isLoading || !featuredMovie) {
    return (
      <div className="space-y-8">
        <div className="h-[70vh] w-full bg-gray-800 rounded-xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-800 rounded w-48" />
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <HeroSection
        movie={featuredMovie}
        onPlay={onMoviePlay}
        onInfo={onMovieInfo}
      />

      <MovieRow
        title="Trending Now"
        movies={trendingMovies}
        onMoviePlay={onMoviePlay}
        onMovieInfo={onMovieInfo}
        onToggleFavorite={onToggleFavorite}
        favorites={favorites}
      />

      <MovieRow
        title="Action Movies"
        movies={actionMovies}
        onMoviePlay={onMoviePlay}
        onMovieInfo={onMovieInfo}
        onToggleFavorite={onToggleFavorite}
        favorites={favorites}
      />

      <MovieRow
        title="Comedy Movies"
        movies={comedyMovies}
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
    const searchMovies = async () => {
      if (!searchQuery.trim()) {
        setFilteredMovies([]);
        return;
      }

      setIsLoading(true);
      
      try {
        // Search via OMDb API
        const results = await fetchMoviesBySearch(searchQuery, 20);
        
        // Deduplicate results by ID
        const uniqueResults = results.filter((movie, index, self) => 
          index === self.findIndex((m) => m.id === movie.id)
        );
        
        setFilteredMovies(uniqueResults);
      } catch (error) {
        console.error('Error searching movies:', error);
        setFilteredMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(() => {
      searchMovies();
    }, 500);
    
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
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      const movies: Movie[] = [];
      
      for (const id of favorites) {
        try {
          const details = await fetchMovieDetails(id);
          if (details) {
            movies.push(details);
          }
        } catch (error) {
          console.error('Error loading favorite:', error);
        }
      }
      
      setFavoriteMovies(movies);
      setIsLoading(false);
    };
    
    loadFavorites();
  }, [favorites]);

  if (isLoading && favorites.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <div>
            <h1 className="text-white text-3xl">My List</h1>
            <p className="text-gray-400">Loading favorites...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: favorites.length }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

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
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const loadMovieDetails = async () => {
      setIsLoading(true);
      
      try {
        const details = await fetchMovieDetails(movieId);
        setMovie(details);
        
        // Load similar movies based on genre
        if (details && details.genre) {
          const similar = await fetchMoviesBySearch(details.genre.toLowerCase(), 6);
          setSimilarMovies(similar.filter(m => m.id !== movieId));
        }
      } catch (error) {
        console.error('Error loading movie details:', error);
        setMovie(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovieDetails();
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
          loading="eager"
          className="w-full h-full object-cover"
          style={{ imageRendering: 'high-quality' }}
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
      {similarMovies.length > 0 && (
        <div className="px-8 pb-12 max-w-7xl mx-auto">
          <MovieRow
            title="More Like This"
            movies={similarMovies}
            onMoviePlay={onMoviePlay}
            onMovieInfo={onMovieInfo}
            onToggleFavorite={onToggleFavorite}
            favorites={favorites}
          />
        </div>
      )}
    </div>
  );
}