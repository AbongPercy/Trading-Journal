import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Min,
} from 'class-validator';

/**
 * Fields required to create a new trade.
 * class-validator checks these automatically on every POST /api/trades.
 */
export class CreateTradeDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'timeTaken must be in HH:MM format',
  })
  timeTaken: string;

  @IsString()
  @IsNotEmpty()
  currencyPair: string;

  @IsIn(['buy', 'sell'])
  direction: 'buy' | 'sell';

  @IsNumber()
  @Min(0)
  lotSize: number;

  @IsString()
  @IsNotEmpty()
  riskRewardRatio: string;

  @IsString()
  reason: string;
}
