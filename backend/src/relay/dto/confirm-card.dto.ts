import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class ConfirmCardDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  userStory!: string;

  @IsArray()
  @IsNotEmpty()
  acceptanceCriteria!: string[];
}
