import { Injectable, Logger } from '@nestjs/common';
import { GeminiConnector } from './gemini.connector';

@Injectable()
export class QuestionGeneratorService {
  private readonly logger = new Logger(QuestionGeneratorService.name);
  private readonly MODEL_NAME = 'gemini-pro'; // Ou outro modelo adequado

  constructor(private readonly geminiConnector: GeminiConnector) {}

  async generateQuestion(context: string): Promise<string> {
    this.logger.log(`Generating question for context`);
    // Esqueleto: Implementação futura para gerar perguntas
    const model = this.geminiConnector.getGenerativeModel(this.MODEL_NAME);
    const result = await model.generateContent(`Generate a question based on the following context: "${context}"`);
    const response = result.response;
    return response.text();
  }
}
