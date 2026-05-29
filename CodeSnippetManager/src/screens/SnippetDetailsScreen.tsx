import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Button } from '@components/index';
import { useSnippetStore } from '@stores/snippetStore';
import { Snippet, AIExplanation } from '@app-types/index';
import DatabaseService from '@services/database/index';
import FileService from '@services/index';
import AIService from '@services/ai/index';
import { formatDateTime, formatFileSize } from '@utils/index';
import { v4 as uuid } from 'uuid';

export const SnippetDetailsScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const snippet: Snippet = route.params.snippet;
  const [isFavorite, setIsFavorite] = useState(snippet.isFavorite);
  const [activeTab, setActiveTab] = useState<'code' | 'ai' | 'files'>('code');
  const [aiExplanations, setAIExplanations] = useState<AIExplanation[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);

  const { toggleFavorite, deleteSnippet } = useSnippetStore();

  useEffect(() => {
    loadAIExplanations();
  }, []);

  const loadAIExplanations = async () => {
    try {
      const explanations = await DatabaseService.getAIExplanations(snippet.id);
      setAIExplanations(explanations);
    } catch (error) {
      console.error('Failed to load AI explanations:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(snippet.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle favorite');
    }
  };

  const handleEdit = () => {
    navigation.navigate('CreateSnippet', { snippet });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Snippet',
      'Are you sure you want to delete this snippet? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteSnippet(snippet.id);
              Alert.alert('Success', 'Snippet deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete snippet');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${snippet.title}\n\n${snippet.code}`,
        title: snippet.title,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleExport = async (format: 'txt' | 'json' | 'js') => {
    try {
      let filePath = '';
      switch (format) {
        case 'txt':
          filePath = await FileService.exportAsText(
            snippet.title,
            snippet.code,
            { language: snippet.language, tags: snippet.tags, description: snippet.description }
          );
          break;
        case 'json':
          filePath = await FileService.exportAsJSON(snippet, true);
          break;
        case 'js':
          filePath = await FileService.exportAsJavaScript(snippet.code);
          break;
      }

      await FileService.shareFile(filePath);
    } catch (error) {
      Alert.alert('Error', 'Failed to export snippet');
    }
  };

  const generateAIExplanation = async (type: 'explanation' | 'summary' | 'improvement') => {
    setLoadingAI(true);
    setAIError(null);

    try {
      if (!AIService.isConfigured()) {
        setAIError('AI provider not configured. Please set up in Settings.');
        setLoadingAI(false);
        return;
      }

      let response;
      switch (type) {
        case 'explanation':
          response = await AIService.explainCode(snippet.code, snippet.language);
          break;
        case 'summary':
          response = await AIService.summarizeCode(snippet.code, snippet.language);
          break;
        case 'improvement':
          response = await AIService.suggestImprovements(snippet.code, snippet.language);
          break;
      }

      const explanation: AIExplanation = {
        id: uuid(),
        snippetId: snippet.id,
        type,
        content: response.text,
        generatedAt: Date.now(),
        aiProvider: response.provider,
      };

      await DatabaseService.createAIExplanation(explanation);
      setAIExplanations([...aiExplanations, explanation]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI explanation';
      setAIError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{snippet.title}</Text>
          <Text style={styles.language}>{snippet.language}</Text>
        </View>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Text style={styles.favoriteIcon}>{isFavorite ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {/* Metadata */}
      <View style={styles.metadata}>
        <Text style={styles.metaText}>Created: {formatDateTime(snippet.createdAt)}</Text>
        {snippet.description && (
          <Text style={styles.description}>{snippet.description}</Text>
        )}
        {snippet.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {snippet.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['code', 'ai', 'files'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'code' && (
          <View>
            <Text style={styles.codeBlock}>{snippet.code}</Text>
            <View style={styles.actionButtons}>
              <Button
                title="Edit"
                onPress={handleEdit}
                size="small"
                style={styles.actionButton}
              />
              <Button
                title="Share"
                onPress={handleShare}
                variant="success"
                size="small"
                style={styles.actionButton}
              />
              <Button
                title="Export"
                onPress={() => {
                  Alert.alert('Export Format', 'Choose export format', [
                    { text: 'Text (.txt)', onPress: () => handleExport('txt') },
                    { text: 'JSON (.json)', onPress: () => handleExport('json') },
                    { text: 'JavaScript (.js)', onPress: () => handleExport('js') },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
                size="small"
                style={styles.actionButton}
              />
            </View>
          </View>
        )}

        {activeTab === 'ai' && (
          <View>
            {aiError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{aiError}</Text>
              </View>
            )}

            <View style={styles.aiButtons}>
              <Button
                title="📝 Explain"
                onPress={() => generateAIExplanation('explanation')}
                loading={loadingAI}
                size="small"
                style={styles.aiButton}
              />
              <Button
                title="📋 Summarize"
                onPress={() => generateAIExplanation('summary')}
                loading={loadingAI}
                size="small"
                style={styles.aiButton}
              />
              <Button
                title="💡 Improve"
                onPress={() => generateAIExplanation('improvement')}
                loading={loadingAI}
                size="small"
                style={styles.aiButton}
              />
            </View>

            {aiExplanations.length > 0 && (
              <View>
                <Text style={styles.explanationTitle}>AI Explanations</Text>
                {aiExplanations.map((explanation) => (
                  <View key={explanation.id} style={styles.explanationCard}>
                    <Text style={styles.explanationType}>
                      {explanation.type.charAt(0).toUpperCase() + explanation.type.slice(1)}
                    </Text>
                    <Text style={styles.explanationText}>{explanation.content}</Text>
                    <Text style={styles.explanationMeta}>
                      {explanation.aiProvider} • {formatDateTime(explanation.generatedAt)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'files' && (
          <View>
            <Text style={styles.noFilesText}>No attached files yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button
          title="Delete"
          onPress={handleDelete}
          variant="danger"
          style={styles.deleteButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  language: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  metadata: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  metaText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    fontSize: 12,
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2196F3',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  codeBlock: {
    backgroundColor: '#1E1E1E',
    color: '#D4D4D4',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'Courier New',
    fontSize: 12,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  aiButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  aiButton: {
    flex: 1,
    minWidth: '45%',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    marginTop: 12,
  },
  explanationCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  explanationType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  explanationMeta: {
    fontSize: 11,
    color: '#999999',
  },
  noFilesText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 14,
    paddingVertical: 32,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  deleteButton: {
    width: '100%',
  },
});
