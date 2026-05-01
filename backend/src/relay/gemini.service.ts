import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor() {
    this.logger.log("GeminiService initialized");
  }
}
