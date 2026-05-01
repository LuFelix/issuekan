import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor() {
    this.logger.log("GithubService initialized");
  }
}
