import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TrelloService {
  private readonly logger = new Logger(TrelloService.name);
  private trelloApiKey: string;
  private trelloToken: string;
  private trelloBoardId: string;

  constructor(private configService: ConfigService) {
    this.trelloApiKey = this.configService.get<string>('TRELLO_API_KEY')!;
    this.trelloToken = this.configService.get<string>('TRELLO_TOKEN')!;
    this.trelloBoardId = this.configService.get<string>('TRELLO_BOARD_ID')!;

    if (!this.trelloApiKey || !this.trelloToken || !this.trelloBoardId) {
      this.logger.error('Trello API keys or board ID not configured.');
      throw new Error('Trello API keys or board ID not configured.');
    }
    this.logger.log("TrelloService initialized");
  }

  private async getLists(): Promise<any[]> {
    const url = `https://api.trello.com/1/boards/${this.trelloBoardId}/lists`;
    try {
      const response = await axios.get(url, {
        params: {
          key: this.trelloApiKey,
          token: this.trelloToken,
        },
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to fetch Trello lists: ${error.message}`);
      throw new Error('Failed to fetch Trello lists');
    }
  }

  async createCard(name: string, description: string, listId?: string): Promise<any> {
    let targetListId = listId;

    if (!targetListId) {
      this.logger.log('List ID not provided, fetching first list from the board.');
      const lists = await this.getLists();
      if (lists && lists.length > 0) {
        targetListId = lists[0].id;
        this.logger.log(`Using first list ID: ${targetListId}`);
      } else {
        throw new Error('No lists found on Trello board.');
      }
    }

    const url = `https://api.trello.com/1/cards`;
    try {
      const response = await axios.post(url, null, {
        params: {
          key: this.trelloApiKey,
          token: this.trelloToken,
          idList: targetListId,
          name: name,
          desc: description,
        },
      });
      this.logger.log(`Card created in Trello: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to create Trello card: ${error.message}`);
      throw new Error('Failed to create Trello card');
    }
  }

  async getCardById(cardId: string): Promise<any> {
    const url = `https://api.trello.com/1/cards/${cardId}`;
    try {
      const response = await axios.get(url, {
        params: {
          key: this.trelloApiKey,
          token: this.trelloToken,
        },
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to fetch Trello card ${cardId}: ${error.message}`);
      return null;
    }
  }

  async getBacklogCards(): Promise<any[]> {
    try {
      const lists = await this.getLists();
      if (!lists || lists.length === 0) {
        this.logger.log("No lists found on Trello board. Returning empty array for backlog cards.");
        return [];
      }

      const backlogList = lists[0]; // Assume a primeira lista é o Backlog
      const url = `https://api.trello.com/1/lists/${backlogList.id}/cards`;
      const response = await axios.get(url, {
        params: {
          key: this.trelloApiKey,
          token: this.trelloToken,
        },
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to fetch backlog cards from Trello: ${error.message}`);
      return [];
    }
  }
}
