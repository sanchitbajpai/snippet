# Code Snippet Manager - Setup Guide

## Prerequisites

### Required Software
- **Node.js**: v16 or higher ([download](https://nodejs.org/))
- **npm**: v8 or higher (comes with Node.js)
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **Git**: For version control (optional)

### For iOS Development
- **Xcode**: v13 or higher (macOS only)
- **iOS Simulator**: Included with Xcode
- **Minimum iOS**: 14.0+

### For Android Development
- **Android Studio**: Latest version ([download](https://developer.android.com/studio))
- **Android SDK**: API 24 or higher
- **Emulator**: Android Virtual Device
- **Minimum Android**: 10+

### For Web Development
- **Any modern browser**: Chrome, Firefox, Safari, Edge

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd c:\Users\SANCHIT\OneDrive\Desktop\UTILITIES\CodeSnippetManager
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Expo framework and dependencies
- React Native libraries
- All required packages listed in package.json

**Expected Output**:
```
added 500+ packages in 2-3 minutes
```

### 3. Verify Installation

```bash
npm list expo
npm list react-native
```

Should show versions like:
```
expo@56.0.6
react-native@0.85.3
```

## Starting Development Server

### Option 1: Start Expo Dev Server

```bash
npm start
```

This launches the Expo CLI menu with options to:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web Browser
- Press `j` to open Chrome DevTools
- Press `r` to reload
- Press `m` to toggle menu

### Option 2: Direct Platform Start

```bash
# iOS only
npm run ios

# Android only
npm run android

# Web browser
npm run web
```

## Running on iOS

### Using iOS Simulator

```bash
npm run ios
```

**Requirements**:
- macOS only
- Xcode installed
- Simulator available

**First Time Setup**:
1. Xcode may ask to install command line tools - approve
2. First build takes 2-3 minutes
3. Simulator will launch automatically

### Using Expo Go (Any Device)

1. Install "Expo Go" app from App Store
2. Run `npm start`
3. Scan QR code with Expo Go app
4. App loads in 10-20 seconds

## Running on Android

### Using Android Emulator

```bash
npm run android
```

**Requirements**:
- Android Studio installed
- Android SDK API 24+
- Emulator created and running

**Starting Emulator**:
```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd <emulator_name>
```

### Using Physical Device

1. Install "Expo Go" app from Play Store
2. Connect device via USB
3. Enable USB debugging
4. Run `npm start`
5. Select tunnel or LAN connection
6. Scan QR code with Expo Go
7. App loads on device

## Running on Web

```bash
npm run web
```

Opens `http://localhost:3000` in your browser. 
- Hot reload enabled
- Can test UI without mobile emulator
- Some native features may not work

## Environment Setup

### No Environment Variables Needed!

The app works with **zero configuration**. Optional features:
- OpenAI API key (set in app Settings)
- Anthropic Claude key (set in app Settings)

These can be configured directly in the app's Settings screen.

## Project Structure Check

Verify these directories exist after installation:

```
CodeSnippetManager/
├── src/                   ✓ Source code
├── node_modules/          ✓ Dependencies (created by npm install)
├── .git/                  ✓ Git repository (if cloned)
├── package.json           ✓ Dependencies config
├── tsconfig.json          ✓ TypeScript config
├── app.json               ✓ Expo config
└── index.js               ✓ Entry point
```

## First Run Checklist

- [ ] Clone/download repository
- [ ] `cd` into project directory
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Choose platform (ios/android/web)
- [ ] App loads successfully
- [ ] Can create a snippet
- [ ] Search works
- [ ] Database persists (restart app, snippet still there)

## Common Issues & Solutions

### Issue: "expo command not found"
**Solution**: Install globally
```bash
npm install -g expo-cli
```

### Issue: "Cannot find module" errors
**Solution**: Dependencies not installed
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use (port 19000)
**Solution**: Kill process or use different port
```bash
# Kill process using port
lsof -ti:19000 | xargs kill -9

# Or use different port
expo start --port 3000
```

### Issue: iOS Simulator doesn't start
**Solution**: Restart and clear cache
```bash
watchman watch-del-all
npm start
# Press 'i' again
```

### Issue: Android Emulator very slow
**Solution**: Use physical device or web for testing
```bash
# Test on web first
npm run web
```

### Issue: "TypeScript compilation error"
**Solution**: Check tsconfig.json and clear cache
```bash
rm -rf .expo
npm start
```

### Issue: "Database locked" error
**Solution**: Restart app or clear database
- Restart the app
- Go to Settings → Clear All Data (if needed)

## Testing the Application

### 1. Test Offline Functionality

```
1. Start app
2. Create a snippet
3. Disconnect network (airplane mode or dev tools)
4. Try to:
   - View snippets ✓
   - Search ✓
   - Edit snippet ✓
   - Delete snippet ✓
   - Export ✓
5. Reconnect network
6. All data should persist
```

### 2. Test Database

```
1. Create 5 different snippets with different languages
2. Search for each one
3. Mark some as favorites
4. Restart app
5. Verify all data exists
6. Export one snippet
7. Check exports folder
```

### 3. Test UI

```
1. Navigate through all screens
2. Test buttons and interactions
3. Create snippet with special characters
4. Search for various terms
5. Check error messages (try invalid input)
```

### 4. Test AI Features (Optional)

```
1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Go to Settings
3. Select "OpenAI"
4. Enter API key
5. Open a snippet
6. Go to AI tab
7. Click "Explain"
8. Wait for response
9. Response should appear
10. Go back to snippet, response should persist
```

## Development Commands

### Build Commands
```bash
# Web bundle
npm run build:web

# Android release build
npm run build:android

# iOS release build
npm run build:ios
```

### Development Commands
```bash
# Start dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

### Troubleshooting Commands
```bash
# Clear Expo cache
expo start --clear

# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules
npm install

# Check TypeScript
npx tsc --noEmit
```

## Debug Mode

### Chrome DevTools (Web)

```bash
npm run web
# Press 'j' in terminal to open debugger
```

### Flipper (Mobile)

1. Install Flipper: https://fbflipper.com/
2. Start app with `npm start`
3. Device appears in Flipper
4. Can inspect network, storage, etc.

### React DevTools

Install React DevTools browser extension:
- [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/)
- Use with web version of app

## Performance Testing

### Initial Load Time
```
Expected: 2-3 seconds from cold start
If slower: Clear cache (npm start --clear)
```

### Search Performance
```
With 1000 snippets:
- Search should complete in <500ms
- Results should appear instantly as you type
```

### Database Operations
```
Create snippet: <200ms
Delete snippet: <200ms
Load all snippets: <1000ms
Search: <500ms
```

## Memory Usage

### Expected Memory Footprint
- App size: ~50MB (with node_modules)
- Runtime: ~100-150MB
- Database (1000 snippets): ~1MB
- Attachments: Varies with files

### Memory Optimization
```bash
# If app slows down
1. Restart app
2. Close other apps
3. Restart device
4. Check available storage
```

## Storage Usage

### Typical Storage Distribution
```
node_modules/          : ~300MB (development only)
Built app              : ~30MB
Database (1000 snippets): ~1MB
Exported files         : Varies
App data               : ~10MB
```

### Clearing Storage
```
In Settings:
→ Scroll to "Danger Zone"
→ Tap "Clear All Data"
```

## Next Steps After Setup

1. **Read Documentation**
   - README.md: Feature overview
   - TECHNICAL_DOCUMENTATION.md: Database details

2. **Create First Snippet**
   - Tap + button
   - Enter code
   - Experience the app

3. **Explore Features**
   - Test search
   - Mark favorites
   - Export snippets
   - Try file manager

4. **Configure AI** (Optional)
   - Get API key
   - Go to Settings
   - Enter API key
   - Test explanations

5. **Customize**
   - Change theme
   - Adjust font size
   - Configure preferences

## Support Resources

### Documentation Files
- `README.md` - Features and usage
- `TECHNICAL_DOCUMENTATION.md` - Architecture
- `IMPLEMENTATION_SUMMARY.md` - Feature list
- `.github/copilot-instructions.md` - Development guide

### Online Resources
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation](https://reactnavigation.org/)

### Quick Help
```bash
# Check app version
npm list expo

# Show all available commands
npm run

# Check for issues
npx tsc --noEmit

# Lint code
npx eslint src/ --max-warnings 0
```

## Troubleshooting Checklist

- [ ] Node.js v16+ installed: `node -v`
- [ ] npm v8+ installed: `npm -v`
- [ ] Dependencies installed: `ls node_modules`
- [ ] TypeScript config OK: `npx tsc --version`
- [ ] Can start dev server: `npm start`
- [ ] Can view in browser: `npm run web`
- [ ] Can create snippet: Test manually
- [ ] Database working: Snippet persists after restart
- [ ] No console errors: Check browser DevTools

## Success Indicators

After setup, you should be able to:

✓ Start the app without errors
✓ See the home screen with search bar
✓ Create a new snippet
✓ Search for snippets
✓ Mark snippets as favorites
✓ Edit snippets
✓ Delete snippets
✓ Export snippets
✓ View Settings screen
✓ Data persists after app restart

## Ready to Go! 🚀

If everything above works, you're all set!

Start developing:
```bash
npm start
# Select your platform and start coding!
```

---

**Questions?** Check the documentation files or review the code in `src/` directory.

**Issues?** Restart with:
```bash
npm start --clear
```
