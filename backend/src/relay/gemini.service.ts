import { Injectable, Logger } from '@nestjs/common';
import { CardClassifierService } from './services/gemini/card-classifier.service';
import { QuestionGeneratorService } from './services/gemini/question-generator.service';
import { AnswerCorrectorService } from './services/gemini/answer-corrector.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    private readonly cardClassifierService: CardClassifierService,
    private readonly questionGeneratorService: QuestionGeneratorService,
    private readonly answerCorrectorService: AnswerCorrectorService,
  ) {
    this.logger.log("GeminiService initialized");
  }

  async classifyCard(prompt: string) {
    return this.cardClassifierService.classifyCard(prompt);
  }

  async generateQuestion(context: string) {
    return this.questionGeneratorService.generateQuestion(context);
  }

  async correctAnswer(question: string, answer: string) {
    return this.answerCorrectorService.correctAnswer(question, answer);
  }
}
