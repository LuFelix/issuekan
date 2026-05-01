import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RelayService {
  private readonly logger = new Logger(RelayService.name);

  constructor() {
    this.logger.log("RelayService initialized");
  }
}
