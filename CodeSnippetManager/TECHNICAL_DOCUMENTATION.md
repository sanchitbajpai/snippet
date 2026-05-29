# Code Snippet Manager - Technical Documentation

## Database Structure

### Schema Overview

The application uses SQLite with the following schema:

#### 1. Snippets Table
```sql
CREATE TABLE snippets (
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

CREATE INDEX idx_snippets_title ON snippets(title);
CREATE INDEX idx_snippets_language ON snippets(language);
CREATE INDEX idx_snippets_favorite ON snippets(isFavorite);
CREATE INDEX idx_snippets_created ON snippets(createdAt);
```

**Purpose**: Core data storage for all code snippets
- `id`: Unique identifier (UUID)
- `title`: Snippet name/title
- `code`: The actual code content
- `language`: Programming language for syntax highlighting
- `tags`: JSON array of tags for categorization
- `isFavorite`: Boolean flag for favorites (0 or 1)
- `description`: Optional longer description
- `createdAt`/`updatedAt`: Timestamps for tracking

#### 2. Tags Table
```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  createdAt INTEGER NOT NULL
);
```

**Purpose**: Tag management (future expansion for tag-based filtering)
- `id`: Unique tag identifier
- `name`: Tag name (unique)
- `createdAt`: Tag creation timestamp

#### 3. File Resources Table
```sql
CREATE TABLE file_resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  snippetId TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (snippetId) REFERENCES snippets(id) ON DELETE CASCADE
);

CREATE INDEX idx_files_snippet ON file_resources(snippetId);
```

**Purpose**: Manage attached files and screenshots
- `id`: File identifier
- `name`: File name
- `path`: Local file system path
- `size`: File size in bytes
- `type`: File type (image, code, document, etc.)
- `snippetId`: Reference to parent snippet (can be null)
- `createdAt`: Upload/creation time
- Cascade delete ensures cleanup when snippet is deleted

#### 4. AI Explanations Table
```sql
CREATE TABLE ai_explanations (
  id TEXT PRIMARY KEY,
  snippetId TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  generatedAt INTEGER NOT NULL,
  aiProvider TEXT,
  FOREIGN KEY (snippetId) REFERENCES snippets(id) ON DELETE CASCADE
);

CREATE INDEX idx_explanations_snippet ON ai_explanations(snippetId);
```

**Purpose**: Store AI-generated explanations
- `id`: Explanation identifier
- `snippetId`: Reference to source snippet
- `type`: explanation, summary, or improvement
- `content`: Generated AI response text
- `generatedAt`: Generation timestamp
- `aiProvider`: Which AI provider generated it (openai, claude, etc.)

#### 5. Search History Table
```sql
CREATE TABLE search_history (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);
```

**Purpose**: Track user searches for autocomplete
- `id`: History entry ID
- `query`: The search query
- `createdAt`: Search timestamp

### Database Design Principles

1. **Normalization**: Data is normalized to reduce redundancy
2. **Indexes**: Strategic indexes on frequently queried fields for performance
3. **Foreign Keys**: Relationships with cascade delete for data integrity
4. **JSON Storage**: Tags stored as JSON arrays for flexibility
5. **Timestamps**: All records include timestamps for auditing

## Offline Storage Implementation

### Multi-Layer Storage Strategy

#### Layer 1: SQLite (Primary Database)
- **Purpose**: Persistent storage of all core data
- **Scope**: Snippets, tags, file metadata, AI explanations
- **Persistence**: Survives app restart and device reboot
- **Offline**: Fully functional without internet

**Key Features**:
- Structured querying with SQL
- Indexing for fast searches
- Transactions for data integrity
- Foreign key constraints
- Cascade operations

#### Layer 2: AsyncStorage (Preferences)
- **Purpose**: Store app preferences and settings
- **Scope**: 
  - Theme preference (light/dark/auto)
  - Font size setting
  - Auto-save preference
  - Search history
  - AI provider selection
- **Storage Limit**: ~10MB per app
- **Default Values**: Automatically provided if missing

**Key Features**:
- Simple key-value storage
- Automatic serialization/deserialization
- No encryption (suitable for non-sensitive data)
- Suitable for preferences and cache

#### Layer 3: SecureStore (Sensitive Data)
- **Purpose**: Encrypted storage of sensitive information
- **Scope**: API keys for AI providers
- **Encryption**: Platform-specific secure storage
  - iOS: Keychain
  - Android: Keystore
- **Security**: Data is encrypted and inaccessible without app unlock

**Key Features**:
- Hardware-backed encryption when available
- Protected by device security
- Zero exposure of keys in logs or memory leaks
- Separate from app data

