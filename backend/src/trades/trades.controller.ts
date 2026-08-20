import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { CloseTradeDto } from './dto/close-trade.dto';

/**
 * REST endpoints for trades. All are under /api/trades because of the
 * global "api" prefix set in main.ts.
 */
@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  // GET /api/trades?month=2026-08   OR   GET /api/trades?year=2026
  @Get()
  findAll(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (year) return this.tradesService.findAllByYear(year);
    return this.tradesService.findAllByMonth(month ?? currentMonth());
  }

  // GET /api/trades/stats?month=2026-08   OR   GET /api/trades/stats?year=2026
  @Get('stats')
  stats(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (year) return this.tradesService.yearlyStats(year);
    return this.tradesService.monthlyStats(month ?? currentMonth());
  }

  // POST /api/trades
  @Post()
  create(@Body() dto: CreateTradeDto) {
    return this.tradesService.create(dto);
  }

  // PATCH /api/trades/:id/close
  @Patch(':id/close')
  close(@Param('id', ParseIntPipe) id: number, @Body() dto: CloseTradeDto) {
    return this.tradesService.close(id, dto);
  }

  // PATCH /api/trades/:id  (edits the trade details, never the result)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTradeDto) {
    return this.tradesService.update(id, dto);
  }

  // PATCH /api/trades/:id/hide — soft-deletes a trade
  @Patch(':id/hide')
  hide(@Param('id', ParseIntPipe) id: number) {
    return this.tradesService.hide(id);
  }
}

/** "2026-08" style string for the current month, used as a fallback. */
function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
