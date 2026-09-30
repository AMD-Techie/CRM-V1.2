import { create } from 'zustand';

export interface FilterState {
  searchQuery: string;
  leadPriorityFilter: 'all' | 'high' | 'medium' | 'low';
  dealStageFilter: string;
  dateRangeFilter: '7D' | '14D' | '30D' | '90D' | 'YTD';
  setSearchQuery: (query: string) => void;
  setLeadPriorityFilter: (filter: 'all' | 'high' | 'medium' | 'low') => void;
  setDealStageFilter: (stage: string) => void;
  setDateRangeFilter: (range: '7D' | '14D' | '30D' | '90D' | 'YTD') => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  leadPriorityFilter: 'all',
  dealStageFilter: 'all',
  dateRangeFilter: '30D',

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLeadPriorityFilter: (leadPriorityFilter) => set({ leadPriorityFilter }),
  setDealStageFilter: (dealStageFilter) => set({ dealStageFilter }),
  setDateRangeFilter: (dateRangeFilter) => set({ dateRangeFilter }),
  resetFilters: () => set({
    searchQuery: '',
    leadPriorityFilter: 'all',
    dealStageFilter: 'all',
    dateRangeFilter: '30D'
  })
}));
