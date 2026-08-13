import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Trade } from './trade.entity';
import { CreateTradeDto } from './dto/create-trade.dto';
import { CloseTradeDto } from './dto/close-trade.dto';

/**
 * All the business logic for trades lives here. The controller only
 * deals with HTTP - this service deals with data.
 */
@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private readonly trades: Repository<Trade>,
  ) {}

  /** Returns every trade whose date falls inside the given month (e.g. "2026-08"). */
  async findAllByMonth(month: string): Promise<Trade[]> {
    const { start, end } = monthRange(month);
    return this.findBetween(start, end);
  }

  /** Returns every trade whose date falls inside the given year (e.g. "2026"). */
  async findAllByYear(year: string): Promise<Trade[]> {
    const { start, end } = yearRange(year);
    return this.findBetween(start, end);
  }

  private findBetween(start: string, end: string): Promise<Trade[]> {
    return this.trades.find({
      where: { date: Between(start, end) },
      order: { date: 'ASC', timeTaken: 'ASC' },
    });
  }

  /** Creates a trade. It always starts out "open" with no result. */
  async create(dto: CreateTradeDto): Promise<Trade> {
    const trade = this.trades.create({
      ...dto,
      status: 'open',
      pnlAmount: null,
      resultNote: null,
      resultLocked: false,
    });
    return this.trades.save(trade);
  }

  /**
   * Closes a trade by saving its result. This is final:
   * once resultLocked is true the result can never be changed again.
   * We check the lock here on the backend, so the frontend is not the
   * only thing protecting the data.
   */
  async close(id: number, dto: CloseTradeDto): Promise<Trade> {
    const trade = await this.trades.findOneBy({ id });
    if (!trade) {
      throw new NotFoundException(`Trade ${id} not found`);
    }
    if (trade.resultLocked) {
      throw new BadRequestException(
        'This trade result is locked and can never be edited.',
      );
    }

    trade.pnlAmount = dto.pnlAmount;
    trade.resultNote = dto.resultNote ?? null;
    trade.status = 'closed';
    trade.resultLocked = true; // <- the result is now permanent

    return this.trades.save(trade);
  }

  /**
   * Computes summary numbers for a month, so the React app does not have
   * to calculate them. Everything is derived from pnlAmount's sign.
   */
  async monthlyStats(month: string) {
    const { start, end } = monthRange(month);
    return this.statsBetween(start, end);
  }

  async yearlyStats(year: string) {
    const { start, end } = yearRange(year);
    return this.statsBetween(start, end);
  }

  private async statsBetween(start: string, end: string) {
    const trades = await this.trades.find({ where: { date: Between(start, end) } });

    let wins = 0;
    let losses = 0;
    let open = 0;
    let totalPnl = 0;
    let rewardSum = 0;
    let rewardCount = 0;

    for (const trade of trades) {
      if (trade.status === 'open') {
        open += 1;
      } else if (trade.pnlAmount !== null) {
        totalPnl += trade.pnlAmount;
        if (trade.pnlAmount > 0) wins += 1;
        else if (trade.pnlAmount < 0) losses += 1;
        // pnlAmount === 0 counts as break-even: neither a win nor a loss
      }

      // Average risk-to-reward is easy if we grab the "reward" half of the ratio
      const reward = parseRewardPart(trade.riskRewardRatio);
      if (reward !== null) {
        rewardSum += reward;
        rewardCount += 1;
      }
    }

    const closed = wins + losses;
    const winRate = closed === 0 ? 0 : Math.round((wins / closed) * 1000) / 10;
    const avgRiskReward =
      rewardCount === 0 ? null : Math.round((rewardSum / rewardCount) * 100) / 100;

    return {
      totalTrades: trades.length,
      wins,
      losses,
      open,
      totalPnl: Math.round(totalPnl * 100) / 100,
      winRate,
      avgRiskReward,
    };
  }
}

/**
 * Turns "2026-08" (or "2026-8") into the inclusive first/last day strings
 * used to query the database, e.g. "2026-08-01" to "2026-08-31".
 */
function monthRange(month: string): { start: string; end: string } {
  const match = /^(\d{4})-(\d{1,2})$/.exec(month);
  if (!match) {
    throw new BadRequestException('month must be in YYYY-MM format');
  }
  const year = parseInt(match[1], 10);
  const monthNum = parseInt(match[2], 10);
  if (monthNum < 1 || monthNum > 12) {
    throw new BadRequestException('month must be between 01 and 12');
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const lastDay = new Date(year, monthNum, 0).getDate(); // last day of the month
  return {
    start: `${year}-${pad(monthNum)}-01`,
    end: `${year}-${pad(monthNum)}-${pad(lastDay)}`,
  };
}

/** "1:2.5" -> 2.5. Returns null if the ratio is not parseable. */
function parseRewardPart(ratio: string): number | null {
  const parts = ratio.split(':');
  if (parts.length !== 2) return null;
  const reward = parseFloat(parts[1]);
  return Number.isNaN(reward) ? null : reward;
}

/**
 * Turns "2026" into the inclusive first/last day strings for the whole year,
 * e.g. "2026-01-01" to "2026-12-31".
 */
function yearRange(year: string): { start: string; end: string } {
  const match = /^(\d{4})$/.exec(year);
  if (!match) {
    throw new BadRequestException('year must be 4 digits, e.g. 2026');
  }
  return {
    start: `${match[1]}-01-01`,
    end: `${match[1]}-12-31`,
  };
}
