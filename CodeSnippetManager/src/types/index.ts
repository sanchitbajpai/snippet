/**
 * Core type definitions for the Code Snippet Manager app
 */

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  description?: string;
  attachments?: string[]; // File paths to attachments
}

export interface Tag {
  id: string;
  name: string;
  createdAt: number;
}

export interface FileResource {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string; // 'image', 'code', 'document', etc.
  createdAt: number;
  snippetId?: string; // Reference to snippet if attached
}

export interface AIExplanation {
  id: string;
  snippetId: string;
  type: 'explanation' | 'summary' | 'improvement';
  content: string;
  generatedAt: number;
  aiProvider: string; // 'openai', 'claude', etc.
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  codeTheme: string; // 'dracula', 'monokai', etc.
  fontSize: number;
  autoSave: boolean;
  aiProvider?: string;
  apiKey?: string; // Stored securely
}

export interface SearchResult extends Snippet {
  relevance: number;
  matchedFields: string[];
}

export interface ExportOptions {
  format: 'txt' | 'js' | 'json' | 'ts' | 'py';
  includeMetadata: boolean;
  includeTags: boolean;
}
