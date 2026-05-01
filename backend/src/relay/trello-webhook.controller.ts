import { Controller, Post, Body, Logger } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller("webhooks/trello")
export class TrelloWebhookController {
  private readonly logger = new Logger(TrelloWebhookController.name);

  @Public()
  @Post()
  handleTrelloWebhook(@Body() payload: any) {
    this.logger.log(`Trello Webhook received: ${JSON.stringify(payload)}`);
    return { status: 'received', message: 'Trello webhook processed' };
  }
}
