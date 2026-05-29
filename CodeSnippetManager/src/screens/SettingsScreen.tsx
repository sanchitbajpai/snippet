import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Button, TextInput } from '@components/index';
import { useSnippetStore } from '@stores/snippetStore';
import StorageService from '@services/storage/index';
import AIService from '@services/ai/index';
import DatabaseService from '@services/database/index';

type ThemeValue = 'auto' | 'light' | 'dark';

const themeOptions: Array<{ label: string; value: ThemeValue }> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const fontSizeOptions = [
  { label: 'Small (12)', value: '12' },
  { label: 'Medium (14)', value: '14' },
  { label: 'Large (16)', value: '16' },
  { label: 'Extra Large (18)', value: '18' },
];

const aiProviderOptions = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Claude', value: 'claude' },
];

export const SettingsScreen: React.FC = () => {
  const { settings, setSettings } = useSnippetStore();
  
  const [theme, setTheme] = useState(settings.theme);
  const [fontSize, setFontSize] = useState(settings.fontSize.toString());
  const [autoSave, setAutoSave] = useState(settings.autoSave);
  const [aiProvider, setAIProvider] = useState('openai');
  const [apiKey, setAPIKey] = useState('');
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const provider = await StorageService.getAIProvider();
      setAIProvider(provider);
      const key = await StorageService.getAPIKey();
      if (key) {
        setAPIKey('••••••••••••••••');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveMessage('');

    try {
      const newSettings = {
        theme: theme as 'light' | 'dark' | 'auto',
        fontSize: parseInt(fontSize),
        autoSave,
      };

      await setSettings(newSettings);
      setSaveMessage('Settings saved successfully!');

      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAPIKey = async () => {
    if (!apiKey || apiKey.includes('•')) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    setLoading(true);
    try {
      if (!AIService.isValidAPIKey(apiKey, aiProvider)) {
        Alert.alert('Error', `Invalid ${aiProvider} API key format`);
        return;
      }

      await StorageService.saveAPIKey(apiKey, aiProvider);
      await AIService.setCredentials(apiKey, aiProvider);

      setAPIKey('••••••••••••••••');
      Alert.alert('Success', 'API key saved securely!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all snippets and reset the app. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              await DatabaseService.clearAllData();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.optionRow}>
              {themeOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    theme === option.value ? styles.optionButtonActive : undefined,
                  ]}
                  onPress={() => setTheme(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      theme === option.value ? styles.optionTextActive : undefined,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Font Size</Text>
            <View style={styles.optionRow}>
              {fontSizeOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    fontSize === option.value ? styles.optionButtonActive : undefined,
                  ]}
                  onPress={() => setFontSize(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      fontSize === option.value ? styles.optionTextActive : undefined,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto Save</Text>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{ false: '#DDDDDD', true: '#2196F3' }}
              thumbColor={autoSave ? '#2196F3' : '#CCCCCC'}
            />
          </View>

          <Button
            title="Save Settings"
            onPress={handleSaveSettings}
            loading={loading}
            style={styles.button}
          />

          {saveMessage && (
            <Text style={styles.successMessage}>{saveMessage}</Text>
          )}
        </View>

        {/* AI Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Code Explanation</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>AI Provider</Text>
            <View style={styles.optionRow}>
              {aiProviderOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    aiProvider === option.value ? styles.optionButtonActive : undefined,
                  ]}
                  onPress={() => setAIProvider(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      aiProvider === option.value ? styles.optionTextActive : undefined,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            label="API Key"
            value={apiKey}
            onChangeText={setAPIKey}
            placeholder="Enter your API key"
            secureTextEntry={!showAPIKey}
          />

          <View style={styles.apiHelpContainer}>
            <Text style={styles.apiHelpText}>
              {aiProvider === 'openai'
                ? 'Get your OpenAI API key from https://platform.openai.com/api-keys'
                : 'Get your Claude API key from https://console.anthropic.com/'}
            </Text>
          </View>

          <Button
            title="Save API Key"
            onPress={handleSaveAPIKey}
            loading={loading}
            style={styles.button}
          />
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.dangerZone]}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <Text style={styles.warningText}>
            These actions will permanently delete your data.
          </Text>

          <Button
            title="Clear All Data"
            onPress={handleClearData}
            variant="danger"
            style={styles.button}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>Code Snippet Manager v1.0.0</Text>
          <Text style={styles.aboutSubtext}>
            A modern developer-focused mobile app for managing code snippets offline
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  optionRow: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  optionButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#1976D2',
  },
  button: {
    marginTop: 16,
  },
  successMessage: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  apiHelpContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  apiHelpText: {
    fontSize: 12,
    color: '#1976D2',
  },
  dangerZone: {
    borderLeftColor: '#FF4444',
  },
  warningText: {
    fontSize: 12,
    color: '#FF4444',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  aboutSubtext: {
    fontSize: 12,
    color: '#999999',
  },
});
