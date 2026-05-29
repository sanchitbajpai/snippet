import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Snippet, Tag, FileResource, AIExplanation } from '@app-types/index';

/**
 * Database interface abstraction for native and web implementations.
 */

type DatabaseInterface = {
  execAsync: (sql: string, readOnly?: boolean) => Promise<any>;
  runAsync: (sql: string, params?: any[]) => Promise<any>;
  getFirstAsync: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
  getAllAsync: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  closeAsync: () => Promise<void>;
};

type WebDatabaseState = {
  snippets: any[];
  tags: Tag[];
  file_resources: FileResource[];
  ai_explanations: AIExplanation[];
  search_history: any[];
};

class WebStorageDatabaseAdapter implements DatabaseInterface {
  private readonly storageKey = 'codesnippetmanager.webdb';
  private state: WebDatabaseState = {
    snippets: [],
    tags: [],
    file_resources: [],
    ai_explanations: [],
    search_history: [],
  };

  async initialize(): Promise<void> {
    const stored = window.localStorage.getItem(this.storageKey);
    if (stored) {
      this.state = { ...this.state, ...JSON.parse(stored) };
    }
  }

  async execAsync(): Promise<any> {
    return undefined;
  }

  async runAsync(sql: string, params: any[] = []): Promise<any> {
    const normalizedSql = sql.trim().replace(/\s+/g, ' ').toLowerCase();

    if (normalizedSql.startsWith('insert into snippets')) {
      const [id, title, code, language, tags, isFavorite, description, createdAt, updatedAt] = params;
      this.upsert('snippets', { id, title, code, language, tags, isFavorite, description, createdAt, updatedAt });
    } else if (normalizedSql.startsWith('update snippets set')) {
      const [title, code, language, tags, isFavorite, description, updatedAt, id] = params;
      const snippet = this.state.snippets.find(item => item.id === id);
      if (snippet) {
        Object.assign(snippet, { title, code, language, tags, isFavorite, description, updatedAt });
      }
    } else if (normalizedSql.startsWith('delete from snippets where id')) {
      const [id] = params;
      this.state.snippets = this.state.snippets.filter(item => item.id !== id);
      this.state.file_resources = this.state.file_resources.filter(item => item.snippetId !== id);
      this.state.ai_explanations = this.state.ai_explanations.filter(item => item.snippetId !== id);
    } else if (normalizedSql.startsWith('insert into file_resources')) {
      const [id, name, path, size, type, snippetId, createdAt] = params;
      this.upsert('file_resources', { id, name, path, size, type, snippetId, createdAt });
    } else if (normalizedSql.startsWith('delete from file_resources where id')) {
      const [id] = params;
      this.state.file_resources = this.state.file_resources.filter(item => item.id !== id);
    } else if (normalizedSql.startsWith('insert into ai_explanations')) {
      const [id, snippetId, type, content, generatedAt, aiProvider] = params;
      this.upsert('ai_explanations', { id, snippetId, type, content, generatedAt, aiProvider });
    } else if (normalizedSql.startsWith('delete from ai_explanations where id')) {
      const [id] = params;
      this.state.ai_explanations = this.state.ai_explanations.filter(item => item.id !== id);
    }

    this.persist();
  }

  async getFirstAsync<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.getAllAsync(sql, params);
    return rows.length > 0 ? rows[0] as T : null;
  }

  async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const normalizedSql = sql.trim().replace(/\s+/g, ' ').toLowerCase();

    if (normalizedSql.includes('from snippets')) {
      let results = [...this.state.snippets];

      if (normalizedSql.includes('where id = ?')) {
        results = results.filter(item => item.id === params[0]);
      } else if (normalizedSql.includes('where isfavorite = 1')) {
        results = results.filter(item => Number(item.isFavorite) === 1);
      } else if (normalizedSql.includes('where language = ?')) {
        results = results.filter(item => item.language === params[0]);
      } else if (normalizedSql.includes('lower(title) like')) {
        const query = String(params[0] ?? '').replace(/^%|%$/g, '').toLowerCase();
        results = results.filter(item =>
          String(item.title ?? '').toLowerCase().includes(query) ||
          String(item.code ?? '').toLowerCase().includes(query) ||
          String(item.description ?? '').toLowerCase().includes(query)
        );
      }

      return this.sortByNewestUpdate(results) as T[];
    }

    if (normalizedSql.includes('from file_resources')) {
      const results = this.state.file_resources
        .filter(item => item.snippetId === params[0])
        .sort((a, b) => b.createdAt - a.createdAt);
      return results as T[];
    }

    if (normalizedSql.includes('from ai_explanations')) {
      const results = this.state.ai_explanations
        .filter(item => item.snippetId === params[0])
        .sort((a, b) => b.generatedAt - a.generatedAt);
      return results as T[];
    }

    return [];
  }

  async closeAsync(): Promise<void> {
    this.persist();
  }

  clearAllData(): void {
    this.state = {
      snippets: [],
      tags: [],
      file_resources: [],
      ai_explanations: [],
      search_history: [],
    };
    this.persist();
  }

  private upsert(collection: keyof WebDatabaseState, item: any): void {
    const items = this.state[collection] as any[];
    const index = items.findIndex(existing => existing.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
  }

  private sortByNewestUpdate<T extends { updatedAt?: number }>(items: T[]): T[] {
    return items.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }

  private persist(): void {
    window.localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }
}

