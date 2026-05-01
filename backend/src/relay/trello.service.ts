import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TrelloService {
  private readonly logger = new Logger(TrelloService.name);

  constructor() {
    this.logger.log("TrelloService initialized");
  }
}
