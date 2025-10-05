import { Search, X } from 'lucide-react';

// ============================================
// UI COMPONENTS - Reusable Interface Elements
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