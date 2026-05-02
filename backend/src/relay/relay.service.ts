import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface RefinedStory {
  title: string;
  userStory: string;
  acceptanceCriteria: string[];
}

export interface RefineStoryResponse {
  status: string;
  data?: RefinedStory;
  error?: string;
}

@Injectable()
export class RelayService {
  private readonly logger = new Logger(RelayService.name);
  private genAI!: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.logger.log("RelayService initialized");
    
    // Inicializar Gemini com API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment variables');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  /**
   * Refina uma história em linguagem natural usando Gemini
   * @param text - Texto da história a ser refinada
   * @returns Objeto com status e dados refinados
   */
  async refineStory(text: string): Promise<RefineStoryResponse> {
    try {
      this.logger.log(`Refining story: "${text}"`);

      if (!this.model) {
        return {
          status: 'error',
          error: 'Gemini model not initialized. GEMINI_API_KEY is missing.'
        };
      }

      // Prompt de sistema para agir como Product Owner Sênior
      const systemPrompt = `Você é um Product Owner Sênior com 10+ anos de experiência.
Sua tarefa é refinar descrições de histórias de usuário em entrada natural para formato estruturado.

Analise a entrada do usuário e retorne OBRIGATORIAMENTE um JSON válido com a seguinte estrutura:
{
  "title": "Uma descrição clara e concisa da user story (máximo 100 caracteres)",
  "userStory": "Uma user story bem estruturada no formato: Como [ator], quero [ação], para que [benefício]",
  "acceptanceCriteria": [
    "Critério 1",
    "Critério 2",
    "Critério 3"
  ]
}

Requisitos:
- O JSON deve ser válido e sem aspas escapadas incorretamente
- A user story deve seguir o padrão INVEST
- Os critérios de aceitação devem ser testáveis e claros
- Retorne APENAS o JSON, sem explicações adicionais`;

      const response = await this.model.generateContent({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              },
              {
                text: `Refine a seguinte descrição de história:\n\n${text}`
              }
            ]
          }
        ]
      });

      const responseText = response.response.text();
      this.logger.debug(`Gemini raw response: ${responseText}`);

      // Limpar markdown (```json, ```)
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Tentar fazer parse do JSON
      const refinedStory: RefinedStory = JSON.parse(cleanedResponse);

      // Validar estrutura
      if (!refinedStory.title || !refinedStory.userStory || !Array.isArray(refinedStory.acceptanceCriteria)) {
        return {
          status: 'error',
          error: 'Invalid response structure from Gemini'
        };
      }

      this.logger.log(`Story refined successfully: ${refinedStory.title}`);

      return {
        status: 'success',
        data: refinedStory
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error refining story: ${errorMessage}`, error instanceof Error ? error.stack : '');

      return {
        status: 'error',
        error: `Failed to refine story: ${errorMessage}`
      };
    }
  }
}