async function openDatabaseWithCompatibility(databaseName: string): Promise<DatabaseInterface> {
  if (Platform.OS === 'web') {
    const db = new WebStorageDatabaseAdapter();
    await db.initialize();
    return db;
  }

  return SQLite.openDatabaseAsync(databaseName) as Promise<DatabaseInterface>;
}

/**
 * Database service for managing SQLite operations
 * Handles all CRUD operations for snippets, tags, and related data
 */

class DatabaseService {
  private db: DatabaseInterface | null = null;
  private isInitialized = false;

  /**
   * Initialize the database connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await openDatabaseWithCompatibility('snippets.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create all necessary tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Snippets table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS snippets (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          code TEXT NOT NULL,
          language TEXT NOT NULL,
          tags TEXT DEFAULT '[]',
          isFavorite INTEGER DEFAULT 0,
          description TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );
      `);

      // Tags table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          createdAt INTEGER NOT NULL
        );
      `);

      // File resources table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS file_resources (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          path TEXT NOT NULL,
          size INTEGER NOT NULL,
          type TEXT NOT NULL,
          snippetId TEXT,
          createdAt INTEGER NOT NULL,
          FOREIGN KEY (snippetId) REFERENCES snippets(id) ON DELETE CASCADE
        );
      `);

      // AI Explanations table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS ai_explanations (
          id TEXT PRIMARY KEY,
          snippetId TEXT NOT NULL,
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          generatedAt INTEGER NOT NULL,
          aiProvider TEXT,
          FOREIGN KEY (snippetId) REFERENCES snippets(id) ON DELETE CASCADE
        );
      `);

      // Search history table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS search_history (
          id TEXT PRIMARY KEY,
          query TEXT NOT NULL,
          createdAt INTEGER NOT NULL
        );
      `);

      // Create indexes for better query performance
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_snippets_title ON snippets(title);
        CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language);
        CREATE INDEX IF NOT EXISTS idx_snippets_favorite ON snippets(isFavorite);
        CREATE INDEX IF NOT EXISTS idx_snippets_created ON snippets(createdAt);
        CREATE INDEX IF NOT EXISTS idx_files_snippet ON file_resources(snippetId);
        CREATE INDEX IF NOT EXISTS idx_explanations_snippet ON ai_explanations(snippetId);
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  // ==================== SNIPPET OPERATIONS ====================

  /**
   * Create a new snippet
   */
  async createSnippet(snippet: Omit<Snippet, 'createdAt' | 'updatedAt'>): Promise<Snippet> {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const newSnippet: Snippet = {
      ...snippet,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.db.runAsync(
        `INSERT INTO snippets (id, title, code, language, tags, isFavorite, description, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newSnippet.id,
          newSnippet.title,
          newSnippet.code,
          newSnippet.language,
          JSON.stringify(newSnippet.tags),
          newSnippet.isFavorite ? 1 : 0,
          newSnippet.description || null,
          newSnippet.createdAt,
          newSnippet.updatedAt,
        ]
      );

      return newSnippet;
    } catch (error) {
      console.error('Failed to create snippet:', error);
      throw error;
    }
  }

  /**
   * Get snippet by ID
   */
  async getSnippet(id: string): Promise<Snippet | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM snippets WHERE id = ?',
        [id]
      );

      if (!result) return null;

      return {
        ...result,
        tags: JSON.parse(result.tags || '[]'),
        isFavorite: Boolean(result.isFavorite),
      };
    } catch (error) {
      console.error('Failed to get snippet:', error);
      throw error;
    }
  }

  /**
   * Get all snippets
   */
  async getAllSnippets(): Promise<Snippet[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM snippets ORDER BY updatedAt DESC'
      );

      return results.map(result => ({
        ...result,
        tags: JSON.parse(result.tags || '[]'),
        isFavorite: Boolean(result.isFavorite),
      }));
    } catch (error) {
      console.error('Failed to get all snippets:', error);
      throw error;
    }
  }

  /**
   * Get favorite snippets
   */
  async getFavoriteSnippets(): Promise<Snippet[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM snippets WHERE isFavorite = 1 ORDER BY updatedAt DESC'
      );

      return results.map(result => ({
        ...result,
        tags: JSON.parse(result.tags || '[]'),
        isFavorite: Boolean(result.isFavorite),
      }));
    } catch (error) {
      console.error('Failed to get favorite snippets:', error);
      throw error;
    }
  }

  /**
   * Update snippet
   */
  async updateSnippet(id: string, updates: Partial<Snippet>): Promise<Snippet> {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const snippet = await this.getSnippet(id);
    if (!snippet) throw new Error('Snippet not found');

    const updated: Snippet = {
      ...snippet,
      ...updates,
      id: snippet.id,
      createdAt: snippet.createdAt,
      updatedAt: now,
    };

    try {
      await this.db.runAsync(
        `UPDATE snippets SET title = ?, code = ?, language = ?, tags = ?, isFavorite = ?, description = ?, updatedAt = ?
         WHERE id = ?`,
        [
          updated.title,
          updated.code,
          updated.language,
          JSON.stringify(updated.tags),
          updated.isFavorite ? 1 : 0,
          updated.description || null,
          updated.updatedAt,
          id,
        ]
      );

      return updated;
    } catch (error) {
      console.error('Failed to update snippet:', error);
      throw error;
    }
  }

  /**
   * Delete snippet
   */
  async deleteSnippet(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM snippets WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      throw error;
    }
  }

  /**
   * Search snippets by title or code
   */
  async searchSnippets(query: string): Promise<Snippet[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const searchPattern = `%${query.toLowerCase()}%`;
      const results = await this.db.getAllAsync<any>(
        `SELECT * FROM snippets 
         WHERE LOWER(title) LIKE ? OR LOWER(code) LIKE ? OR LOWER(description) LIKE ?
         ORDER BY updatedAt DESC`,
        [searchPattern, searchPattern, searchPattern]
      );

      return results.map(result => ({
        ...result,
        tags: JSON.parse(result.tags || '[]'),
        isFavorite: Boolean(result.isFavorite),
      }));
    } catch (error) {
      console.error('Failed to search snippets:', error);
      throw error;
    }
  }

  /**
   * Get snippets by language
   */
  async getSnippetsByLanguage(language: string): Promise<Snippet[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM snippets WHERE language = ? ORDER BY updatedAt DESC',
        [language]
      );

      return results.map(result => ({
        ...result,
        tags: JSON.parse(result.tags || '[]'),
        isFavorite: Boolean(result.isFavorite),
      }));
    } catch (error) {
      console.error('Failed to get snippets by language:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<Snippet> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const snippet = await this.getSnippet(id);
      if (!snippet) throw new Error('Snippet not found');

      return await this.updateSnippet(id, {
        isFavorite: !snippet.isFavorite,
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }

  // ==================== FILE RESOURCE OPERATIONS ====================

  /**
   * Create file resource
   */
  async createFileResource(file: FileResource): Promise<FileResource> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT INTO file_resources (id, name, path, size, type, snippetId, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          file.id,
          file.name,
          file.path,
          file.size,
          file.type,
          file.snippetId || null,
          file.createdAt,
        ]
      );

      return file;
    } catch (error) {
      console.error('Failed to create file resource:', error);
      throw error;
    }
  }

  /**
   * Get files for snippet
   */
  async getFilesForSnippet(snippetId: string): Promise<FileResource[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM file_resources WHERE snippetId = ? ORDER BY createdAt DESC',
        [snippetId]
      );

      return results;
    } catch (error) {
      console.error('Failed to get files for snippet:', error);
      throw error;
    }
  }

  /**
   * Delete file resource
   */
  async deleteFileResource(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM file_resources WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete file resource:', error);
      throw error;
    }
  }

  // ==================== AI EXPLANATION OPERATIONS ====================

  /**
   * Create AI explanation
   */
  async createAIExplanation(explanation: AIExplanation): Promise<AIExplanation> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT INTO ai_explanations (id, snippetId, type, content, generatedAt, aiProvider)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          explanation.id,
          explanation.snippetId,
          explanation.type,
          explanation.content,
          explanation.generatedAt,
          explanation.aiProvider,
        ]
      );

      return explanation;
    } catch (error) {
      console.error('Failed to create AI explanation:', error);
      throw error;
    }
  }

  /**
   * Get AI explanations for snippet
   */
  async getAIExplanations(snippetId: string): Promise<AIExplanation[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM ai_explanations WHERE snippetId = ? ORDER BY generatedAt DESC',
        [snippetId]
      );

      return results;
    } catch (error) {
      console.error('Failed to get AI explanations:', error);
      throw error;
    }
  }

  /**
   * Delete AI explanation
   */
  async deleteAIExplanation(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM ai_explanations WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete AI explanation:', error);
      throw error;
    }
  }

  // ==================== DATABASE MAINTENANCE ====================

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.isInitialized = false;
    }
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      if (this.db instanceof WebStorageDatabaseAdapter) {
        this.db.clearAllData();
        return;
      }

      await this.db.execAsync(`
        DELETE FROM snippets;
        DELETE FROM tags;
        DELETE FROM file_resources;
        DELETE FROM ai_explanations;
        DELETE FROM search_history;
      `);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
