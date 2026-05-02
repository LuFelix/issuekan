import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TrelloService } from './trello.service';

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

  constructor(private trelloService: TrelloService) {
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

  /**
   * Confirma um card refinado e o envia para o Trello
   * @param title - Título da história
   * @param userStory - User story completa
   * @param acceptanceCriteria - Array de critérios de aceitação
   * @returns Resposta do Trello com dados do card criado
   */
  async confirmCard(
    title: string,
    userStory: string,
    acceptanceCriteria: string[]
  ): Promise<any> {
    try {
      this.logger.log(`Confirming card: "${title}"`);

      // Formatar a descrição com todos os dados
      const criteria = acceptanceCriteria
        .map((criteria, index) => `${index + 1}. ${criteria}`)
        .join('\n');

      const description = `**User Story:**\n${userStory}\n\n**Critérios de Aceitação:**\n${criteria}`;

      // Criar o card no Trello (sem listar específica, usa a primeira lista que é o Backlog)
      const trelloCard = await this.trelloService.createCard(title, description);

      this.logger.log(`Card created in Trello: ${trelloCard.id}`);

      return {
        status: 'success',
        message: 'Card created and sent to Trello',
        trelloCardId: trelloCard.id,
        trelloCardUrl: trelloCard.url
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error confirming card: ${errorMessage}`, error instanceof Error ? error.stack : '');

      return {
        status: 'error',
        error: `Failed to confirm card: ${errorMessage}`
      };
    }
  }

  /**
   * Obtém refinamento técnico de um card usando Gemini
   * @param dto - Dados do card (trelloCardId, title, description)
   * @returns Objeto com refinamento técnico (techTitle, techDescription, tasks)
   */
  async getTechnicalRefinement(dto: any): Promise<any> {
    try {
      this.logger.log(`Getting technical refinement for card: "${dto.title}"`);

      if (!this.model) {
        return {
          status: 'error',
          error: 'Gemini model not initialized. GEMINI_API_KEY is missing.'
        };
      }

      // Prompt de sistema para agir como Arquiteto de Software Sênior
      const systemPrompt = `Você é um Arquiteto de Software Sênior com 15+ anos de experiência em arquitetura de sistemas.

Sua tarefa é analisar uma história de negócio (título e descrição) e traduzir para especificações técnicas detalhadas.

Analise o contexto de negócio e retorne ESTRITAMENTE um JSON válido com a seguinte estrutura:
{
  "techTitle": "Sugestão de título técnico que represente a implementação",
  "techDescription": "Descrição técnica detalhada com: requisitos não funcionais, padrões de arquitetura a usar, considerações de performance, segurança, escalabilidade e confiabilidade. Seja específico e técnico.",
  "tasks": [
    "Tarefa técnica 1 - implementação específica",
    "Tarefa técnica 2 - integração necessária",
    "Tarefa técnica 3 - testes e validações"
  ]
}

Requisitos:
- O JSON deve ser válido e sem aspas escapadas incorretamente
- As tasks devem ser acionáveis e técnicas
- Considere banco de dados, cache, APIs, segurança
- Retorne APENAS o JSON, sem explicações adicionais`;

      const response = await this.model.generateContent({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              },
              {
                text: `Analise a seguinte história de negócio e forneça o refinamento técnico:\n\nTítulo: ${dto.title}\n\nDescrição: ${dto.description}`
              }
            ]
          }
        ]
      });

      const responseText = response.response.text();
      this.logger.debug(`Gemini technical response: ${responseText}`);

      // Limpar markdown
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Parse JSON
      const technicalRefinement = JSON.parse(cleanedResponse);

      // Validar estrutura
      if (!technicalRefinement.techTitle || !technicalRefinement.techDescription || !Array.isArray(technicalRefinement.tasks)) {
        return {
          status: 'error',
          error: 'Invalid response structure from Gemini'
        };
      }

      this.logger.log(`Technical refinement generated: ${technicalRefinement.techTitle}`);

      return {
        status: 'success',
        data: technicalRefinement
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting technical refinement: ${errorMessage}`, error instanceof Error ? error.stack : '');

      return {
        status: 'error',
        error: `Failed to get technical refinement: ${errorMessage}`
      };
    }
  }
}
