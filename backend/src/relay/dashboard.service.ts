
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RelayLink } from "./entities/relay-link.entity";
import { TrelloService } from "./trello.service";
import { GithubService } from "./github.service";

export interface DashboardColumn {
  id: string;
  type: "trello" | "github";
  title: string;
  url: string;
  status?: string;
  labels?: string[]; // Adicionado labels para o GitHub Issue
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
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(RelayLink)
    private relayLinkRepository: Repository<RelayLink>,
    private trelloService: TrelloService,
    private githubService: GithubService,
  ) {}

  async getDashboardData(): Promise<DashboardData> {
    const [relayLinks, trelloBacklogCards] = await Promise.all([
      this.relayLinkRepository.find(),
      this.trelloService.getBacklogCards(),
    ]);

    const dashboardData: DashboardData = {
      Backlog: [],
      Definition: [],
      Development: [],
      QA: [],
      Done: [],
    };

    // Populate Backlog with real Trello cards
    dashboardData.Backlog = trelloBacklogCards.map((card) => ({
      id: card.id,
      type: "trello",
      title: card.name,
      url: card.shortUrl,
      status: card.idList,
    }));

    // Process existing RelayLinks (GitHub Issues and Trello Cards linked to issues)
    for (const link of relayLinks) {
      // Fetch GitHub Issue Info for linked items
      const githubIssue = await this.githubService.getIssueById(link.githubIssueId);
      if (githubIssue) {
        const cardData: DashboardColumn = {
          id: githubIssue.id.toString(),
          type: "github",
          title: githubIssue.title,
          url: githubIssue.html_url,
          status: githubIssue.state,
          labels: githubIssue.labels?.map((label: { name: string }) => label.name) || [],
        };

        // Distribute based on the new logic
        if (cardData.status === "open" && !cardData.labels?.includes("QA")) {
          dashboardData.Development.push(cardData); // Assuming Definition/Development combined into Doing
        } else if (cardData.status === "open" && cardData.labels?.includes("QA")) {
          dashboardData.QA.push(cardData);
        } else if (cardData.status === "closed") {
          dashboardData.Done.push(cardData);
        }
      } else {
        // Handle cases where GitHub issue might have been deleted but RelayLink exists
        this.logger.warn(`GitHub Issue ${link.githubIssueId} linked to Trello Card ${link.trelloCardId} not found.`);
      }
    }

    return dashboardData;
  }
}
