import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSnippetStore } from '@stores/snippetStore';
import { SnippetCard, EmptyState, LoadingSpinner } from '@components/index';
import { Snippet } from '@app-types/index';

export const FavoritesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { favorites, isLoading, loadFavorites } = useSnippetStore();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });

    return unsubscribe;
  }, [navigation, loadFavorites]);

  const handleSnippetPress = (snippet: Snippet) => {
    navigation.navigate('SnippetDetails', { snippet });
  };

  const renderItem = ({ item }: { item: Snippet }) => (
    <SnippetCard
      snippet={item}
      onPress={() => handleSnippetPress(item)}
    />
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingSpinner message="Loading favorites..." />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No favorites yet"
          description="Mark snippets as favorites to see them here"
        />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  listContent: {
    paddingVertical: 8,
  },
});
