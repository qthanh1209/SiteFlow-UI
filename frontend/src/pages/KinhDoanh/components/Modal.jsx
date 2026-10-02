export default function Modal({ title, onClose, children, width = 640 }) {
  return (
    <div className="kd-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="kd-modal" style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
        <header className="kd-modal-head">
          <div><h2>{title}</h2></div>
          <button className="kd-icon-button" onClick={onClose} aria-label="Đóng">×</button>
        </header>
        {children}
      </section>
    </div>
  )
}
