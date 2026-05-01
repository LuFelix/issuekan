import { Controller, Post, Body, Logger } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller("webhooks/github")
export class GithubWebhookController {
  private readonly logger = new Logger(GithubWebhookController.name);

  @Public()
  @Post()
  handleGithubWebhook(@Body() payload: any) {
    this.logger.log(`GitHub Webhook received: ${JSON.stringify(payload)}`);
    return { status: 'received', message: 'GitHub webhook processed' };
  }
}
