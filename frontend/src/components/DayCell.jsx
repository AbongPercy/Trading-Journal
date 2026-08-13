import TradeBox from './TradeBox.jsx';

/**
 * One square in the calendar grid (one day).
 * Shows the date number on top, a "+" button to add a trade on that day,
 * and one TradeBox per trade taken that day.
 */
export default function DayCell({ cell, trades, onAddTrade, onSelectTrade }) {
  return (
    <div className="calendar-day">
      <div className="calendar-day-header">
        <span className="date-num">{cell.dateNum}</span>
        <button
          className="add-trade-btn"
          title="Add trade on this day"
          onClick={() => onAddTrade(cell.dateString)}
        >
          +
        </button>
      </div>

      <div className="trade-boxes">
        {trades.map((trade) => (
          <TradeBox key={trade.id} trade={trade} onClick={() => onSelectTrade(trade)} />
        ))}
      </div>
    </div>
  );
}
