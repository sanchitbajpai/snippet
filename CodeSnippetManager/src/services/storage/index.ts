import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AppSettings } from '@app-types/index';

/**
 * Storage service for managing AsyncStorage and SecureStore
 * - AsyncStorage: App preferences, non-sensitive data
 * - SecureStore: Sensitive data like API keys
 */

class StorageService {
  private readonly SETTINGS_KEY = 'app_settings';
  private readonly SEARCH_HISTORY_KEY = 'search_history';
  private readonly API_KEY_KEY = 'api_key';
  private readonly AI_PROVIDER_KEY = 'ai_provider';

  /**
   * Get app settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Return default settings
      return {
        theme: 'auto',
        codeTheme: 'monokai',
        fontSize: 14,
        autoSave: true,
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {
        theme: 'auto',
        codeTheme: 'monokai',
        fontSize: 14,
        autoSave: true,
      };
    }
  }

  /**
   * Update app settings
   */
  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Save API key securely
   */
  async saveAPIKey(key: string, provider: string = 'openai'): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.API_KEY_KEY, key);
      await AsyncStorage.setItem(this.AI_PROVIDER_KEY, provider);
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw error;
    }
  }

  /**
   * Get API key securely
   */
  async getAPIKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.API_KEY_KEY);
    } catch (error) {
      console.error('Failed to get API key:', error);
      return null;
    }
  }

  /**
   * Get AI provider
   */
  async getAIProvider(): Promise<string> {
    try {
      const provider = await AsyncStorage.getItem(this.AI_PROVIDER_KEY);
      return provider || 'openai';
    } catch (error) {
      console.error('Failed to get AI provider:', error);
      return 'openai';
    }
  }

  /**
   * Delete API key
   */
  async deleteAPIKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.API_KEY_KEY);
      await AsyncStorage.removeItem(this.AI_PROVIDER_KEY);
    } catch (error) {
      console.error('Failed to delete API key:', error);
      throw error;
    }
  }

  /**
   * Add to search history
   */
  async addSearchHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      // Keep only last 50 searches, remove duplicates
      const updated = [query, ...history.filter(h => h !== query)].slice(0, 50);
      await AsyncStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to add search history:', error);
    }
  }

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(this.SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get search history:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
      throw error;
    }
  }

  /**
   * Store any generic data
   */
  async setData(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve any generic data
   */
  async getData(key: string): Promise<any | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error(`Failed to get data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove generic data
   */
  async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
      throw error;
    }
  }
}

export default new StorageService();
