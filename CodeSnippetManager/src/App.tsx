import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import DatabaseService from '@services/database/index';
import StorageService from '@services/storage/index';
import FileService from '@services/index';
import AIService from '@services/ai/index';
import { useSnippetStore } from '@stores/snippetStore';
import { RootNavigator } from '@/navigation/RootNavigator';
import { LoadingSpinner } from '@components/index';

export default function App() {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { loadSettings } = useSnippetStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      console.log('Initializing database...');
      await DatabaseService.initialize();

      // Initialize file system
      console.log('Initializing file system...');
      await FileService.initialize();

      // Initialize AI service
      console.log('Initializing AI service...');
      await AIService.initialize();

      // Load settings from storage
      console.log('Loading settings...');
      await loadSettings();

      console.log('App initialized successfully!');
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize app';
      console.error('Initialization error:', errorMessage);
      setError(errorMessage);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Initialization Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <LoadingSpinner message="Initializing app..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <RootNavigator />
    </View>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF4444',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
