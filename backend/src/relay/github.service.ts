import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { RelayLink } from './entities/relay-link.entity';
import { RelayLog } from './entities/relay-log.entity';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(RelayLink)
    private relayLinkRepository: Repository<RelayLink>,
    @InjectRepository(RelayLog)
    private relayLogRepository: Repository<RelayLog>,
  ) {
    this.logger.log("GithubService initialized");
  }

  async createIssue(title: string, body: string, trelloCardId: string): Promise<any> {
    const githubToken = this.configService.get<string>('GITHUB_TOKEN');
    const githubOwner = this.configService.get<string>('GITHUB_OWNER');
    const githubRepo = this.configService.get<string>('GITHUB_REPO');

    if (!githubToken || !githubOwner || !githubRepo) {
      this.logger.error('GitHub credentials not found in .env');
      throw new Error('GitHub credentials not configured.');
    }

    try {
      const response = await axios.post(
        `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues`,
        { title, body },
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const githubIssueId = response.data.number;

      // Update RelayLink
      let relayLink = await this.relayLinkRepository.findOne({ where: { trelloCardId } });
      if (relayLink) {
        relayLink.githubIssueId = githubIssueId.toString();
        await this.relayLinkRepository.save(relayLink);
        this.logger.log(`RelayLink updated for Trello card ${trelloCardId} with GitHub Issue ID ${githubIssueId}`);
      } else {
        this.logger.warn(`RelayLink not found for Trello card ID: ${trelloCardId}. Creating new one.`);
        const newRelayLink = this.relayLinkRepository.create({
          trelloCardId,
          githubIssueId: githubIssueId.toString(),
        });
        await this.relayLinkRepository.save(newRelayLink);
      }

      // Create RelayLog entry
      const relayLog = this.relayLogRepository.create({
        event: 'GitHub Issue Created',
        payload: {
          title: title,
          body: body,
          githubIssueId: githubIssueId.toString(),
        },
        trelloCardId: trelloCardId,
        githubIssueId: githubIssueId.toString(),
      });
      await this.relayLogRepository.save(relayLog);
      this.logger.log(`RelayLog entry created for GitHub Issue ${githubIssueId}`);

      return response.data;
    } catch (error: any) {
      this.logger.error(`Error creating GitHub issue: ${error.message}`);
      throw error;
    }
  }

  async getIssueById(issueNumber: string): Promise<any> {
    const githubToken = this.configService.get<string>("GITHUB_TOKEN");
    const githubOwner = this.configService.get<string>("GITHUB_OWNER");
    const githubRepo = this.configService.get<string>("GITHUB_REPO");

    if (!githubToken || !githubOwner || !githubRepo) {
      this.logger.error("GitHub credentials not found in .env");
      throw new Error("GitHub credentials not configured.");
    }

    try {
      const response = await axios.get(
        `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues/${issueNumber}`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching GitHub issue ${issueNumber}: ${error.message}`);
      return null;
    }
  }
}
