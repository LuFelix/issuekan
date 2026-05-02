import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Importar ConfigModule
import { RelayLink } from './entities/relay-link.entity';
import { RelayLog } from './entities/relay-log.entity';
import { TrelloWebhookController } from './trello-webhook.controller';
import { GithubWebhookController } from './github-webhook.controller';
import { IdeationController } from './ideation.controller';
import { RelayController } from './relay.controller';
import { RelayService } from './relay.service';
import { TrelloService } from './trello.service';
import { GithubService } from './github.service';
import { GeminiService } from './gemini.service';
import { GeminiConnector } from './services/gemini/gemini.connector';
import { CardClassifierService } from './services/gemini/card-classifier.service';
import { QuestionGeneratorService } from './services/gemini/question-generator.service';
import { AnswerCorrectorService } from './services/gemini/answer-corrector.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RelayLink, RelayLog]),
    ConfigModule, // Importar ConfigModule aqui
  ],
  providers: [
    RelayService,
    TrelloService,
    GithubService,
    GeminiService,
    GeminiConnector,
    CardClassifierService,
    QuestionGeneratorService,
    AnswerCorrectorService,
    DashboardService,
  ],
  controllers: [
    TrelloWebhookController,
    GithubWebhookController,
    IdeationController,
    RelayController,
    DashboardController,
  ],
  exports: [
    TypeOrmModule,
    RelayService,
    TrelloService,
    GithubService,
    GeminiService,
    GeminiConnector,
    CardClassifierService,
    QuestionGeneratorService,
    AnswerCorrectorService,
    DashboardService,
  ],
})
export class RelayModule {}
