import { v4 as uuid } from 'uuid';

/**
 * Utility functions for the app
 */

// ==================== ID GENERATION ====================

export const generateId = (): string => uuid();

// ==================== DATE FORMATTING ====================

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(timestamp);
};

// ==================== FILE SIZE FORMATTING ====================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// ==================== TEXT PROCESSING ====================

export const truncateText = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const highlightText = (text: string, query: string): string => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '**$1**');
};

export const extractCodeBlocks = (text: string): string[] => {
  const codeBlockRegex = /```[\s\S]*?```/g;
  return text.match(codeBlockRegex) || [];
};

// ==================== LANGUAGE DETECTION ====================

export const detectLanguage = (code: string): string => {
  // Simple language detection based on keywords
  const languagePatterns: { [key: string]: RegExp } = {
    javascript: /\b(function|const|let|var|async|await|import|export)\b/,
    python: /\b(def|class|import|from|async|await|if __name__)\b/,
    typescript: /\b(interface|type|namespace|declare|enum|async|await)\b/,
    java: /\b(public|class|private|protected|void|static|interface)\b/,
    cpp: /\b(#include|std::|using namespace|template|class)\b/,
    csharp: /\b(using|namespace|class|public|private|async|await)\b/,
    html: /\b(<!DOCTYPE|html|head|body|div|class|id)\b/,
    css: /\b(selector|{|}|color|font-size|display|flex)\b/,
    sql: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE)\b/i,
  };

  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  return 'text';
};

// ==================== VALIDATION ====================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAPIKey = (key: string, provider: string): boolean => {
  if (provider === 'openai') {
    return key.startsWith('sk-') && key.length > 20;
  } else if (provider === 'claude') {
    return key.startsWith('sk-ant-') && key.length > 20;
  }
  return key.length > 0;
};

// ==================== ARRAY OPERATIONS ====================

export const removeDuplicates = <T>(arr: T[], key?: (item: T) => any): T[] => {
  if (key) {
    const seen = new Set();
    return arr.filter(item => {
      const id = key(item);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
  return [...new Set(arr)];
};

export const groupBy = <T>(arr: T[], key: (item: T) => string | number): Record<string, T[]> => {
  return arr.reduce((result, item) => {
    const groupKey = key(item);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

// ==================== COLOR UTILITIES ====================

export const getLanguageColor = (language: string): string => {
  const colors: { [key: string]: string } = {
    javascript: '#F7DF1E',
    typescript: '#3178C6',
    python: '#3776AB',
    java: '#007396',
    cpp: '#00599C',
    csharp: '#239120',
    html: '#E34C26',
    css: '#563D7C',
    sql: '#336791',
    rust: '#CE422B',
    go: '#00ADD8',
    ruby: '#CC342D',
    php: '#777BB4',
  };

  return colors[language.toLowerCase()] || '#808080';
};

export const getLanguageIcon = (language: string): string => {
  // Return emoji or icon name based on language
  const icons: { [key: string]: string } = {
    javascript: '⚡',
    typescript: '📘',
    python: '🐍',
    java: '☕',
    cpp: '⚙️',
    csharp: '#️⃣',
    html: '🌐',
    css: '🎨',
    sql: '📊',
    rust: '🦀',
    go: '🐹',
    ruby: '💎',
    php: '🐘',
  };

  return icons[language.toLowerCase()] || '📄';
};

// ==================== ERROR HANDLING ====================

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

// ==================== STORAGE & SERIALIZATION ====================

export const stringifySnippet = (snippet: any, format: 'json' | 'text' = 'json'): string => {
  if (format === 'json') {
    return JSON.stringify(snippet, null, 2);
  }

  let text = `Title: ${snippet.title}\n`;
  text += `Language: ${snippet.language}\n`;
  if (snippet.tags?.length) text += `Tags: ${snippet.tags.join(', ')}\n`;
  if (snippet.description) text += `Description: ${snippet.description}\n\n`;
  text += `Code:\n\`\`\`\n${snippet.code}\n\`\`\`\n`;

  return text;
};

// ==================== SEARCH UTILITIES ====================

export const calculateSearchScore = (
  snippet: any,
  query: string
): number => {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  // Title match (highest priority)
  if (snippet.title.toLowerCase().includes(lowerQuery)) {
    score += 10;
    if (snippet.title.toLowerCase().startsWith(lowerQuery)) score += 5;
  }

  // Tags match
  if (snippet.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))) {
    score += 5;
  }

  // Code match
  if (snippet.code.toLowerCase().includes(lowerQuery)) {
    score += 2;
  }

  // Description match
  if (snippet.description?.toLowerCase().includes(lowerQuery)) {
    score += 1;
  }

  return score;
};

export const rankSearchResults = (snippets: any[], query: string): any[] => {
  return snippets
    .map(snippet => ({
      ...snippet,
      searchScore: calculateSearchScore(snippet, query),
    }))
    .sort((a, b) => b.searchScore - a.searchScore);
};