#### Layer 4: Expo FileSystem (File Management)
- **Purpose**: Manage actual files on device storage
- **Scope**: Exported snippets, attachments, templates
- **Directories**:
  - `DocumentDirectory/CodeSnippetManager/`: App root
  - `.../ attachments/`: Screenshots and file attachments
  - `.../exports/`: Exported snippet files
  - `.../templates/`: Snippet templates (future)
- **Operations**: Copy, move, delete, read, write

### Data Flow for Offline Operation

#### Creating a Snippet (Offline)
```
User Input
    ↓
Validation
    ↓
Generate UUID
    ↓
Store in SQLite
    ↓
Update Zustand Store
    ↓
UI Update (Immediate)
```

#### Searching Snippets (Offline)
```
User Search Query
    ↓
AsyncStorage: Add to search history
    ↓
SQLite: Query with LIKE patterns
    ↓
Results in Zustand Store
    ↓
UI Display
```

#### Exporting Snippet (Offline)
```
Snippet Data
    ↓
Format Selection (txt/json/js/etc)
    ↓
Generate File Content
    ↓
Write to FileSystem
    ↓
Share Intent (native share)
```

#### AI Explanation (Requires Internet)
```
User Request
    ↓
Check API Key in SecureStore
    ↓
Network Request to AI API
    ↓
Parse Response
    ↓
Store in SQLite
    ↓
Display in UI
```

## CRUD Operations Implementation

### Create Operations

```typescript
async createSnippet(snippet: Omit<Snippet, 'createdAt' | 'updatedAt'>): Promise<Snippet> {
  // Generate timestamps
  const now = Date.now();
  const newSnippet = { ...snippet, createdAt: now, updatedAt: now };
  
  // Insert into SQLite
  await db.runAsync(
    'INSERT INTO snippets (...) VALUES (...)',
    [values]
  );
  
  // Update Zustand store
  updateStore();
  
  return newSnippet;
}
```

**Transaction Safety**: Each insert is atomic

### Read Operations

```typescript
async getSnippet(id: string): Promise<Snippet | null> {
  // Query single snippet
  const result = await db.getFirstAsync(
    'SELECT * FROM snippets WHERE id = ?',
    [id]
  );
  
  // Parse JSON fields
  return result ? parseResult(result) : null;
}

async getAllSnippets(): Promise<Snippet[]> {
  // Query all snippets, ordered by recency
  const results = await db.getAllAsync(
    'SELECT * FROM snippets ORDER BY updatedAt DESC'
  );
  
  return results.map(parseResult);
}

async searchSnippets(query: string): Promise<Snippet[]> {
  // Full-text search across multiple fields
  const pattern = `%${query.toLowerCase()}%`;
  return db.getAllAsync(
    `SELECT * FROM snippets 
     WHERE LOWER(title) LIKE ? 
        OR LOWER(code) LIKE ?
        OR LOWER(description) LIKE ?
     ORDER BY updatedAt DESC`,
    [pattern, pattern, pattern]
  );
}
```

**Search Optimization**:
- Case-insensitive search using LOWER()
- Multiple field matching
- Indexed fields for performance
- Results sorted by relevance

### Update Operations

```typescript
async updateSnippet(id: string, updates: Partial<Snippet>): Promise<Snippet> {
  // Fetch current version
  const current = await getSnippet(id);
  
  // Merge updates
  const updated = { ...current, ...updates, updatedAt: Date.now() };
  
  // Update in database
  await db.runAsync(
    'UPDATE snippets SET ... WHERE id = ?',
    [values]
  );
  
  return updated;
}
```

**Conflict Resolution**: Last-write-wins strategy with timestamps

### Delete Operations

```typescript
async deleteSnippet(id: string): Promise<void> {
  // Delete snippet (cascade deletes related records)
  await db.runAsync('DELETE FROM snippets WHERE id = ?', [id]);
  
  // Delete attachments from filesystem
  const files = await getFilesForSnippet(id);
  for (const file of files) {
    await FileSystem.deleteAsync(file.path);
  }
}
```

**Data Integrity**: Cascade operations ensure no orphaned records

## File Management Implementation

### Directory Structure

```
DocumentDirectory/
└── CodeSnippetManager/
    ├── attachments/      (Screenshots, images)
    ├── exports/          (Exported snippet files)
    └── templates/        (Future: snippet templates)
```

### File Operations

```typescript
// Save attachment
async saveAttachment(sourceUri: string, snippetId: string): Promise<FileResource> {
  // Copy to app directory
  const destUri = `${ATTACHMENTS_DIR}${uuid()}_${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  
  // Get file info
  const info = await FileSystem.getInfoAsync(destUri);
  
  // Create database record
  return createFileResource({ id: uuid(), path: destUri, size: info.size });
}

