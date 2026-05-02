import { Controller, Post, Body, Logger } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { GithubService } from './github.service';

@Controller("webhooks/github")
export class GithubWebhookController {
  private readonly logger = new Logger(GithubWebhookController.name);

  constructor(private readonly githubService: GithubService) {}

  @Public()
  @Post()
  async handleGithubWebhook(@Body() payload: any) {
    this.logger.log(`GitHub Webhook received. Action: ${payload.action}, Merged: ${payload.pull_request?.merged}, Base Ref: ${payload.pull_request?.base?.ref}`);

    // Lógica de Filtro
    if (
      payload.action === 'closed' &&
      payload.pull_request?.merged === true &&
      payload.pull_request?.base?.ref === 'develop'
    ) {
      const headRef = payload.pull_request.head.ref;
      this.logger.log(`Pull Request merged into develop: ${headRef}`);

      // Extração da Issue usando Regex
      const issueNumberMatch = headRef.match(/(\d+)-/);
      if (issueNumberMatch && issueNumberMatch[1]) {
        const issueNumber = parseInt(issueNumberMatch[1], 10);
        this.logger.log(`Issue number extracted: ${issueNumber}`);
        // Ação Final
        await this.githubService.addLabelToIssue(issueNumber, 'QA');
        return { status: 'success', message: `Label 'QA' added to issue #${issueNumber}` };
      } else {
        this.logger.warn(`Could not extract issue number from branch name: ${headRef}`);
      }
    } else {
      this.logger.log('Ignoring GitHub webhook: conditions not met for adding QA label.');
    }

    return { status: 'ignored', message: 'GitHub webhook processed without action' };
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
