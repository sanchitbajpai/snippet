import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, TextInput } from '@components/index';
import { useSnippetStore } from '@stores/snippetStore';
import { Snippet } from '@app-types/index';
import { generateId, detectLanguage } from '@utils/index';

export const CreateSnippetScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const snippet = route.params?.snippet as Snippet | undefined;
  const isEditing = !!snippet;

  const [title, setTitle] = useState(snippet?.title || '');
  const [code, setCode] = useState(snippet?.code || '');
  const [language, setLanguage] = useState(snippet?.language || 'javascript');
  const [description, setDescription] = useState(snippet?.description || '');
  const [tags, setTags] = useState(snippet?.tags.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { createSnippet, updateSnippet } = useSnippetStore();

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Snippet' : 'Create Snippet',
    });
  }, [navigation, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!code.trim()) newErrors.code = 'Code is required';
    if (!language.trim()) newErrors.language = 'Language is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const parsedTags = tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);

      // Auto-detect language if not specified
      let finalLanguage = language;
      if (!finalLanguage || finalLanguage === 'javascript') {
        finalLanguage = detectLanguage(code);
      }

      if (isEditing) {
        await updateSnippet(snippet.id, {
          title: title.trim(),
          code: code.trim(),
          language: finalLanguage,
          description: description.trim(),
          tags: parsedTags,
        });

        Alert.alert('Success', 'Snippet updated successfully!');
      } else {
        await createSnippet({
          id: generateId(),
          title: title.trim(),
          code: code.trim(),
          language: finalLanguage,
          description: description.trim(),
          tags: parsedTags,
          isFavorite: false,
          attachments: [],
        });

        Alert.alert('Success', 'Snippet created successfully!');
      }

      navigation.goBack();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save snippet';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter snippet title"
            error={errors.title}
          />

          <TextInput
            label="Language"
            value={language}
            onChangeText={setLanguage}
            placeholder="e.g., javascript, python, java"
            error={errors.language}
          />

          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what this snippet does"
            multiline
            numberOfLines={3}
            style={{ textAlignVertical: 'top' }}
          />

          <TextInput
            label="Tags (comma-separated)"
            value={tags}
            onChangeText={setTags}
            placeholder="e.g., useful, async, react"
          />

          <TextInput
            label="Code"
            value={code}
            onChangeText={setCode}
            placeholder="Enter your code here"
            error={errors.code}
            multiline
            numberOfLines={12}
            style={{ textAlignVertical: 'top', fontFamily: 'Courier New' }}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.button}
            />

            <Button
              title={isEditing ? 'Update' : 'Create'}
              onPress={handleSave}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});
