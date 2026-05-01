import { Controller, Post, Body, Logger, InternalServerErrorException } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { GeminiService } from './gemini.service';
import { TrelloService } from './trello.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelayLink } from './entities/relay-link.entity';
import { RelayLog } from './entities/relay-log.entity';

@Controller("relay/ideation")
export class IdeationController {
  private readonly logger = new Logger(IdeationController.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly trelloService: TrelloService,
    @InjectRepository(RelayLink)
    private relayLinkRepository: Repository<RelayLink>,
    @InjectRepository(RelayLog)
    private relayLogRepository: Repository<RelayLog>,
  ) {}

  @Public()
  @Post()
  async handleIdeationRequest(@Body() payload: { prompt: string }) {
    const { prompt } = payload;
    this.logger.log(`Ideation request received for prompt: ${prompt}`);

    let trelloCardId: string | undefined;
    let logStatus: string = 'FAILED';
    let logMessage: string = 'Unknown error';

    try {
      // 1. Gemini (Card Classifier)
      const { title, description } = await this.geminiService.classifyCard(prompt);
      this.logger.log(`Gemini classified card: Title - ${title}, Description - ${description}`);

      // 2. Trello (Create Card)
      const trelloCard = await this.trelloService.createCard(title, description);
      trelloCardId = trelloCard.id;
      this.logger.log(`Trello card created with ID: ${trelloCardId}`);

      // 3. Salvar o resultado (trelloCardId) na entidade RelayLink
      const relayLink = this.relayLinkRepository.create({ trelloCardId });
      await this.relayLinkRepository.save(relayLink);
      this.logger.log(`RelayLink created for trelloCardId: ${trelloCardId}`);

      logStatus = 'COMPLETED';
      logMessage = 'Ideation process completed successfully';

      return { status: 'success', trelloCardId, title, description };
    } catch (error: any) {
      this.logger.error(`Ideation process failed: ${error.message}`, error.stack);
      logMessage = `Ideation process failed: ${error.message}`;
      throw new InternalServerErrorException(logMessage);
    } finally {
      // Registrar a operação na entidade RelayLog
      const relayLog = this.relayLogRepository.create({
        event: 'IDEATION_REQUEST',
        payload: { prompt, trelloCardId, status: logStatus, message: logMessage },
        status: logStatus,
      });
      await this.relayLogRepository.save(relayLog);
    }
  }
}
