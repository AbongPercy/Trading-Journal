# Trade Journal

A web app for logging trades, viewing them on a monthly calendar, and tracking
results monthly and yearly.

- **Frontend**: React + Vite (plain CSS, no Tailwind) in `frontend/`
- **Backend**: NestJS + TypeORM REST API in `backend/`
- **Database**: MySQL (runs locally as the Windows `MySQL80` service)

```
frontend/   React calendar UI (port 5173)
backend/    NestJS API (port 3000)
backend/.env  your MySQL credentials live here
```

---

## 1. Prerequisites (Windows)

- **Node.js** 18+ (tested on v24)
- **MySQL Server 8.x** installed and running as a Windows service
  (e.g. service name `MySQL80`). You must know the `root` password.

Check MySQL is running:

```powershell
Get-Service MySQL80
```

If the `mysql` command isn't on your PATH (it usually isn't), you can use the
full path, e.g.:

```
C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
```

---

## 2. Configure the database credentials

1. Copy the example file and edit it:

   ```
   copy backend\.env.example backend\.env
   ```

2. Open `backend\.env` and set your real MySQL credentials:

   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_root_password
   DB_NAME=trade_journal
   ```

   (`backend/.env` is already filled in with your credentials — just check it.)

## 3. Create the database

The app needs a database named `trade_journal`. Create it once:

```powershell
# using the mysql client from the backend folder:
cd backend
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database.sql
```

Or run the single line inside **MySQL Workbench**:

```sql
CREATE DATABASE IF NOT EXISTS trade_journal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 4. Run the migrations (creates the `trades` table)

Two ways — they do the same thing:

- **Automatic**: the backend runs migrations itself every time it starts
  (`migrationsRun: true` in `src/app.module.ts`), so `npm run start:dev` is enough.
- **Manual**, from `backend/`:

  ```powershell
  npm run migration:run
  ```

  Undo with `npm run migration:revert`.

The migration in `backend/src/migrations/` creates the `trades` table.
Look inside it to see the table structure, or describe it:

```sql
DESCRIBE trades;
```

---

## 5. Install dependencies

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

## 6. Run the app

Two terminals:

```powershell
# Terminal 1 - backend API (http://localhost:3000/api)
cd backend
npm run start:dev

# Terminal 2 - frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

In development the frontend runs on port 5173 and forwards every `/api` request
to the backend on port 3000 (see `frontend/vite.config.js`), so the browser
never hits CORS issues.

---

## What you can do

1. **Add a trade** — click the **+ New Trade** button (or the `+` inside any
   day box). The trade appears on the calendar as a **yellow "Open"** box.
2. **View a trade** — click its box to open the details modal.
3. **Close a trade** — while the trade is still open, enter the result amount
   (+ for a win, − for a loss) and an optional note. You get one confirmation:
   *"Cross check before you save because it can't be edited"* — after saving, the
   box turns green/red/gray and the result is permanently locked.
4. **Monthly stats** — the cards above the calendar update for whatever month
   you're viewing.
5. **Year view** — switch to it with the **Month / Year** toggle. The whole
   year is shown as 12 mini month-calendars (3 per row, 4 per column). Each
   trade is a colored dot (same green/red/gray/yellow rules). Click a dot for
   the trade details, click anywhere else on a month to jump into that month.
   The stat cards at the top are the year totals, and Prev/Next switch years.

### P&L color rules

| State | Text color |
| --- | --- |
| Positive P&L (win) | 🟢 green |
| Negative P&L (loss) | 🔴 red |
| P&L exactly 0 (break-even) | ⚪ gray |
| Trade still open | 🟡 yellow "Open" |

The trade box **background** stays neutral — only the text color changes.

---

## API reference

All endpoints are under `http://localhost:3000/api/trades`.

| Method & path | Purpose | Example body |
| --- | --- | --- |
| `GET /api/trades?month=2026-08` | List trades in a month | — |
| `GET /api/trades?year=2026` | List trades in a whole year | — |
| `GET /api/trades/stats?month=2026-08` | Monthly stats | — |
| `GET /api/trades/stats?year=2026` | Yearly stats | — |
| `POST /api/trades` | Create a trade (starts `open`) | see below |
| `PATCH /api/trades/:id/close` | Save a result (locks it forever) | `{ "pnlAmount": 45, "resultNote": "Target hit" }` |

Create body:

```json
{
  "date": "2026-08-12",
  "timeTaken": "09:30",
  "currencyPair": "EUR/USD",
  "direction": "buy",
  "lotSize": 0.5,
  "riskRewardRatio": "1:2",
  "reason": "Breakout retest"
}
```

> Closing the same trade twice returns HTTP 400 — the backend refuses to touch
> a `resultLocked` trade, so the lock doesn't depend on the frontend.

---

## Project structure (the short version)

```
backend/src/
  main.ts                    app bootstrap (prefix, CORS, validation)
  app.module.ts              wiring: config + MySQL connection
  trades/
    trade.entity.ts          the Trade class = the "trades" table
    trades.service.ts        business logic (create/close/stats)
    trades.controller.ts     the REST endpoints
    dto/                     request body validation rules
  migrations/                SQL that creates tables
  data-source.ts             used by the migration CLI

frontend/src/
  App.jsx                    screen state + what's shown
  api.js                     all fetch() calls to the backend
  constants.js               currency pairs, time slots, ratio presets
  calendarUtils.js           calendar math shared by both views
  components/
    Calendar.jsx             builds the month grid
    DayCell.jsx              one square (one day)
    TradeBox.jsx             one small box per trade (the colors)
    YearDashboard.jsx        the full-year view (12 mini months, 3x4)
    MonthStats.jsx           the stat cards
    NewTradeModal.jsx        the "log a trade" form
    TradeDetailsModal.jsx    details + closing a trade
    ConfirmDialog.jsx        "can't be edited" warning
  style.css                  all styling
```

---

## Removing the demo/test trades

The database contains 4 sample trades I created while testing. To start clean:

```powershell
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "DELETE FROM trade_journal.trades; ALTER TABLE trade_journal.trades AUTO_INCREMENT = 1;"
```

(The table itself is recreated automatically by the migration if you ever drop it.)
