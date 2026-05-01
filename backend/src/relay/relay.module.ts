import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelayLink } from './entities/relay-link.entity';
import { RelayLog } from './entities/relay-log.entity';
import { TrelloWebhookController } from './trello-webhook.controller';
import { GithubWebhookController } from './github-webhook.controller';
import { IdeationController } from './ideation.controller';
import { RelayService } from './relay.service';
import { TrelloService } from './trello.service';
import { GithubService } from './github.service';
import { GeminiService } from './gemini.service';

@Module({
  imports: [TypeOrmModule.forFeature([RelayLink, RelayLog])],
  providers: [RelayService, TrelloService, GithubService, GeminiService],
  controllers: [TrelloWebhookController, GithubWebhookController, IdeationController],
  exports: [TypeOrmModule, RelayService, TrelloService, GithubService, GeminiService]
})
export class RelayModule {}
