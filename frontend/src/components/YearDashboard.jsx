import { buildMonthCells } from '../calendarUtils.js';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Single letters for the tiny weekday header row
const MINI_WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * The full-year dashboard: one small month card for each of the 12 months,
 * laid out 3 per row and 4 per column.
 *
 * - Click a trade dot -> open the trade's details.
 * - Click anywhere else on a month -> jump to that month in the Month view.
 */
export default function YearDashboard({ year, trades, onOpenMonth, onSelectTrade }) {
  // Group all of the year's trades by their date string so each mini day
  // can look up its own trades.
  const tradesByDate = {};
  for (const trade of trades) {
    (tradesByDate[trade.date] ||= []).push(trade);
  }

  return (
    <div className="year-grid">
      {MONTH_SHORT.map((name, index) => (
        <MonthCard
          key={name}
          month={index + 1}
          monthName={name}
          year={year}
          tradesByDate={tradesByDate}
          onOpenMonth={onOpenMonth}
          onSelectTrade={onSelectTrade}
        />
      ))}
    </div>
  );
}

/** One mini calendar for a single month. */
function MonthCard({ month, monthName, year, tradesByDate, onOpenMonth, onSelectTrade }) {
  const cells = buildMonthCells(year, month);

  return (
    <div className="month-card" onClick={() => onOpenMonth(year, month)}>
      <div className="month-card-header">
        {monthName} {String(year).slice(2)}
      </div>

      <div className="mini-weekdays">
        {MINI_WEEKDAYS.map((d, i) => (
          <div key={i} className="mini-weekday">{d}</div>
        ))}
      </div>

      <div className="mini-grid">
        {cells.map((cell, i) =>
          cell === null ? (
            <div key={`blank-${i}`} className="mini-day blank" />
          ) : (
            <MiniDay
              key={cell.dateString}
              cell={cell}
              trades={tradesByDate[cell.dateString] || []}
              onSelectTrade={onSelectTrade}
            />
          ),
        )}
      </div>
    </div>
  );
}

/** One tiny square (one day) inside a mini month. */
function MiniDay({ cell, trades, onSelectTrade }) {
  return (
    <div className="mini-day">
      <span className="mini-date">{cell.dateNum}</span>
      <div className="mini-dots">
        {trades.map((trade) => (
          <span
            key={trade.id}
            className={`mini-dot ${dotClass(trade)}`}
            title={dotTitle(trade)}
            onClick={(e) => {
              // Don't also trigger the "open this month" click
              e.stopPropagation();
              onSelectTrade(trade);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Same color rules as the big calendar, but applied to the dot background
function dotClass(trade) {
  if (trade.status === 'open') return 'mini-open';
  if (trade.pnlAmount > 0) return 'mini-win';
  if (trade.pnlAmount < 0) return 'mini-loss';
  return 'mini-even';
}

// Text shown when hovering over a dot
function dotTitle(trade) {
  const result = trade.status === 'open' ? 'Open' : formatPnl(trade.pnlAmount);
  return `${trade.currencyPair} ${trade.direction} · ${result}`;
}

function formatPnl(pnl) {
  const sign = pnl > 0 ? '+' : '';
  return `${sign}$${Number(pnl).toFixed(2)}`;
}
