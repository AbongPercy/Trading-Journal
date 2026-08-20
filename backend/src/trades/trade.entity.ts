import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// MySQL stores DECIMAL columns as strings, so we convert them to real numbers
// when reading rows (and back to numbers when saving - "to" just passes through).
export const decimalTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | null): number | null =>
    value === null ? null : parseFloat(value),
};

/**
 * The "trades" table. Each row is one trade taken by the trader.
 *
 * Note: entity properties are camelCase (and that is what the API returns),
 * while the actual MySQL column names are snake_case (see the "name" options).
 */
@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  // The day the trade was taken, stored as YYYY-MM-DD
  @Column({ type: 'date', name: 'date' })
  date: string;

  // Time of day the trade was taken, e.g. "14:30"
  @Column({ type: 'varchar', length: 5, name: 'time_taken' })
  timeTaken: string;

  // e.g. "EUR/USD"
  @Column({ type: 'varchar', length: 20, name: 'currency_pair' })
  currencyPair: string;

  // "buy" or "sell"
  @Column({ type: 'varchar', length: 4 })
  direction: 'buy' | 'sell';

  // Position size in lots, e.g. 0.5
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'lot_size',
    transformer: decimalTransformer,
  })
  lotSize: number;

  // Stored as a string so custom ratios like "1:2.5" work too
  @Column({ type: 'varchar', length: 20, name: 'risk_reward_ratio' })
  riskRewardRatio: string;

  // The trader's written reason for taking the trade
  @Column({ type: 'text' })
  reason: string;

  // "open" while the result is unknown, "closed" once a result was saved
  @Column({ type: 'varchar', length: 10, default: 'open' })
  status: 'open' | 'closed';

  // Profit/loss in dollars. Positive = win, negative = loss, 0 = break-even.
  // null while the trade is still open.
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'pnl_amount',
    nullable: true,
    transformer: decimalTransformer,
  })
  pnlAmount: number | null;

  // Optional written note about the result, null until closed
  @Column({ type: 'text', name: 'result_note', nullable: true })
  resultNote: string | null;

  // Set to true the moment a result is saved. Once true, the result can
  // NEVER be changed - the backend rejects further updates.
  @Column({ type: 'boolean', name: 'result_locked', default: false })
  resultLocked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // When true, the trade is hidden from the calendar and stats but
  // the row is never physically deleted — useful for "soft delete".
  @Column({ type: 'boolean', default: false })
  hidden: boolean;
}
