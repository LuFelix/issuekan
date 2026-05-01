import { Injectable, Logger } from '@nestjs/common';
import { GeminiConnector } from './gemini.connector';

@Injectable()
export class CardClassifierService {
  private readonly logger = new Logger(CardClassifierService.name);
  private readonly MODEL_NAME = 'gemini-pro'; // Ou outro modelo adequado

  constructor(private readonly geminiConnector: GeminiConnector) {}

  async classifyCard(prompt: string): Promise<{ title: string; description: string }> {
    this.logger.log(`Classifying card for prompt: ${prompt}`);
    // Implementação da lógica para transformar o prompt em título e descrição
    // Exemplo de retorno (substituir pela chamada real à API Gemini):
    const model = this.geminiConnector.getGenerativeModel(this.MODEL_NAME);
    const result = await model.generateContent(`Given the following user prompt, create a concise title (max 10 words) and a detailed description for a Trello card. The output should be a JSON object with 'title' and 'description' fields. User prompt: "${prompt}"`);
    const response = result.response;
    const text = response.text();

    try {
      const parsedResult = JSON.parse(text);
      return { title: parsedResult.title, description: parsedResult.description };
    } catch (error: any) {
      this.logger.error(`Failed to parse Gemini response: ${text}`, error.stack);
      throw new Error('Failed to classify card from Gemini response');
    }
  }
}
