import axios from 'axios';

export class OllamaIntegration {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OPENAI_COMPATIBLE_BASE_URL || 'http://localhost:11434/v1';
    this.model = process.env.OPENAI_COMPATIBLE_MODEL_NAMES?.split(',')[0] || 'llama3.1';
  }

  async generateAction(message: string): Promise<{ text: string; action?: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an Instagram assistant. Analyze the incoming message and provide a helpful response. If an action is required (e.g., "send message"), format your response clearly.'
          },
          {
            role: 'user',
            content: `New Instagram message: "${message}". How should I respond?`
          }
        ]
      });

      const text = response.data.choices[0].message.content;
      return { text };
    } catch (error) {
      console.error('Error calling Ollama:', error);
      return { text: 'Sorry, I am having trouble thinking right now.' };
    }
  }
}
