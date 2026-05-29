import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Snippet } from '@app-types/index';
import { truncateText, getLanguageIcon, formatTimeAgo } from '@utils/index';

interface SnippetCardProps {
  snippet: Snippet;
  onPress: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  onPress,
  onLongPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.container, style]}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{getLanguageIcon(snippet.language)}</Text>
          <View style={styles.titleContent}>
            <Text style={styles.title} numberOfLines={1}>
              {snippet.title}
            </Text>
            <Text style={styles.language}>{snippet.language}</Text>
          </View>
        </View>
        {snippet.isFavorite && <Text style={styles.favorite}>⭐</Text>}
      </View>

      <Text style={styles.code} numberOfLines={2}>
        {truncateText(snippet.code, 100)}
      </Text>

      {snippet.tags && snippet.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {snippet.tags.slice(0, 3).map((tag, index) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
          {snippet.tags.length > 3 && (
            <Text style={styles.tag}>+{snippet.tags.length - 3}</Text>
          )}
        </View>
      )}

      <Text style={styles.timestamp}>
        {formatTimeAgo(snippet.updatedAt)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  language: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  favorite: {
    fontSize: 18,
  },
  code: {
    fontSize: 12,
    color: '#555555',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
    fontFamily: 'Courier New',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  tag: {
    fontSize: 11,
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
  },
});
