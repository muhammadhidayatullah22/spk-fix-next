import { useState, useMemo } from 'react';

interface FilterConfig {
  key: string;
  type: 'text' | 'select' | 'number' | 'date';
  options?: string[]; // For select type
}

interface UseFilterProps {
  data: any[];
  filters: FilterConfig[];
}

interface UseFilterReturn {
  filteredData: any[];
  filterValues: Record<string, any>;
  setFilterValue: (key: string, value: any) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function useFilter({ data, filters }: UseFilterProps): UseFilterReturn {
  const [filterValues, setFilterValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    filters.forEach(filter => {
      initial[filter.key] = '';
    });
    return initial;
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return filters.every(filter => {
        const value = filterValues[filter.key];
        if (!value) return true; // No filter applied

        const itemValue = item[filter.key];
        
        switch (filter.type) {
          case 'text':
            return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
          case 'select':
            return itemValue === value;
          case 'number':
            return itemValue === Number(value);
          case 'date':
            // Assuming date comparison logic here
            return itemValue === value;
          default:
            return true;
        }
      });
    });
  }, [data, filterValues, filters]);

  const setFilterValue = (key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    const cleared: Record<string, any> = {};
    filters.forEach(filter => {
      cleared[filter.key] = '';
    });
    setFilterValues(cleared);
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filterValues).some(value => value !== '');
  }, [filterValues]);

  return {
    filteredData,
    filterValues,
    setFilterValue,
    clearFilters,
    hasActiveFilters,
  };
}

// Hook khusus untuk search
export function useSearch<T>(data: T[], searchKeys: (keyof T)[]): {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: T[];
} {
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter(item => {
      return searchKeys.some(key => {
        const value = item[key];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchKeys]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
  };
}
