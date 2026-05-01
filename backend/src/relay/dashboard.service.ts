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
  description?: string;
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
    const [relayLinks, trelloBacklogCards, githubOpenIssues] = await Promise.all([
      this.relayLinkRepository.find(),
      this.trelloService.getBacklogCards(),
      this.githubService.getAllOpenIssuesForDashboard(),
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
      description: card.desc,
      url: card.shortUrl,
      status: "", // Trello backlog cards don\'t show status UUIDs
    }));

    // Populate Development with GitHub Open Issues
    dashboardData.Development = githubOpenIssues.map(issue => ({
      id: issue.id,
      type: issue.type as "github", // Assumindo que o tipo é sempre 'github'
      title: issue.title,
      description: issue.description,
      url: issue.url,
      status: issue.status,
    }));

    // Process existing RelayLinks (GitHub Issues and Trello Cards linked to issues)
    for (const link of relayLinks) {
      // Fetch GitHub Issue Info for linked items
      const githubIssue = await this.githubService.getIssueByNumber(link.githubIssueId);
      if (githubIssue) {
        const cardData: DashboardColumn = {
          id: githubIssue.id.toString(),
          type: "github",
          title: githubIssue.title,
          description: githubIssue.body,
          url: githubIssue.html_url,
          status: githubIssue.state,
          labels: githubIssue.labels?.map((label: { name: string }) => label.name) || [],
        };

        // Distribute based on the new logic
        if (cardData.status === "open" && !cardData.labels?.includes("QA")) {
          // Já populado com githubOpenIssues, ajustar lógica se necessário
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
