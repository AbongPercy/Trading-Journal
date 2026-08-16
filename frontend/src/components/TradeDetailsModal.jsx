import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog.jsx';

/**
 * Shows all the details of one trade.
 *
 * - If the trade is OPEN: shows a form to enter the result
 *   (pnlAmount + resultNote). Saving opens a confirmation dialog first,
 *   because a saved result is permanent (resultLocked on the backend).
 * - If the trade is CLOSED: just shows the saved result. No edit controls,
 *   since the result can never be changed.
 */
export default function TradeDetailsModal({ trade, onCloseResult, onDelete, onEdit, onClose }) {
  const [pnlAmount, setPnlAmount] = useState('');
  const [resultNote, setResultNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState('');

  const isOpen = trade.status === 'open';

  function openConfirm() {
    setError('');
    const amount = parseFloat(pnlAmount);
    if (Number.isNaN(amount)) {
      setError('Enter a result amount, e.g. 45 or -20.');
      return;
    }
    setConfirming(true);
  }

  // Only called after the user confirms the "can't be edited" dialog
  async function saveResult() {
    setSaving(true);
    setError('');
    try {
      await onCloseResult(trade.id, {
        pnlAmount: parseFloat(pnlAmount),
        resultNote: resultNote.trim() || undefined,
      });
      // App closes this modal and refreshes the calendar
    } catch (e) {
      setError(e.message);
      setSaving(false);
      setConfirming(false);
    }
  }

  // Only called after the user confirms the delete dialog
  async function confirmDelete() {
    setSaving(true);
    setError('');
    try {
      await onDelete(trade.id);
      // App closes this modal and refreshes the calendar
    } catch (e) {
      setError(e.message);
      setSaving(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Trade Details</h3>

        <div className="details-grid">
          <Detail label="Date" value={trade.date} />
          <Detail label="Time" value={trade.timeTaken} />
          <Detail label="Currency pair" value={trade.currencyPair} />
          <Detail label="Direction" value={capitalize(trade.direction)} />
          <Detail label="Lot size" value={trade.lotSize} />
          <Detail label="Risk:Reward" value={trade.riskRewardRatio} />
        </div>

        <div className="details-block">
          <span className="detail-label">Reason</span>
          <p className="detail-text">{trade.reason || '—'}</p>
        </div>

        {isOpen ? (
          // ---------- OPEN TRADE: enter the result ----------
          <>
            <div className="details-block">
              <span className="detail-label">Result amount (profit or loss $)</span>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 45 or -20"
                value={pnlAmount}
                onChange={(e) => setPnlAmount(e.target.value)}
              />
            </div>

            <div className="details-block">
              <span className="detail-label">Result note</span>
              <textarea
                rows="2"
                placeholder="What happened and why?"
                value={resultNote}
                onChange={(e) => setResultNote(e.target.value)}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button className="btn danger" onClick={() => setConfirmingDelete(true)} disabled={saving}>Delete</button>
              <button className="btn" onClick={onEdit} disabled={saving}>Edit</button>
              <button className="btn" onClick={onClose} disabled={saving}>Cancel</button>
              <button className="btn primary" onClick={openConfirm} disabled={saving}>
                {saving ? 'Saving…' : 'Save Result'}
              </button>
            </div>
          </>
        ) : (
          // ---------- CLOSED TRADE: result is locked, just display it ----------
          <>
            <div className="details-block">
              <span className="detail-label">Result</span>
              <p className={`detail-text pnl-big ${pnlClass(trade.pnlAmount)}`}>
                {formatPnl(trade.pnlAmount)}
              </p>
            </div>

            <div className="details-block">
              <span className="detail-label">Result note</span>
              <p className="detail-text">{trade.resultNote || '—'}</p>
            </div>

            <p className="locked-note">This result is locked and can no longer be edited.</p>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button className="btn danger" onClick={() => setConfirmingDelete(true)}>Delete</button>
              <button className="btn" onClick={onEdit}>Edit</button>
              <button className="btn primary" onClick={onClose}>Close</button>
            </div>
          </>
        )}

        {/* Confirmation shown right before saving an irreversible result */}
        {confirming && (
          <ConfirmDialog
            message="Cross check before you save because it can't be edited"
            onConfirm={saveResult}
            onCancel={() => setConfirming(false)}
          />
        )}

        {/* Confirmation shown right before deleting the trade forever */}
        {confirmingDelete && (
          <ConfirmDialog
            message="Delete this trade permanently? This cannot be undone."
            confirmLabel="Yes, Delete"
            onConfirm={confirmDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="detail-label">{label}</span>
      <div className="detail-value">{value}</div>
    </div>
  );
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatPnl(pnl) {
  if (pnl === null) return '—';
  const sign = pnl > 0 ? '+' : '';
  return `${sign}$${Number(pnl).toFixed(2)}`;
}

function pnlClass(pnl) {
  if (pnl > 0) return 'pnl-win';
  if (pnl < 0) return 'pnl-loss';
  return 'pnl-even';
}
