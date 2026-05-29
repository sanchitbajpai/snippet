import StorageService from '@services/storage/index';

/**
 * AI integration service for generating code explanations
 * Supports multiple AI providers
 */

interface AIResponse {
  text: string;
  provider: string;
  tokensUsed?: number;
}

class AIService {
  private apiKey: string | null = null;
  private provider: string = 'openai';
  private openaiBaseUrl = 'https://api.openai.com/v1';
  private anthropicBaseUrl = 'https://api.anthropic.com/v1';

  /**
   * Initialize AI service with stored API key
   */
  async initialize(): Promise<void> {
    try {
      this.apiKey = await StorageService.getAPIKey();
      this.provider = await StorageService.getAIProvider();
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  /**
   * Set API key and provider
   */
  async setCredentials(apiKey: string, provider: string): Promise<void> {
    try {
      await StorageService.saveAPIKey(apiKey, provider);
      this.apiKey = apiKey;
      this.provider = provider;
    } catch (error) {
      console.error('Failed to set credentials:', error);
      throw error;
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate explanation for code snippet
   */
  async explainCode(code: string, language: string = 'javascript'): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('API key not configured. Please set up AI provider in settings.');
    }

    try {
      const prompt = `Please explain the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a clear, concise explanation of what this code does.`;

      if (this.provider === 'openai') {
        return await this.callOpenAI(prompt, 'explanation');
      } else if (this.provider === 'claude') {
        return await this.callAnthropic(prompt, 'explanation');
      } else {
        throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to explain code:', error);
      throw error;
    }
  }

  /**
   * Generate summary for code snippet
   */
  async summarizeCode(code: string, language: string = 'javascript'): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('API key not configured. Please set up AI provider in settings.');
    }

    try {
      const prompt = `Please provide a brief one-paragraph summary of this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

      if (this.provider === 'openai') {
        return await this.callOpenAI(prompt, 'summary');
      } else if (this.provider === 'claude') {
        return await this.callAnthropic(prompt, 'summary');
      } else {
        throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to summarize code:', error);
      throw error;
    }
  }

  /**
   * Generate improvement suggestions for code
   */
  async suggestImprovements(code: string, language: string = 'javascript'): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('API key not configured. Please set up AI provider in settings.');
    }

    try {
      const prompt = `Please suggest improvements and best practices for the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nFocus on:\n- Performance\n- Readability\n- Best practices\n- Potential bugs\n- Security concerns`;

      if (this.provider === 'openai') {
        return await this.callOpenAI(prompt, 'improvement');
      } else if (this.provider === 'claude') {
        return await this.callAnthropic(prompt, 'improvement');
      } else {
        throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to suggest improvements:', error);
      throw error;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, type: string): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful code assistant. Provide clear, concise, and accurate responses.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        provider: 'openai',
        tokensUsed: data.usage?.total_tokens,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(prompt: string, type: string): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.anthropicBaseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          system: 'You are a helpful code assistant. Provide clear, concise, and accurate responses about code.',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Anthropic API error: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();
      return {
        text: data.content[0].text,
        provider: 'claude',
        tokensUsed: data.usage?.output_tokens,
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  /**
   * Get configured provider
   */
  getProvider(): string {
    return this.provider;
  }

  /**
   * Validate API key format
   */
  isValidAPIKey(apiKey: string, provider: string): boolean {
    if (provider === 'openai') {
      return apiKey.startsWith('sk-');
    } else if (provider === 'claude') {
      return apiKey.startsWith('sk-ant-');
    }
    return true;
  }
}

export default new AIService();
