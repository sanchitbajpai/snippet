# Code Snippet Manager

Code Snippet Manager is a React Native application built with Expo and TypeScript that helps developers save, organize, search, and understand code snippets directly on their device.

## 🚀 What this project does

This app provides a portable, offline-capable workspace for developers to store reusable code snippets, attach supporting files, and generate AI-powered explanations.

Key capabilities include:
- Create, edit, and delete code snippets
- Organize snippets with tags, descriptions, and favorites
- Search snippets by title, code, or description
- Attach files and manage exported documents
- Generate code explanations using AI providers
- Persist everything locally with SQLite and file storage

## ✨ Core Features

- **Snippet Management**
  - Add structured snippets with metadata
  - Update snippet content and language
  - Favorite important snippets
  - Search and filter quickly

- **Offline Storage**
  - Local data persistence with `expo-sqlite`
  - Works without internet connectivity

- **File Manager**
  - Attach local files to snippets
  - Export snippets as text, JSON, or code files
  - Browse exported files from within the app

- **AI Explanation**
  - Connect to OpenAI or Anthropic
  - Generate explanations, summaries, and improvement suggestions
  - Store AI responses alongside snippets

- **Secure Settings**
  - Save API keys securely with `expo-secure-store`
  - Persist preferences with AsyncStorage

## 🧱 Technology Stack

- Expo
- React Native
- TypeScript
- Expo SQLite (`expo-sqlite`)
- Zustand
- React Navigation
- Expo FileSystem
- Expo SecureStore
- AsyncStorage

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI components
├── navigation/          # App navigation configuration
├── screens/             # Main app screens
├── services/            # Business logic and APIs
│   ├── ai/              # AI provider integrations
│   ├── database/        # SQLite database service
│   ├── storage/         # AsyncStorage and SecureStore handling
│   └── index.ts         # File system and shared services
├── stores/              # Zustand state management
├── types/               # Shared TypeScript types
└── utils/               # Helper utilities
```

## 🗄️ Data Model

The app stores data locally in a SQLite database with the following logical tables:

- `snippets`
- `tags`
- `file_resources`
- `ai_explanations`

This structure supports snippet metadata, tag relationships, attached files, and cached AI outputs.

## 🔧 How to Run

### Prerequisites

- Node.js 16 or newer
- npm or yarn
- Expo CLI installed globally
- Android/iOS emulator or Expo Go for mobile

### Setup

```bash
cd CodeSnippetManager
npm install
```

### Run locally

```bash
npm start
```

### Platform commands

```bash
npm run ios
npm run android
npm run web
```

## 🧪 Notes

- This app is designed as a local-first code snippet manager.
- AI features require external API keys to function.
- Secure keys are stored using `expo-secure-store`.

## 📌 Useful Links

- Project repo: `https://github.com/sanchitbajpai/snippet`
- Expo documentation: https://docs.expo.dev
- OpenAI: https://platform.openai.com
- Anthropic: https://console.anthropic.com

## 🙌 Contribution

Feel free to open issues or add enhancements for:
- improved snippet organization
- code syntax highlighting
- cloud sync support
- additional AI providers

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
