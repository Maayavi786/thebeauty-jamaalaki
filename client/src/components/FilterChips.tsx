import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FilterOption {
  id: string;
  color?: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedFilters: string[];
  toggleFilter: (id: string) => void;
  isCheckbox?: boolean;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selectedFilters,
  toggleFilter,
  isCheckbox = false,
}: FilterChipsProps) => {
  const { isRtl } = useLanguage();
  
  return (
    <div className={`flex flex-wrap gap-2 ${isRtl ? 'flex-row-reverse justify-end' : 'flex-row justify-start'} items-center`}>
      {options.map((option) => {
        const isSelected = selectedFilters.includes(option.id);
        
        return (
          <Badge
            key={option.id}
            variant={isSelected ? "default" : "outline"}
            className={`
              cursor-pointer transition-all py-2 px-4
              ${isRtl ? 'font-tajawal' : ''}
              ${option.color ? `bg-[${option.color}] text-black border-[${option.color}]` : ''}
              ${isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-primary/10'}
            `}
            onClick={() => toggleFilter(option.id)}
          >
            {isCheckbox && isSelected && (
              <Check className={`h-3 w-3 ${isRtl ? 'ml-1' : 'mr-1'}`} />
            )}
            {option.label}
          </Badge>
        );
      })}
    </div>
  );
};

export default FilterChips;