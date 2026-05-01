
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelayLink } from './entities/relay-link.entity';
import { TrelloService } from './trello.service';
import { GithubService } from './github.service';

export interface DashboardColumn {
  id: string;
  type: 'trello' | 'github';
  title: string;
  url: string;
  status?: string;
}

export interface DashboardData {
  Backlog: DashboardColumn[];
  Definition: DashboardColumn[];
  Development: DashboardColumn[];
  QA: DashboardColumn[];
  Done: DashboardColumn[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(RelayLink)
    private relayLinkRepository: Repository<RelayLink>,
    private trelloService: TrelloService,
    private githubService: GithubService,
  ) {}

  async getDashboardData(): Promise<DashboardData> {
    const relayLinks = await this.relayLinkRepository.find();
    const dashboardData: DashboardData = {
      Backlog: [],
      Definition: [],
      Development: [],
      QA: [],
      Done: [],
    };

    const columns = [
      dashboardData.Backlog,
      dashboardData.Definition,
      dashboardData.Development,
      dashboardData.QA,
      dashboardData.Done,
    ];

    let columnIndex = 0;

    for (const link of relayLinks) {
      // Fetch Trello Card Info
      const trelloCard = await this.trelloService.getCardById(link.trelloCardId);
      if (trelloCard) {
        columns[columnIndex % 5].push({
          id: trelloCard.id,
          type: 'trello',
          title: trelloCard.name,
          url: trelloCard.url,
          status: trelloCard.idList, // This can be mapped to column names later
        });
        columnIndex++;
      }

      // Fetch GitHub Issue Info
      const githubIssue = await this.githubService.getIssueById(link.githubIssueId);
      if (githubIssue) {
        columns[columnIndex % 5].push({
          id: githubIssue.id.toString(),
          type: 'github',
          title: githubIssue.title,
          url: githubIssue.html_url,
          status: githubIssue.state, // 'open' or 'closed'
        });
        columnIndex++;
      }
    }

    return dashboardData;
  }
}
