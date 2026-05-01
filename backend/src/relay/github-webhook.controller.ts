import { Controller, Post, Body, Logger } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { GithubService } from './github.service';

@Controller("webhooks/github")
export class GithubWebhookController {
  private readonly logger = new Logger(GithubWebhookController.name);

  constructor(private readonly githubService: GithubService) {}

  @Public()
  @Post()
  handleGithubWebhook(@Body() payload: any) {
    this.logger.log(`GitHub Webhook received: ${JSON.stringify(payload)}`);
    return { status: 'received', message: 'GitHub webhook processed' };
  }

  @Public()
  @Post('test-issue')
  async testIssue(
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('trelloCardId') trelloCardId: string,
  ) {
    this.logger.log(`Test Issue endpoint called with title: ${title}, trelloCardId: ${trelloCardId}`);
    try {
      const result = await this.githubService.createIssue(title, body, trelloCardId);
      return { status: 'success', message: 'GitHub issue created and linked', issue: result };
    } catch (error: any) {
      this.logger.error(`Error in test-issue endpoint: ${error.message}`);
      return { status: 'error', message: 'Failed to create GitHub issue', error: error.message };
    }
  }
}
