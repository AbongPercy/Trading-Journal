import { useState } from 'react';
import {
  CURRENCY_GROUPS,
  DIRECTIONS,
  RISK_REWARD_OPTIONS,
  RISK_REWARD_OTHER,
  TIME_SLOTS,
} from '../constants.js';

/**
 * Modal form for logging a new trade. All fields are required.
 * Submits to the backend via the onSave callback provided by App.
 */
export default function NewTradeModal({ defaultDate, onSave, onClose }) {
  // Today's date in the user's local timezone (YYYY-MM-DD),
  // used when no specific day was clicked.
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const [form, setForm] = useState({
    date: defaultDate || todayString,
    timeTaken: '09:00',
    currencyPair: '',
    direction: 'Buy',
    lotSize: '',
    riskRewardRatio: '1:2',
    customRatio: '',
    reason: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isCustomRatio = form.riskRewardRatio === RISK_REWARD_OTHER;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    // Build the final ratio string (either a preset or the custom "Other" value)
    let riskRewardRatio = form.riskRewardRatio;
    if (isCustomRatio) {
      const custom = form.customRatio.trim();
      if (!/^\d+(\.\d+)?:\d+(\.\d+)?$/.test(custom)) {
        setError('Custom risk:reward must look like "1:2.5"');
        return;
      }
      riskRewardRatio = custom;
    }

    const lotSize = parseFloat(form.lotSize);
    if (!form.currencyPair || !form.reason.trim()) {
      setError('Currency pair and reason are required.');
      return;
    }
    if (Number.isNaN(lotSize) || lotSize <= 0) {
      setError('Enter a valid lot size (a positive number).');
      return;
    }

    const payload = {
      date: form.date,
      timeTaken: form.timeTaken,
      currencyPair: form.currencyPair,
      direction: form.direction.toLowerCase(),
      lotSize,
      riskRewardRatio,
      reason: form.reason.trim(),
    };

    setSaving(true);
    try {
      await onSave(payload); // App calls the API and closes the modal on success
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>New Trade</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                required
              />
            </label>

            <label>
              Time taken
              <select value={form.timeTaken} onChange={(e) => update('timeTaken', e.target.value)}>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Currency pair
            <select value={form.currencyPair} onChange={(e) => update('currencyPair', e.target.value)} required>
              <option value="" disabled>Select a pair…</option>
              {CURRENCY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.pairs.map((pair) => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label>
              Buy or Sell
              <select value={form.direction} onChange={(e) => update('direction', e.target.value)}>
                {DIRECTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>

            <label>
              Lot size
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 0.50"
                value={form.lotSize}
                onChange={(e) => update('lotSize', e.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Risk-to-reward ratio
            <select
              value={form.riskRewardRatio}
              onChange={(e) => update('riskRewardRatio', e.target.value)}
            >
              {RISK_REWARD_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
              <option value={RISK_REWARD_OTHER}>{RISK_REWARD_OTHER}</option>
            </select>
          </label>

          {/* Only shown when "Other" is selected */}
          {isCustomRatio && (
            <label>
              Custom ratio (e.g. 1:2.5)
              <input
                type="text"
                placeholder="1:2.5"
                value={form.customRatio}
                onChange={(e) => update('customRatio', e.target.value)}
              />
            </label>
          )}

          <label>
            Reason for the trade
            <textarea
              rows="3"
              placeholder="Why are you taking this trade?"
              value={form.reason}
              onChange={(e) => update('reason', e.target.value)}
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : 'Log Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
