import { Controller, Post, Body, Logger } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller("relay/ideation")
export class IdeationController {
  private readonly logger = new Logger(IdeationController.name);

  @Public()
  @Post()
  handleIdeationRequest(@Body() payload: any) {
    this.logger.log(`Ideation request received: ${JSON.stringify(payload)}`);
    return { status: 'received', message: 'Ideation request processed' };
  }
}
