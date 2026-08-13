import { useEffect, useMemo, useState } from 'react';
import Calendar from './components/Calendar.jsx';
import MonthStats from './components/MonthStats.jsx';
import YearDashboard from './components/YearDashboard.jsx';
import NewTradeModal from './components/NewTradeModal.jsx';
import TradeDetailsModal from './components/TradeDetailsModal.jsx';
import {
  fetchTrades,
  fetchStats,
  fetchTradesYear,
  fetchYearStats,
  createTrade,
  closeTrade,
} from './api.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function App() {
  const today = new Date();
  const [view, setView] = useState('month'); // 'month' or 'year'
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12

  // Data for the Month view
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);

  // Data for the Year view
  const [yearTrades, setYearTrades] = useState([]);
  const [yearStats, setYearStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [newTradeOpen, setNewTradeOpen] = useState(false);
  const [newTradeDefaultDate, setNewTradeDefaultDate] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);

  // "2026-08" - the month string used by the Month view API calls
  const monthKey = useMemo(
    () => `${year}-${String(month).padStart(2, '0')}`,
    [year, month],
  );

  // Load whichever data the current view needs, whenever it changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        if (view === 'month') {
          const [tradeList, monthStats] = await Promise.all([
            fetchTrades(monthKey),
            fetchStats(monthKey),
          ]);
          if (!cancelled) {
            setTrades(tradeList);
            setStats(monthStats);
          }
        } else {
          const [list, statsForYear] = await Promise.all([
            fetchTradesYear(year),
            fetchYearStats(year),
          ]);
          if (!cancelled) {
            setYearTrades(list);
            setYearStats(statsForYear);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [view, monthKey, year]);

  // Reload BOTH views' data (used after creating/closing a trade)
  async function refresh() {
    try {
      const [tradeList, monthStats] = await Promise.all([
        fetchTrades(monthKey),
        fetchStats(monthKey),
      ]);
      setTrades(tradeList);
      setStats(monthStats);

      const [list, statsForYear] = await Promise.all([
        fetchTradesYear(year),
        fetchYearStats(year),
      ]);
      setYearTrades(list);
      setYearStats(statsForYear);
    } catch (e) {
      setError(e.message);
    }
  }

  function changeMonth(delta) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setYear(y);
    setMonth(m);
  }

  function goToToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  }

  // Jump from the Year view into a specific month
  function openMonth(targetYear, targetMonth) {
    setYear(targetYear);
    setMonth(targetMonth);
    setView('month');
  }

  // Called by the New Trade form once it's valid
  async function handleCreateTrade(payload) {
    await createTrade(payload); // throws if the backend rejects it
    setNewTradeOpen(false);
    await refresh();
  }

  // Called by the details modal once the user confirmed the result
  async function handleCloseTrade(id, payload) {
    await closeTrade(id, payload); // throws if the result is locked
    setSelectedTrade(null);
    await refresh();
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <h1>Trade Journal</h1>
          <div className="view-toggle">
            <button
              className={view === 'month' ? 'btn toggle active' : 'btn toggle'}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button
              className={view === 'year' ? 'btn toggle active' : 'btn toggle'}
              onClick={() => setView('year')}
            >
              Year
            </button>
          </div>
        </div>
        <Legend />
      </header>

      {error && <div className="error-banner">{error}</div>}

      {view === 'month' ? (
        <>
          <div className="calendar-toolbar">
            <button className="btn" onClick={() => changeMonth(-1)}>&#8592; Prev</button>
            <h2 className="month-title">
              {MONTH_NAMES[month - 1]} {year}
            </h2>
            <button className="btn" onClick={() => changeMonth(1)}>Next &#8594;</button>
            <button className="btn" onClick={goToToday}>Today</button>
            <button
              className="btn primary new-trade-btn"
              onClick={() => {
                setNewTradeDefaultDate(null); // default to today
                setNewTradeOpen(true);
              }}
            >
              + New Trade
            </button>
          </div>

          {/* Stats sit directly above the days, like the year stats sit
              directly above the months */}
          <MonthStats stats={stats} />

          {loading ? (
            <p className="hint">Loading…</p>
          ) : (
            <Calendar
              year={year}
              month={month}
              trades={trades}
              onAddTrade={(dateString) => {
                setNewTradeDefaultDate(dateString); // pre-fill the chosen day
                setNewTradeOpen(true);
              }}
              onSelectTrade={setSelectedTrade}
            />
          )}
        </>
      ) : (
        <>
          <div className="calendar-toolbar">
            <button className="btn" onClick={() => setYear((y) => y - 1)}>&#8592; Prev Year</button>
            <h2 className="month-title">{year}</h2>
            <button className="btn" onClick={() => setYear((y) => y + 1)}>Next Year &#8594;</button>
            <button className="btn" onClick={goToToday}>Today</button>
            <button
              className="btn primary new-trade-btn"
              onClick={() => {
                setNewTradeDefaultDate(null);
                setNewTradeOpen(true);
              }}
            >
              + New Trade
            </button>
          </div>

          <MonthStats stats={yearStats} title={String(year)} />

          {loading ? (
            <p className="hint">Loading…</p>
          ) : (
            <YearDashboard
              year={year}
              trades={yearTrades}
              onOpenMonth={openMonth}
              onSelectTrade={setSelectedTrade}
            />
          )}
        </>
      )}

      {newTradeOpen && (
        <NewTradeModal
          defaultDate={newTradeDefaultDate}
          onSave={handleCreateTrade}
          onClose={() => setNewTradeOpen(false)}
        />
      )}

      {selectedTrade && (
        <TradeDetailsModal
          trade={selectedTrade}
          onCloseResult={handleCloseTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  );
}

// Small visual key explaining what each color means
function Legend() {
  return (
    <div className="legend">
      <span className="legend-item"><span className="dot dot-win" /> Win</span>
      <span className="legend-item"><span className="dot dot-loss" /> Loss</span>
      <span className="legend-item"><span className="dot dot-even" /> Break-even</span>
      <span className="legend-item"><span className="dot dot-open" /> Open</span>
    </div>
  );
}
