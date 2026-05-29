import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { v4 as uuid } from 'uuid';
import { FileResource } from '@app-types/index';

/**
 * File management service for handling local file operations
 * Uses Expo FileSystem for file I/O operations
 */

class FileService {
  private readonly WEB_EXPORTS_KEY = 'codesnippetmanager.webExports';
  private readonly APP_DIRECTORY = Platform.OS === 'web'
    ? 'web://CodeSnippetManager/'
    : `${FileSystem.documentDirectory}CodeSnippetManager/`;
  private readonly ATTACHMENTS_DIRECTORY = `${this.APP_DIRECTORY}attachments/`;
  private readonly EXPORTS_DIRECTORY = `${this.APP_DIRECTORY}exports/`;
  private readonly TEMPLATES_DIRECTORY = `${this.APP_DIRECTORY}templates/`;

  /**
   * Initialize file system directories
   */
  async initialize(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        console.log('File system initialized successfully');
        return;
      }

      // Create app directories if they don't exist
      const appDirInfo = await FileSystem.getInfoAsync(this.APP_DIRECTORY);
      if (!appDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.APP_DIRECTORY, { intermediates: true });
      }

      // Create subdirectories
      await this.createDirectoryIfNeeded(this.ATTACHMENTS_DIRECTORY);
      await this.createDirectoryIfNeeded(this.EXPORTS_DIRECTORY);
      await this.createDirectoryIfNeeded(this.TEMPLATES_DIRECTORY);

      console.log('File system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize file system:', error);
      throw error;
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  private async createDirectoryIfNeeded(directory: string): Promise<void> {
    try {
      const info = await FileSystem.getInfoAsync(directory);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }
    } catch (error) {
      console.error(`Failed to create directory ${directory}:`, error);
    }
  }

  // ==================== ATTACHMENT OPERATIONS ====================

  /**
   * Save attachment (photo/file) to device
   */
  async saveAttachment(sourceUri: string, snippetId: string): Promise<FileResource> {
    try {
      const fileName = `${uuid()}_${Date.now()}.jpg`;

      if (Platform.OS === 'web') {
        return {
          id: uuid(),
          name: fileName,
          path: sourceUri,
          size: 0,
          type: 'image',
          createdAt: Date.now(),
          snippetId,
        };
      }

      const destinationUri = `${this.ATTACHMENTS_DIRECTORY}${fileName}`;

      // Copy file to app directory
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri,
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(destinationUri);
      const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size ?? 0 : 0;

      const fileResource: FileResource = {
        id: uuid(),
        name: fileName,
        path: destinationUri,
        size: fileSize,
        type: 'image',
        createdAt: Date.now(),
        snippetId,
      };

      return fileResource;
    } catch (error) {
      console.error('Failed to save attachment:', error);
      throw error;
    }
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(path: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        return;
      }

      await FileSystem.deleteAsync(path);
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      throw error;
    }
  }

  /**
   * Get all attachments for a snippet
   */
  async getAttachmentUri(path: string): Promise<string> {
    // Return the file URI for displaying
    return path;
  }

  // ==================== EXPORT OPERATIONS ====================

  /**
   * Export snippet as text file
   */
  async exportAsText(snippetTitle: string, code: string, metadata?: any): Promise<string> {
    try {
      let content = `# ${snippetTitle}\n\n`;

      if (metadata?.language) {
        content += `Language: ${metadata.language}\n`;
      }

      if (metadata?.tags && metadata.tags.length > 0) {
        content += `Tags: ${metadata.tags.join(', ')}\n`;
      }

      if (metadata?.description) {
        content += `Description: ${metadata.description}\n\n`;
      }

      content += `\`\`\`\n${code}\n\`\`\`\n`;
      content += `\nExported: ${new Date().toLocaleString()}\n`;

      const fileName = `${snippetTitle.replace(/\s+/g, '_')}_${Date.now()}.txt`;

      if (Platform.OS === 'web') {
        return this.saveWebExport(fileName, content, 'text/plain');
      }

      const filePath = `${this.EXPORTS_DIRECTORY}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, content);
      return filePath;
    } catch (error) {
      console.error('Failed to export as text:', error);
      throw error;
    }
  }

  /**
   * Export snippet as JavaScript file
   */
  async exportAsJavaScript(code: string, metadata?: any): Promise<string> {
    try {
      let content = code;

      // Wrap in module export if needed
      if (!content.includes('module.exports') && !content.includes('export')) {
        content = `${content}\n\nmodule.exports = { /* your code */ };`;
      }

      const fileName = `snippet_${Date.now()}.js`;

      if (Platform.OS === 'web') {
        return this.saveWebExport(fileName, content, 'text/javascript');
      }

      const filePath = `${this.EXPORTS_DIRECTORY}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, content);
      return filePath;
    } catch (error) {
      console.error('Failed to export as JavaScript:', error);
      throw error;
    }
  }

  /**
   * Export snippet as JSON
   */
  async exportAsJSON(snippet: any, includeMetadata: boolean = true): Promise<string> {
    try {
      const exportData = includeMetadata ? snippet : { code: snippet.code };

      const content = JSON.stringify(exportData, null, 2);
      const fileName = `snippet_${Date.now()}.json`;

      if (Platform.OS === 'web') {
        return this.saveWebExport(fileName, content, 'application/json');
      }

      const filePath = `${this.EXPORTS_DIRECTORY}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, content);
      return filePath;
    } catch (error) {
      console.error('Failed to export as JSON:', error);
      throw error;
    }
  }

  /**
   * Export snippet as TypeScript file
   */
  async exportAsTypeScript(code: string): Promise<string> {
    try {
      const content = `// TypeScript Snippet\n\n${code}`;

      const fileName = `snippet_${Date.now()}.ts`;

      if (Platform.OS === 'web') {
        return this.saveWebExport(fileName, content, 'text/typescript');
      }

      const filePath = `${this.EXPORTS_DIRECTORY}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, content);
      return filePath;
    } catch (error) {
      console.error('Failed to export as TypeScript:', error);
      throw error;
    }
  }

  /**
   * Export snippet as Python file
   */
  async exportAsPython(code: string): Promise<string> {
    try {
      const content = `# Python Snippet\n\n${code}`;

      const fileName = `snippet_${Date.now()}.py`;

      if (Platform.OS === 'web') {
        return this.saveWebExport(fileName, content, 'text/x-python');
      }

      const filePath = `${this.EXPORTS_DIRECTORY}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, content);
      return filePath;
    } catch (error) {
      console.error('Failed to export as Python:', error);
      throw error;
    }
  }

  // ==================== SHARING OPERATIONS ====================

  /**
   * Share exported file
   */
  async shareFile(filePath: string, mimeType: string = 'text/plain'): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        this.downloadWebExport(filePath, mimeType);
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(filePath, {
        mimeType,
        dialogTitle: 'Share Snippet',
      });
    } catch (error) {
      console.error('Failed to share file:', error);
      throw error;
    }
  }

  /**
   * Share snippet as text
   */
  async shareAsText(title: string, code: string): Promise<void> {
    try {
      const content = `${title}\n\n${code}`;

      if (Platform.OS === 'web') {
        const filePath = this.saveWebExport(`share_${Date.now()}.txt`, content, 'text/plain');
        this.downloadWebExport(filePath, 'text/plain');
        return;
      }

      const tempFile = `${this.EXPORTS_DIRECTORY}share_${Date.now()}.txt`;

      await FileSystem.writeAsStringAsync(tempFile, content);
      await this.shareFile(tempFile, 'text/plain');

      // Clean up temp file
      setTimeout(() => {
        FileSystem.deleteAsync(tempFile).catch(e => console.log('Cleanup error:', e));
      }, 2000);
    } catch (error) {
      console.error('Failed to share as text:', error);
      throw error;
    }
  }

  // ==================== FILE OPERATIONS ====================

  /**
   * Pick a file from device
   */
  async pickFile(): Promise<DocumentPicker.DocumentPickerAsset | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error('Failed to pick file:', error);
      throw error;
    }
  }

  /**
   * Read file content
   */
  async readFile(uri: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        return this.getWebExport(uri)?.content ?? '';
      }

      return await FileSystem.readAsStringAsync(uri);
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  }

  /**
   * Copy file between folders
   */
  async copyFile(sourceUri: string, destinationDirectory: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        return sourceUri;
      }

      const fileName = sourceUri.split('/').pop() || `file_${Date.now()}`;
      const destinationUri = `${destinationDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri,
      });

      return destinationUri;
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw error;
    }
  }

  /**
   * Move file to different directory
   */
  async moveFile(sourceUri: string, destinationDirectory: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        return sourceUri;
      }

      const fileName = sourceUri.split('/').pop() || `file_${Date.now()}`;
      const destinationUri = `${destinationDirectory}${fileName}`;

      await FileSystem.moveAsync({
        from: sourceUri,
        to: destinationUri,
      });

      return destinationUri;
    } catch (error) {
      console.error('Failed to move file:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(uri: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        this.deleteWebExport(uri);
        return;
      }

      await FileSystem.deleteAsync(uri);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  /**
   * List files in directory
   */
  async listFilesInDirectory(directory: string): Promise<FileSystem.FileInfo[]> {
    try {
      if (Platform.OS === 'web') {
        return this.getWebExports().map(file => ({
          exists: true,
          uri: file.path,
          isDirectory: false,
          size: new Blob([file.content], { type: file.mimeType }).size,
          modificationTime: file.createdAt / 1000,
        })) as FileSystem.FileInfo[];
      }

      const files = await FileSystem.readDirectoryAsync(directory);
      const fileInfos: FileSystem.FileInfo[] = [];

      for (const file of files) {
        const info = await FileSystem.getInfoAsync(`${directory}${file}`);
        fileInfos.push(info);
      }

      return fileInfos;
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  /**
   * Get directory info
   */
  async getDirectoryInfo(directory: string) {
    try {
      if (Platform.OS === 'web') {
        return {
          exists: true,
          uri: directory,
          isDirectory: true,
        };
      }

      const info = await FileSystem.getInfoAsync(directory);
      return info;
    } catch (error) {
      console.error('Failed to get directory info:', error);
      return null;
    }
  }

  // ==================== DIRECTORY ACCESSORS ====================

  getAppDirectory(): string {
    return this.APP_DIRECTORY;
  }

  getAttachmentsDirectory(): string {
    return this.ATTACHMENTS_DIRECTORY;
  }

  getExportsDirectory(): string {
    return this.EXPORTS_DIRECTORY;
  }

  getTemplatesDirectory(): string {
    return this.TEMPLATES_DIRECTORY;
  }

  private saveWebExport(fileName: string, content: string, mimeType: string): string {
    const path = `${this.EXPORTS_DIRECTORY}${fileName}`;
    const exports = this.getWebExports().filter(file => file.path !== path);
    exports.push({ path, fileName, content, mimeType, createdAt: Date.now() });
    window.localStorage.setItem(this.WEB_EXPORTS_KEY, JSON.stringify(exports));
    return path;
  }

  private downloadWebExport(filePath: string, fallbackMimeType: string): void {
    const file = this.getWebExport(filePath);
    if (!file) {
      throw new Error('Exported file not found');
    }

    const blob = new Blob([file.content], { type: file.mimeType || fallbackMimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private getWebExport(filePath: string) {
    return this.getWebExports().find(file => file.path === filePath);
  }

  private deleteWebExport(filePath: string): void {
    const exports = this.getWebExports().filter(file => file.path !== filePath);
    window.localStorage.setItem(this.WEB_EXPORTS_KEY, JSON.stringify(exports));
  }

  private getWebExports(): Array<{
    path: string;
    fileName: string;
    content: string;
    mimeType: string;
    createdAt: number;
  }> {
    const stored = window.localStorage.getItem(this.WEB_EXPORTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

export default new FileService();
