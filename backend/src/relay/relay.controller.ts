import { Controller, Post, Body } from '@nestjs/common';
import { RelayService, RefineStoryResponse } from './relay.service';
import { RefineStoryDto } from './dto/refine-story.dto';
import { ConfirmCardDto } from './dto/confirm-card.dto';
import { TechnicalRefinementDto } from './dto/technical-refinement.dto';
import { CreateGithubIssueDto } from './dto/create-github-issue.dto';

@Controller('relay')
export class RelayController {
  constructor(private readonly relayService: RelayService) {}

  @Post('refine-story')
  async refineStory(@Body() refineStoryDto: RefineStoryDto): Promise<RefineStoryResponse> {
    return this.relayService.refineStory(refineStoryDto.text);
  }

  @Post('confirm-card')
  async confirmCard(@Body() confirmCardDto: ConfirmCardDto): Promise<any> {
    return this.relayService.confirmCard(
      confirmCardDto.title,
      confirmCardDto.userStory,
      confirmCardDto.acceptanceCriteria
    );
  }

  @Post('technical-refinement')
  async getTechnicalRefinement(@Body() technicalRefinementDto: TechnicalRefinementDto): Promise<any> {
    return this.relayService.getTechnicalRefinement(technicalRefinementDto);
  }

  @Post('create-github-issue')
  async createGithubIssue(@Body() createGithubIssueDto: CreateGithubIssueDto): Promise<any> {
    return this.relayService.createGithubIssue(createGithubIssueDto);
  }
}
