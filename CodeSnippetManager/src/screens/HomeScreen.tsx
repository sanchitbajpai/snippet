import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput as RNTextInput,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useSnippetStore } from '@stores/snippetStore';
import { SnippetCard, EmptyState, LoadingSpinner } from '@components/index';
import { Snippet } from '@app-types/index';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');

  const {
    snippets,
    searchResults,
    isLoading,
    loadAllSnippets,
    searchSnippets,
  } = useSnippetStore();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAllSnippets();
    });

    return unsubscribe;
  }, [navigation, loadAllSnippets]);

  const displaySnippets = searchActive ? searchResults : snippets;

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim()) {
      searchSnippets(text);
    }
  };

  const handleSnippetPress = (snippet: Snippet) => {
    navigation.navigate('SnippetDetails', { snippet });
  };

  const handleCreateSnippet = () => {
    navigation.navigate('CreateSnippet');
  };

  const renderItem = ({ item }: { item: Snippet }) => (
    <SnippetCard
      snippet={item}
      onPress={() => handleSnippetPress(item)}
      onLongPress={() => {
        Alert.alert('Snippet Actions', 'Choose an action', [
          { text: 'Edit', onPress: () => navigation.navigate('CreateSnippet', { snippet: item }) },
          { text: 'Delete', onPress: () => {}, style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }}
    />
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <RNTextInput
          style={styles.searchInput}
          placeholder="Search snippets..."
          value={searchText}
          onChangeText={handleSearch}
          onFocus={() => setSearchActive(true)}
          onBlur={() => !searchText && setSearchActive(false)}
          placeholderTextColor="#999999"
        />
        {searchActive && (
          <TouchableOpacity onPress={() => {
            setSearchActive(false);
            setSearchText('');
          }}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner message="Loading snippets..." />
      ) : displaySnippets.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No snippets yet"
          description="Create your first snippet to get started!"
        />
      ) : (
        <FlatList
          data={displaySnippets}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateSnippet}
        activeOpacity={0.7}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    fontSize: 14,
  },
  cancelButton: {
    marginLeft: 12,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
