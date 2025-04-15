import { useState } from "react";
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
import { Search } from "lucide-react";
import FilterChips from "./FilterChips";

interface SearchBarProps {
  onSearch: (searchParams: any) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const { t } = useTranslation("common");
  const { isRtl } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filterOptions = [
    { id: "ladiesOnly", label: t("ladiesOnly") },
    { id: "privateRoom", label: t("privateRoom") },
    { id: "hijabFriendly", label: t("hijabFriendly") },
    { id: "openNow", label: t("openNow") },
  ];

  const handleSearch = () => {
    const filters: Record<string, boolean> = {};
    selectedFilters.forEach(filter => {
      filters[filter] = true;
    });
    
    onSearch({
      searchTerm,
      serviceType,
      ...filters,
    });
  };

  const toggleFilter = (id: string) => {
    setSelectedFilters(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="bg-muted dark:bg-neutral-800/30 p-6 rounded-xl">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto flex items-center pl-3 rtl:pr-3 rtl:pl-0">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text" 
              className="bg-background dark:bg-neutral-900/50 w-full py-3 pl-10 rtl:pr-10 rtl:pl-3 rounded-lg"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="md:w-48">
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="bg-background dark:bg-neutral-900/50 w-full">
              <SelectValue placeholder={t("allServices")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allServices")}</SelectItem>
              <SelectItem value="haircuts">
                {isRtl ? "قص الشعر" : "Haircuts"}
              </SelectItem>
              <SelectItem value="coloring">
                {isRtl ? "صبغ الشعر" : "Hair Coloring"}
              </SelectItem>
              <SelectItem value="styling">
                {isRtl ? "تصفيف الشعر" : "Hair Styling"}
              </SelectItem>
              <SelectItem value="nails">
                {isRtl ? "الأظافر" : "Nails"}
              </SelectItem>
              <SelectItem value="facial">
                {isRtl ? "العناية بالوجه" : "Facial"}
              </SelectItem>
              <SelectItem value="massage">
                {isRtl ? "المساج" : "Massage"}
              </SelectItem>
              <SelectItem value="makeup">
                {isRtl ? "المكياج" : "Makeup"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleSearch}
          className={`bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg transition-colors ${isRtl ? 'font-tajawal' : ''}`}
        >
          {t("search")}
        </Button>
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
