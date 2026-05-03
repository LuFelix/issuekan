import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TrelloService } from './trello.service';
import { PROJECT_CONTEXT } from './constants/project-context.constant';
import { PO_LANG_SYSTEM_PROMPT, DEV_LANG_SYSTEM_PROMPT } from './constants/prompts.constant';

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

interface TechnicalRefinement {
  techTitle: string;
  branchSlug: string;
  techDescription: string;
  tasks: string[];
}

export interface GetTechnicalRefinementResponse {
  status: string;
  data?: TechnicalRefinement;
  error?: string;
}

@Injectable()
export class RelayService {
  private readonly logger = new Logger(RelayService.name);
  private genAI!: GoogleGenerativeAI;
  private model: any;
  private githubToken: string;
  private githubOwner = 'LuFelix';
  private githubRepo = 'issuekan';

  constructor(private trelloService: TrelloService, private configService: ConfigService) {
    this.logger.log("RelayService initialized");
    
    // Inicializar GitHub Token
    this.githubToken = this.configService.get<string>('GITHUB_TOKEN') || '';
    if (!this.githubToken) {
      this.logger.warn('GITHUB_TOKEN not found in environment variables');
    }
    
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

      // Prompt de sistema para agir como Product Owner Sênior com contexto global
      const systemPrompt = `[CONTEXTO GLOBAL DO PROJETO]
${PROJECT_CONTEXT}

[INSTRUÇÕES DA TAREFA]
${PO_LANG_SYSTEM_PROMPT}`;

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

      // Prompt de sistema para agir como Arquiteto de Software Sênior com contexto global
      const systemPrompt = `[CONTEXTO GLOBAL DO PROJETO]
${PROJECT_CONTEXT}

[INSTRUÇÕES DA TAREFA]
${DEV_LANG_SYSTEM_PROMPT.description}`;

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
      const technicalRefinement: TechnicalRefinement = JSON.parse(cleanedResponse);

      // Validar estrutura
      if (!technicalRefinement.techTitle || !technicalRefinement.branchSlug || !technicalRefinement.techDescription || !Array.isArray(technicalRefinement.tasks)) {
        return {
          status: 'error',
          error: 'Invalid response structure from Gemini. Missing required fields: techTitle, branchSlug, techDescription, or tasks.'
        } as GetTechnicalRefinementResponse;
      }

      // Validar se branchSlug está em inglês, minúsculas e separado por hífens
      const branchSlugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      if (!branchSlugPattern.test(technicalRefinement.branchSlug)) {
        this.logger.warn(`branchSlug '${technicalRefinement.branchSlug}' does not match pattern. It should be lowercase with hyphens.`);
      }

      this.logger.log(`Technical refinement generated: ${technicalRefinement.techTitle}`);

      return {
        status: 'success',
        data: technicalRefinement
      } as GetTechnicalRefinementResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting technical refinement: ${errorMessage}`, error instanceof Error ? error.stack : '');

      return {
        status: 'error',
        error: `Failed to get technical refinement: ${errorMessage}`
      } as GetTechnicalRefinementResponse;
    }
  }

  /**
   * Cria uma Issue no GitHub a partir dos dados da especificação técnica
   * @param dto - DTO com trelloCardId, title e body
   * @returns Objeto com status, issueNumber e url
   */
  async createGithubIssue(dto: any): Promise<any> {
    try {
      this.logger.log(`Creating GitHub issue: "${dto.title}"`);

      if (!this.githubToken) {
        return {
          status: 'error',
          error: 'GitHub token not configured. GITHUB_TOKEN is missing.'
        };
      }

      // Adicionar rodapé de rastreabilidade
      const bodyWithReference = `${dto.body}\n\n---\n> **Trello Reference ID:** ${dto.trelloCardId}`;

      // Criar Issue no GitHub
      const githubUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/issues`;
      
      const response = await axios.post(
        githubUrl,
        {
          title: dto.title,
          body: bodyWithReference,
          labels: ['relay', 'automated']
        },
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.log(`GitHub issue created: #${response.data.number}`);

      // Obter ID da lista 'Doing' no Trello
      const doingListId = await this.trelloService.getListIdByName('Doing');

      // Mover o card do Trello para a lista 'Doing'
      await this.trelloService.moveCard(dto.trelloCardId, doingListId);
      this.logger.log(`Trello card ${dto.trelloCardId} moved to Doing list`);

      return {
        status: 'success',
        issueNumber: response.data.number,
        url: response.data.html_url,
        message: `Issue #${response.data.number} created and card moved to Doing`
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error instanceof Error ? error.message : String(error);
      this.logger.error(`Error creating GitHub issue: ${errorMessage}`, error instanceof Error ? error.stack : '');

      return {
        status: 'error',
        error: `Failed to create GitHub issue: ${errorMessage}`
      };
    }
  }
}
