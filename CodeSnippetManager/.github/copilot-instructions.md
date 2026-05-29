# Code Snippet Manager - Development Guide

## Project Overview

This is a comprehensive React Native mobile application built with Expo and TypeScript for managing code snippets offline-first. The app supports snippet creation, organization, searching, AI-powered code explanations, and file management.

## Architecture Overview

### Offline-First Design
- **Primary Database**: SQLite (expo-sqlite) for all snippets and metadata
- **Preferences Storage**: AsyncStorage for app settings
- **Secure Storage**: SecureStore for API keys
- **File Management**: Expo FileSystem for exports and attachments

### State Management
- **Zustand** for global app state (snippets, favorites, search, settings)
- **React Query** patterns for data synchronization
- **Local state** for UI components

### Technology Stack
- Expo 56.0
- React Native 0.85
- TypeScript 5.3
- React Navigation 6
- React Native Gesture Handler & Screens

## Key Services

### DatabaseService (`src/services/database/index.ts`)
Manages all SQLite operations:
- CRUD operations for snippets
- Search and filtering
- Favorite management
- AI explanation storage
- File resource associations

### StorageService (`src/services/storage/index.ts`)
Handles AsyncStorage and SecureStore:
- App preferences (theme, fontSize, autoSave)
- Search history
- API key management (encrypted)
- Generic key-value storage

### FileService (`src/services/index.ts`)
Manages file operations:
- Export snippets (txt, json, js, ts, py)
- File attachments
- Share functionality
- Directory management

### AIService (`src/services/ai/index.ts`)
Integrates with AI providers:
- OpenAI API support
- Anthropic Claude support
- Code explanation generation
- Summary and improvement suggestions
- API key validation

## Screens & Navigation

### Tab Navigation
1. **Snippets Stack** (Home)
   - HomeScreen: List all snippets with search
   - CreateSnippetScreen: Create/edit snippets
   - SnippetDetailsScreen: View snippet with AI/export options

2. **Favorites**: View favorite snippets

3. **File Manager**: Browse exported files

4. **Settings**: Configure app and AI provider

## Database Schema

All tables include proper indexes for performance:
- `snippets`: Core snippet data
- `tags`: Tag management
- `file_resources`: File attachments
- `ai_explanations`: Generated explanations
- `search_history`: User search queries

## Code Style & Conventions

### TypeScript
- Strict mode enabled
- Full type annotations
- Interfaces for all data structures
- No `any` types without justification

### Component Structure
```typescript
interface ComponentProps {
  prop1: type;
  prop2?: type;
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
};
```

### Error Handling
- Always wrap DB/API calls in try-catch
- Provide user-friendly error messages
- Log errors to console for debugging
- Use Alert for user notifications

## Environment Setup

### Required Environment Variables
None for basic functionality. For AI features:
- OpenAI API Key (optional, can be set in app)
- Anthropic API Key (optional, can be set in app)

### Development Commands
```bash
npm install          # Install dependencies
npm start           # Start Expo development server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
npm run web         # Run in web browser
npm run build:android  # Build APK
npm run build:ios      # Build iOS app
```

## Common Development Tasks

### Adding a New Screen
1. Create file in `src/screens/`
2. Add to `src/screens/index.ts`
3. Add navigation route in `RootNavigator.tsx`
4. Connect to store if needed

### Adding Database Operations
1. Add method to `DatabaseService` class
2. Include proper error handling
3. Add TypeScript types for parameters
4. Update store actions if needed

### Adding UI Components
1. Create in `src/components/`
2. Export from `src/components/index.ts`
3. Use in screens
4. Keep props interface in component file

### Working with Async Storage
1. Use `StorageService` wrapper
2. Handle null/undefined values
3. Provide default values
4. Cache in Zustand store when appropriate

## Performance Optimization

### Database
- Use indexes for frequent queries
- Pagination for large datasets (future enhancement)
- Batch operations where possible

### UI Rendering
- FlatList with proper key extraction
- useMemo for expensive computations
- Avoid inline function definitions in props

### Memory
- Unsubscribe from navigation listeners
- Clean up timers and intervals
- Minimize concurrent API calls

## Testing Considerations

### Manual Testing Checklist
- [ ] Create, edit, delete snippets
- [ ] Search functionality works
- [ ] Favorites toggle works
- [ ] Export in all formats
- [ ] File manager operations
- [ ] Settings persistence
- [ ] Offline functionality (disable network)
- [ ] AI explanations (with API key)

### Error Scenarios
- [ ] Invalid API key handling
- [ ] File permission errors
- [ ] Database corruption recovery
- [ ] Empty search results
- [ ] Large code snippets
- [ ] Special characters in titles/code

## Deployment

### Building for Distribution
```bash
# Android
eas build --platform android

# iOS  
eas build --platform ios
```

### Store Requirements
- App icon (needs creation)
- Screenshots (multiple sizes needed)
- App description and privacy policy
- Permissions declaration
- Database disclaimer

## Known Limitations & Future Work

### Current Limitations
- No cloud synchronization
- No code syntax highlighting
- No collaboration features
- Limited AI provider support

### Planned Enhancements
- Cloud backup/sync
- Syntax-highlighted code display
- Team collaboration
- More AI providers
- Custom themes
- Snippet templates
- Plugin ecosystem

## Troubleshooting

### Common Issues

**Database locked error**
- Close other connections
- Restart the app
- Check database file permissions

**AI API errors**
- Verify API key is correct
- Check internet connection
- Review API usage limits
- Check account balance

**File system errors**
- Verify app has file permissions
- Check available storage space
- Reset cache if needed

**State sync issues**
- Clear AsyncStorage (Settings)
- Reinitialize database
- Restart app

## Security Considerations

- API keys stored in SecureStore (encrypted)
- No sensitive data in AsyncStorage
- Validate all user inputs
- SQL injection prevention via parameterized queries
- No credentials in version control

## Code Quality Standards

- TypeScript strict mode
- Proper error handling
- Meaningful variable/function names
- Component composition
- Reusable utilities
- Clean code principles

## Getting Help

- Check README.md for feature documentation
- Review existing screen implementations
- Check service class implementations
- Review type definitions in src/types/
- Test with sample data