// Export snippet
async exportAsText(title: string, code: string, metadata: any): Promise<string> {
  // Format content
  const content = formatSnippet(title, code, metadata);
  
  // Write to file
  const path = `${EXPORTS_DIR}${filename}`;
  await FileSystem.writeAsStringAsync(path, content);
  
  return path;
}

// Share file
async shareFile(filePath: string, mimeType: string): Promise<void> {
  // Use native share dialog
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, { mimeType });
  }
}
```

## State Management with Zustand

### Store Structure

```typescript
interface SnippetStore {
  // State
  snippets: Snippet[];
  favorites: Snippet[];
  searchResults: Snippet[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadAllSnippets(): Promise<void>;
  createSnippet(snippet): Promise<Snippet>;
  deleteSnippet(id: string): Promise<void>;
  searchSnippets(query: string): Promise<void>;
  // ... more actions
}
```

### Store Persistence

- **Persisted**: None (store is computed from database)
- **Rehydrated on**: App startup, navigation focus, manual refresh
- **Cache Strategy**: In-memory cache with database as source of truth

### Store Updates

- Actions automatically update store after DB operations
- UI subscribes to store changes via hooks
- Optimistic updates not used (to maintain consistency)

## AI Integration Workflow

### Configuration Flow

1. **User sets API key in Settings**
   - Key validated for format
   - Saved to SecureStore (encrypted)
   - Provider saved to AsyncStorage

2. **On App Startup**
   - AIService loads credentials from SecureStore
   - Validates key on first use

3. **User requests explanation**
   - Check if key is configured
   - Determine AI provider
   - Construct prompt
   - Call provider API
   - Parse response
   - Store result in database

### API Integration

**OpenAI (GPT-3.5)**
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000
  })
});
```

**Anthropic Claude**
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  })
});
```

### Error Handling for AI

- API key validation before each request
- Graceful degradation if AI unavailable
- User-friendly error messages
- Explanation suggestions stored even if generation fails

## Performance Considerations

### Database Performance
- Indexes on frequently queried columns
- `updatedAt` DESC sorting for recent-first
- LIMIT clauses for pagination (future)
- Connection pooling (handled by expo-sqlite)

### UI Performance
- FlatList with keyExtractor
- Separate stacks for navigation (reduces re-renders)
- Zustand selectors for partial updates
- useMemo for expensive computations

### Memory Management
- Dispose of navigation listeners
- Clear timers on component unmount
- Pagination for large result sets
- Caching only recent searches

## Backup and Recovery

### Data Safety
- SQLite database is a single file (can be backed up)
- Files stored in DocumentDirectory (persisted)
- No automatic cloud sync (local-only)
- Manual export functionality

### Recovery Options
1. **Clear and Restart**: Reset app data via Settings
2. **File Export**: All data can be exported as files
3. **Manual Restoration**: Import exported files if system restored

## Security Implementation

### Data Encryption
- API keys: Hardware-backed encryption via SecureStore
- Database: Stored in app-only directory
- Files: Protected by app sandboxing
- Preferences: Plain text (non-sensitive only)

### Input Validation
- SQL injection prevention via parameterized queries
- XSS prevention (no web content)
- Type checking via TypeScript
- File path validation before operations

### Access Control
- App-level sandboxing enforced by OS
- No inter-app data sharing
- FileSystem permissions declared in app.json
- API keys never logged or exposed

## Testing Strategy

### Unit Tests (Recommended)
```typescript
describe('DatabaseService', () => {
  it('should create snippet', async () => {
    const snippet = await createSnippet(testData);
    expect(snippet.id).toBeDefined();
    expect(snippet.createdAt).toBeLessThanOrEqual(Date.now());
  });
});
```

### Integration Tests (Recommended)
```typescript
describe('Offline Functionality', () => {
  it('should work without network', async () => {
    // Disable network
    // Perform CRUD operations
    // Verify all work
  });
});
```

### Manual Testing Scenarios
1. Create, edit, delete snippets
2. Search with various keywords
3. Export in multiple formats
4. Toggle favorites
5. Manage attachments
6. Test with AI (if key provided)
7. Verify offline operation
8. Check database integrity after operations

## Deployment Considerations

### Production Checklist
- [ ] Database migrations (if needed)
- [ ] Error logging setup
- [ ] Performance monitoring
- [ ] User analytics (privacy-first)
- [ ] Crash reporting
- [ ] App signing (Android/iOS)
- [ ] Store listing preparation
- [ ] Privacy policy
- [ ] Terms of service

### Future Enhancements
1. **Cloud Sync**: Optional Firebase integration
2. **Backup**: Automatic cloud backup
3. **Sharing**: Share snippets via links
4. **Collaboration**: Multi-user editing
5. **Analytics**: Usage insights
6. **Performance**: Larger dataset optimization
