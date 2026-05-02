import { Controller, Post, Body } from '@nestjs/common';
import { RelayService, RefineStoryResponse } from './relay.service';
import { RefineStoryDto } from './dto/refine-story.dto';

@Controller('relay')
export class RelayController {
  constructor(private readonly relayService: RelayService) {}

  @Post('refine-story')
  async refineStory(@Body() refineStoryDto: RefineStoryDto): Promise<RefineStoryResponse> {
    return this.relayService.refineStory(refineStoryDto.text);
  }
}
