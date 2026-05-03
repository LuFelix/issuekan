import { IsString, IsNotEmpty } from 'class-validator';

export class TechnicalRefinementDto {
  @IsString()
  @IsNotEmpty()
  trelloCardId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
