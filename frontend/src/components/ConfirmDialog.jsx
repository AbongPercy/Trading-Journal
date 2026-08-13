/**
 * Simple "are you sure?" dialog. Used before saving a trade result,
 * because once saved the result can never be edited again.
 */
export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={onConfirm}>Yes, Save It</button>
        </div>
      </div>
    </div>
  );
}
