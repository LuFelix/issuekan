import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface GithubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
}

interface DashboardColumnData {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  status?: string;
  hasActiveBranch?: boolean;
}

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private githubToken: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.githubToken = this.configService.get<string>('GITHUB_TOKEN') || '';
    if (!this.githubToken) {
      this.logger.error('GITHUB_TOKEN não está configurado nas variáveis de ambiente.');
    } else {
      this.logger.debug(`GITHUB_TOKEN lido com sucesso (primeiros 4 caracteres): ${this.githubToken.substring(0, 4)}****`);
    }
  }

  private async getActiveBranches(): Promise<string[]> {
    const repoOwner = 'LuFelix';
    const repoName = 'issuekan';
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/branches`;

    try {
      this.logger.debug(`Buscando branches ativas do GitHub em: ${url}`);
      const response = await axios.get<any[]>(url, {
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      return response.data.map(b => b.name);
    } catch (error: any) {
      this.logger.error(`Erro ao buscar branches ativas do GitHub: ${(error as any).response?.data?.message || (error as any).message}`);
      return [];
    }
  }

  async getOpenIssues(): Promise<DashboardColumnData[]> {
    return [];
  }

  async createIssue(title: string, body: string, trelloCardId?: string): Promise<any> {
    const repoOwner = 'LuFelix';
    const repoName = 'issuekan';
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;

    let issueBody = body;
    if (trelloCardId) {
      issueBody += `\n\n--- \n**Trello Card ID:** ${trelloCardId}`;
    }

    try {
      const response = await axios.post(url, {
        title,
        body: issueBody,
      }, {
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      this.logger.log(`Issue do GitHub criada: ${response.data.html_url}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Erro ao criar issue do GitHub: ${(error as any).response?.data || (error as any).message}`);
      throw error;
    }
  }

  async getIssueByNumber(issueNumber: string): Promise<any> {
    const repoOwner = 'LuFelix';
    const repoName = 'issuekan';
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`;

    try {
      const activeBranches = await this.getActiveBranches();
      const response = await axios.get<GithubIssue>(url, {
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      const issue = response.data;
      const hasActiveBranch = activeBranches.some(branch => branch.includes(`/${issue.number}-`));
      return { ...issue, hasActiveBranch };
    } catch (error: any) {
      this.logger.error(`Erro ao buscar issue ${issueNumber} do GitHub: ${(error as any).response?.data || (error as any).message}`);
      return null;
    }
  }

  // Novo método para adicionar Label isolado corretamente
  async addLabelToIssue(issueNumber: number, label: string): Promise<void> {
    const repoOwner = 'LuFelix';
    const repoName = 'issuekan';
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}/labels`;

    try {
      await axios.post(url, { labels: [label] }, {
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      this.logger.log(`Label '${label}' adicionada à issue #${issueNumber} no GitHub.`);
    } catch (error: any) {
      this.logger.error(`Erro ao adicionar a label '${label}' à issue #${issueNumber}: ${(error as any).response?.data?.message || (error as any).message}`);
    }
  }

  // Método original mantido intacto
  async getAllOpenIssuesForDashboard(): Promise<DashboardColumnData[]> {
    const repoOwner = 'LuFelix';
    const repoName = 'issuekan';
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues?state=open`;

    try {
      const activeBranches = await this.getActiveBranches();

      // Definindo a interseção para que a tipagem suporte a propriedade labels
      const response = await axios.get<(GithubIssue & { labels: { name: string }[] })[]>(url, {
        headers: {
          Authorization: `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      return response.data.map(issue => {
        const isActive = activeBranches.some(branch => branch.includes(`/${issue.number}-`));

        // Verifica se existe alguma label com o nome 'QA'
        const hasQALabel = issue.labels.some(label => label.name === 'QA');
        const status = hasQALabel ? 'QA' : issue.state;

        return {
          id: String(issue.number),
          title: issue.title,
          description: issue.body || '',
          url: issue.html_url,
          type: 'github',
          status: status || undefined,
          hasActiveBranch: isActive,
        };
      });
    } catch (error: any) {
      this.logger.error(`Erro ao buscar issues do GitHub: ${(error as any).response?.data || (error as any).message}`);
      return [];
    }
  }
}