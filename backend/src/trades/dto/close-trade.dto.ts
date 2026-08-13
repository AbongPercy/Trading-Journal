import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Fields sent when closing a trade and saving its result.
 */
export class CloseTradeDto {
  // Profit or loss in dollars. Positive = win, negative = loss, 0 = break-even.
  @IsNumber()
  pnlAmount: number;

  // Optional note explaining the outcome
  @IsOptional()
  @IsString()
  resultNote?: string;
}
