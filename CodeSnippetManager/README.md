# Code Snippet Manager

A modern developer-focused mobile application built with Expo, React Native, and TypeScript that allows users to save, organize, manage, and understand code snippets directly on their device.

## 🎯 Features

### Core Features

- **Snippet Management**
  - Create, edit, delete, and search code snippets
  - Mark snippets as favorites for quick access
  - Organize with tags and descriptions
  - Support for multiple programming languages

- **Offline-First Architecture**
  - All snippets stored locally using SQLite
  - Full functionality without internet connection
  - Local-first data access and persistence

- **File Management**
  - Attach screenshots and files to snippets
  - Browse, organize, and manage local resources
  - Move and copy files between folders
  - Export snippets in multiple formats

- **AI Code Explanation** (Requires API Key)
  - Generate code explanations using AI
  - Create summaries of complex code
  - Get improvement suggestions
  - Supports OpenAI (GPT-3.5) and Anthropic (Claude)

- **Export & Sharing**
  - Export snippets as .txt, .js, .json, .ts, or .py files
  - Share snippets with other applications
  - Save exported files locally for later access

### User Interface

- **Home Screen**: Browse all snippets with search functionality
- **Create Snippet Screen**: Create and edit code snippets
- **Snippet Details Screen**: View full code with AI explanations and export options
- **Favorites Screen**: Quick access to favorite snippets
- **File Manager Screen**: Manage exported files
- **Settings Screen**: Configure AI provider, customize app preferences

## 🏗️ Technology Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **Storage**: 
  - AsyncStorage: App preferences
  - SecureStore: Sensitive data (API keys)
  - Expo FileSystem: File management
- **State Management**: Zustand
- **Navigation**: React Navigation
- **AI Integration**: OpenAI API and Anthropic Claude API

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── TextInput.tsx
│   ├── SnippetCard.tsx
│   └── LoadingSpinner.tsx
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── CreateSnippetScreen.tsx
│   ├── SnippetDetailsScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── FileManagerScreen.tsx
│   └── SettingsScreen.tsx
├── services/           # Business logic
│   ├── database/       # SQLite operations
│   ├── storage/        # AsyncStorage & SecureStore
│   ├── ai/            # AI integration
│   └── index.ts       # File system operations
├── stores/            # Zustand state management
│   └── snippetStore.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions
│   └── index.ts
├── navigation/        # Navigation setup
│   └── RootNavigator.tsx
└── App.tsx           # Main app component
```

## 🗄️ Database Schema

### Snippets Table
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
```

### Tags Table
```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  createdAt INTEGER NOT NULL
);
```

### File Resources Table
```sql
CREATE TABLE file_resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  snippetId TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (snippetId) REFERENCES snippets(id)
);
```

### AI Explanations Table
```sql
CREATE TABLE ai_explanations (
  id TEXT PRIMARY KEY,
  snippetId TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  generatedAt INTEGER NOT NULL,
  aiProvider TEXT,
  FOREIGN KEY (snippetId) REFERENCES snippets(id)
);
```

## 🔒 Storage Strategy

### AsyncStorage (Preferences & Non-Sensitive Data)
- App theme preference (light/dark/auto)
- Font size setting
- Auto-save preference
- Search history
- AI provider selection

### SecureStore (Sensitive Data)
- API keys for AI providers
- Authentication tokens (if added in future)

### SQLite (Core Data)
- All code snippets
- Tags and categorization
- File metadata
- AI explanations history

### Expo FileSystem (File Management)
- Exported files (.txt, .json, .js, etc.)
- Attached screenshots and resources
- Template files
- User-managed documents

## 🤖 AI Integration

### Supported Providers

1. **OpenAI (GPT-3.5 Turbo)**
   - Requires API key from https://platform.openai.com/api-keys
   - Fast and reliable explanations
   - Good for code understanding

2. **Anthropic Claude**
   - Requires API key from https://console.anthropic.com/
   - Detailed and thoughtful explanations
   - Great for complex code analysis

### Configuration

1. Navigate to Settings
2. Select your preferred AI provider
3. Enter your API key (stored securely)
4. Save and test with code explanations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app on physical device)

### Installation

1. Navigate to the project directory:
```bash
cd CodeSnippetManager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📱 Usage Guide

### Creating a Snippet

1. Tap the **+** button on the Home screen
2. Enter snippet title and select language
3. Paste your code
4. Add optional description and tags
5. Tap "Create"

### Searching Snippets

1. Tap the search bar on Home screen
2. Type keywords to search by title, code content, or tags
3. Results update in real-time

### Getting AI Explanations

1. Open a snippet detail
2. Tap the "AI" tab
3. Click "Explain", "Summarize", or "Improve"
4. Explanations are generated and stored

### Exporting Snippets

1. Open snippet detail
2. Tap the code tab
3. Select "Export" and choose format
4. File is created and can be shared immediately

## 🔧 Offline Functionality

The app is designed to work completely offline:

- ✅ Create, read, update, delete snippets
- ✅ Search through local snippets
- ✅ Manage favorite snippets
- ✅ Export snippets to files
- ✅ Manage local files
- ✅ Change app settings

Only AI code explanations require an internet connection and API key.

## 📊 Error Handling

The application includes comprehensive error handling:

- Database operation failures with user feedback
- File system errors with recovery options
- AI API errors with helpful messages
- Input validation with inline error messages
- Graceful degradation when features unavailable

## 🎨 UI/UX Highlights

- Modern material design
- Intuitive tab-based navigation
- Floating action button for quick snippet creation
- Smooth animations and transitions
- Dark and light theme support
- Responsive layout for various screen sizes

## 📝 Code Quality

- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Reusable, maintainable components
- **State Management**: Centralized state with Zustand
- **Error Handling**: Comprehensive try-catch with user feedback
- **Code Organization**: Clean folder structure and naming conventions
- **Performance**: Optimized rendering and database queries

## 🤝 Contributing

To improve this project:

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper error handling
4. Test changes thoroughly
5. Update documentation

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙋 Support

For issues or feature requests, please create an issue in the repository.

## 🎓 Learning Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation](https://reactnavigation.org/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## 🚀 Future Enhancements

- Cloud sync for snippets
- Code syntax highlighting
- Team collaboration features
- Custom themes
- Snippet templates
- Code execution environment
- Version history for snippets
- Advanced search filters
- Snippet marketplace/sharing
- IDE integration
