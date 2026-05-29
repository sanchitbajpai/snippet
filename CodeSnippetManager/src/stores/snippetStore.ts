import { create } from 'zustand';
import { Snippet, AppSettings } from '@app-types/index';
import DatabaseService from '@services/database/index';
import StorageService from '@services/storage/index';

interface SnippetStore {
  // State
  snippets: Snippet[];
  favorites: Snippet[];
  selectedSnippet: Snippet | null;
  searchResults: Snippet[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  settings: AppSettings;

  // Actions
  loadAllSnippets: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  selectSnippet: (snippet: Snippet | null) => void;
  searchSnippets: (query: string) => Promise<void>;
  createSnippet: (snippet: Omit<Snippet, 'createdAt' | 'updatedAt'>) => Promise<Snippet>;
  updateSnippet: (id: string, updates: Partial<Snippet>) => Promise<Snippet>;
  deleteSnippet: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getSnippetsByLanguage: (language: string) => Promise<Snippet[]>;
  setSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  clearError: () => void;
}

export const useSnippetStore = create<SnippetStore>((set, get) => ({
  // Initial state
  snippets: [],
  favorites: [],
  selectedSnippet: null,
  searchResults: [],
  searchQuery: '',
  isLoading: false,
  error: null,
  settings: {
    theme: 'auto',
    codeTheme: 'monokai',
    fontSize: 14,
    autoSave: true,
  },

  // Load all snippets
  loadAllSnippets: async () => {
    set({ isLoading: true, error: null });
    try {
      const snippets = await DatabaseService.getAllSnippets();
      set({ snippets, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load snippets';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Load favorite snippets
  loadFavorites: async () => {
    try {
      const favorites = await DatabaseService.getFavoriteSnippets();
      set({ favorites });
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  },

  // Select a snippet
  selectSnippet: (snippet) => {
    set({ selectedSnippet: snippet });
  },

  // Search snippets
  searchSnippets: async (query) => {
    set({ searchQuery: query, isLoading: true, error: null });
    try {
      if (query.trim() === '') {
        set({ searchResults: [], isLoading: false });
        return;
      }

      await StorageService.addSearchHistory(query);
      const results = await DatabaseService.searchSnippets(query);
      set({ searchResults: results, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create snippet
  createSnippet: async (snippet) => {
    set({ isLoading: true, error: null });
    try {
      const newSnippet = await DatabaseService.createSnippet(snippet);
      const currentSnippets = get().snippets;
      set({
        snippets: [newSnippet, ...currentSnippets],
        isLoading: false,
      });
      return newSnippet;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create snippet';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update snippet
  updateSnippet: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await DatabaseService.updateSnippet(id, updates);
      const currentSnippets = get().snippets;
      const updatedSnippets = currentSnippets.map(s =>
        s.id === id ? updated : s
      );

      if (get().selectedSnippet?.id === id) {
        set({ selectedSnippet: updated });
      }

      set({ snippets: updatedSnippets, isLoading: false });
      return updated;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update snippet';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete snippet
  deleteSnippet: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await DatabaseService.deleteSnippet(id);
      const currentSnippets = get().snippets;
      const filtered = currentSnippets.filter(s => s.id !== id);

      if (get().selectedSnippet?.id === id) {
        set({ selectedSnippet: null });
      }

      set({ snippets: filtered, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete snippet';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Toggle favorite
  toggleFavorite: async (id) => {
    try {
      const updated = await DatabaseService.toggleFavorite(id);
      const currentSnippets = get().snippets;
      const updatedSnippets = currentSnippets.map(s =>
        s.id === id ? updated : s
      );

      if (get().selectedSnippet?.id === id) {
        set({ selectedSnippet: updated });
      }

      set({ snippets: updatedSnippets });
      await get().loadFavorites();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle favorite';
      set({ error: errorMessage });
    }
  },

  // Get snippets by language
  getSnippetsByLanguage: async (language) => {
    try {
      return await DatabaseService.getSnippetsByLanguage(language);
    } catch (error) {
      console.error('Failed to get snippets by language:', error);
      throw error;
    }
  },

  // Update settings
  setSettings: async (newSettings) => {
    try {
      const updated = await StorageService.updateSettings(newSettings);
      set({ settings: updated });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      set({ error: errorMessage });
    }
  },

  // Load settings from storage
  loadSettings: async () => {
    try {
      const settings = await StorageService.getSettings();
      set({ settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
