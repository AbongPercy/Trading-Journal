/**
 * The three key metrics shown ABOVE the calendar toolbar: profit factor,
 * best trade and worst trade. Works for both the month and year views.
 */
export function TopStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-wrap">
      <div className="stats-bar">
        <Stat
          label="Profit Factor"
          value={stats.profitFactor === null ? '—' : Number(stats.profitFactor).toFixed(2)}
        />
        <Stat
          label="Best Trade"
          value={stats.bestTrade === null ? '—' : formatPnl(stats.bestTrade)}
          accent={stats.bestTrade > 0 ? 'win' : 'even'}
        />
        <Stat
          label="Worst Trade"
          value={stats.worstTrade === null ? '—' : formatPnl(stats.worstTrade)}
          accent={stats.worstTrade < 0 ? 'loss' : 'even'}
        />
      </div>
    </div>
  );
}

/**
 * A row of small stat cards shown below the calendar toolbar for the month
 * that is currently being viewed. Also used for the Year view, where
 * a title (the year) can be passed in.
 */
export default function MonthStats({ stats, title }) {
  if (!stats) return null;

  return (
    <div className="stats-wrap">
      {title && <h3 className="stats-title">{title}</h3>}
      <div className="stats-bar">
        <Stat label="Total Trades" value={stats.totalTrades} />
        <Stat label="Wins" value={stats.wins} accent="win" />
        <Stat label="Losses" value={stats.losses} accent="loss" />
        <Stat label="Total P&L" value={formatPnl(stats.totalPnl)} accent={pnlAccent(stats.totalPnl)} />
        <Stat label="Win Rate" value={`${stats.winRate}%`} />
      </div>
    </div>
  );
}

function Stat({ label, value, accent = '' }) {
  return (
    <div className={`stat-card ${accent ? `stat-${accent}` : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function formatPnl(pnl) {
  const sign = pnl > 0 ? '+' : '';
  return `${sign}$${Number(pnl).toFixed(2)}`;
}

function pnlAccent(pnl) {
  if (pnl > 0) return 'win';
  if (pnl < 0) return 'loss';
  return 'even';
}
