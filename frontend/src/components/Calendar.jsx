import DayCell from './DayCell.jsx';
import { buildMonthCells } from '../calendarUtils.js';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Renders the monthly calendar grid.
 * - First row shows the weekday headers (Sun..Sat).
 * - Every following row is one week (7 day cells).
 * - Each day cell belongs to a single DayCell component.
 */
export default function Calendar({ year, month, trades, onAddTrade, onSelectTrade }) {
  // Group the trades by their date string so each day cell can look up its own
  const tradesByDate = {};
  for (const trade of trades) {
    (tradesByDate[trade.date] ||= []).push(trade);
  }

  const cells = buildMonthCells(year, month);

  return (
    <div className="calendar">
      <div className="calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="weekday">{label}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((cell, index) =>
          cell === null ? (
            // Blank cell: fills the space before the 1st and after the last day
            <div key={`blank-${index}`} className="calendar-day blank" />
          ) : (
            <DayCell
              key={cell.dateString}
              cell={cell}
              trades={tradesByDate[cell.dateString] || []}
              onAddTrade={onAddTrade}
              onSelectTrade={onSelectTrade}
            />
          ),
        )}
      </div>
    </div>
  );
}
