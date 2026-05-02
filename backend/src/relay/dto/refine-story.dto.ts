import { IsString, IsNotEmpty } from 'class-validator';

export class RefineStoryDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
