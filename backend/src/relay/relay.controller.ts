import { Controller, Post, Body } from '@nestjs/common';
import { RelayService, RefineStoryResponse } from './relay.service';
import { RefineStoryDto } from './dto/refine-story.dto';
import { ConfirmCardDto } from './dto/confirm-card.dto';

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
}
