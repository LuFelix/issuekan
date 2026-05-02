import { Controller, Post, Body } from '@nestjs/common';
import { RelayService } from './relay.service';
import { RefineStoryDto } from './dto/refine-story.dto';

@Controller('relay')
export class RelayController {
  constructor(private readonly relayService: RelayService) {}

  @Post('refine-story')
  async refineStory(@Body() refineStoryDto: RefineStoryDto) {
    return this.relayService.refineStory(refineStoryDto.text);
  }
}
