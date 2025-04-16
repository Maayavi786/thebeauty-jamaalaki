import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, History } from "lucide-react";
import FilterChips from "./FilterChips";
import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

interface SearchBarProps {
  onSearch: (searchParams: any) => void;
  initialFilters?: Record<string, boolean>;
}

interface SearchSuggestion {
  id: number;
  name: string;
  type: 'salon' | 'service';
}

const SearchBar = ({ onSearch, initialFilters = {} }: SearchBarProps) => {
  const { t } = useTranslation("common");
  const { isRtl } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { ref } = useInView();

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Fetch search suggestions
  const { data: suggestions } = useQuery<SearchSuggestion[]>({
    queryKey: ['search-suggestions', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      const response = await fetch(`/api/search/suggestions?q=${debouncedSearchTerm}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: debouncedSearchTerm.length > 2,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback((term: string) => {
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  const handleSearch = useCallback(() => {
    const filters: Record<string, boolean> = {};
    selectedFilters.forEach(filter => {
      filters[filter] = true;
    });

    const searchParams = {
      searchTerm,
      serviceType,
      ...filters,
    };

    onSearch(searchParams);
    saveToHistory(searchTerm);
    setShowSuggestions(false);
  }, [searchTerm, selectedFilters, onSearch, saveToHistory, serviceType]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filterOptions = [
    { id: "ladiesOnly", label: t("ladiesOnly"), color: '#7C3AED' },
    { id: "privateRoom", label: t("privateRoom"), color: '#F59E0B' },
    { id: "hijabFriendly", label: t("hijabFriendly"), color: '#10B981' },
    { id: "openNow", label: t("openNow"), color: '#10B981' },
  ];

  const toggleFilter = (id: string) => {
    setSelectedFilters(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className={`flex items-center border rounded-lg overflow-hidden ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="p-2">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className={`flex-1 p-2 outline-none ${isRtl ? 'text-right' : 'text-left'}`}
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setShowSuggestions(false);
              }}
              className="p-2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={handleSearch}
            className="bg-primary text-primary-foreground px-4 py-2"
          >
            {t("search")}
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (suggestions?.length || searchHistory.length) && (
          <div className="absolute w-full mt-1 bg-background border rounded-lg shadow-lg z-50">
            {suggestions?.length ? (
              <div className="p-2">
                <h3 className="text-sm font-semibold mb-2">{t("suggestions")}</h3>
                {suggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="p-2 hover:bg-muted cursor-pointer flex items-center"
                    onClick={() => {
                      setSearchTerm(suggestion.name);
                      handleSearch();
                    }}
                  >
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    {suggestion.name}
                  </div>
                ))}
              </div>
            ) : searchHistory.length ? (
              <div className="p-2">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <History className="h-4 w-4 mr-2" />
                  {t("recentSearches")}
                </h3>
                {searchHistory.map((term, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setSearchTerm(term);
                      handleSearch();
                    }}
                  >
                    {term}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <FilterChips 
          options={filterOptions}
          selectedFilters={selectedFilters}
          toggleFilter={toggleFilter}
          isCheckbox
        />
      </div>
    </div>
  );
};

export default SearchBar;
