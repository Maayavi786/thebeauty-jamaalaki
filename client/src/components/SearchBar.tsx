import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  serviceType?: string;
  setServiceType?: (type: string) => void;
}

const SearchBar = ({ onSearch, serviceType, setServiceType }: SearchBarProps) => {
  const { isLtr } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isLtr ? "Search for services..." : "ابحث عن الخدمات..."}
          className={`w-full px-4 py-2 pr-10 rounded-lg border border-input bg-background ${
            isLtr ? "text-left" : "text-right"
          } ${isLtr ? "font-playfair" : "font-tajawal"}`}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
