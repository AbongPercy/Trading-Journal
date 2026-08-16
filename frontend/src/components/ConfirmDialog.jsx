/**
 * Simple "are you sure?" dialog. Used before saving a trade result
 * and before deleting a trade.
 */
export default function ConfirmDialog({ message, confirmLabel = 'Yes, Save It', onConfirm, onCancel }) {
  return (
    <div className="modal-overlay confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
