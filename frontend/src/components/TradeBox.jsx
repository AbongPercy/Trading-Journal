/**
 * One small box inside a day cell, representing a single trade.
 *
 * Color rules:
 * - Open trade  -> yellow tinted box, yellow "Open" text
 * - Closed win  -> neutral box, GREEN text (+$45)
 * - Closed loss -> neutral box, RED text (-$20)
 * - Break-even  -> neutral box, GRAY text ($0.00)
 * The box background itself stays neutral for closed trades.
 */
export default function TradeBox({ trade, onClick }) {
  const pnl = trade.pnlAmount; // null while the trade is open
  const isOpen = trade.status === 'open';

  let pnlClass;
  if (isOpen || pnl === null) {
    pnlClass = 'pnl-open';
  } else if (pnl > 0) {
    pnlClass = 'pnl-win';
  } else if (pnl < 0) {
    pnlClass = 'pnl-loss';
  } else {
    pnlClass = 'pnl-even';
  }

  return (
    <button
      className={`trade-box ${isOpen ? 'trade-open' : ''}`}
      onClick={onClick}
      title={trade.currency_pair}
    >
      <span className={`pnl-text ${pnlClass}`}>
        {isOpen ? 'Open' : formatPnl(pnl)}
      </span>
    </button>
  );
}

// "+$45.00", "-$20.00" or "$0.00"
function formatPnl(pnl) {
  const sign = pnl > 0 ? '+' : '';
  return `${sign}$${Number(pnl).toFixed(2)}`;
}
