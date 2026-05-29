import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button, EmptyState } from '@components/index';
import FileService from '@services/index';
import { formatFileSize, formatDate } from '@utils/index';

interface FileItem {
  name: string;
  size: number;
  mtime: number;
}

export const FileManagerScreen: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExportedFiles();
  }, []);

  const loadExportedFiles = async () => {
    setLoading(true);
    try {
      const path = FileService.getExportsDirectory();
      setCurrentPath(path);
      const fileList = await FileService.listFilesInDirectory(path);
      setFiles(fileList as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = (name: string) => {
    Alert.alert('Delete File', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            if (currentPath) {
              await FileService.deleteFile(`${currentPath}${name}`);
              loadExportedFiles();
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete file');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderItem = ({ item }: { item: FileItem }) => (
    <View style={styles.fileItem}>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{item.name}</Text>
        <Text style={styles.fileDetails}>
          {formatFileSize(item.size)} • {formatDate(item.mtime)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteFile(item.name)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Exported Files</Text>
        <Button
          title="Refresh"
          onPress={loadExportedFiles}
          size="small"
        />
      </View>

      {files.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No exported files"
          description="Export snippets to see them here"
        />
      ) : (
        <FlatList
          data={files}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  listContent: {
    padding: 16,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#999999',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});
