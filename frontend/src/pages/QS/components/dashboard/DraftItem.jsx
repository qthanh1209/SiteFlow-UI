import Icon from '../../../../components/ui/Icon'

/* Một bản nháp trong thẻ dự án; active = bản đang làm việc */
export default function DraftItem({ draft, active, onUse }) {
  const meta = `${draft.code} · ${draft.date}`
  return (
    <div className={`qs-dash-draft${active ? ' active' : ''}`}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="qs-dash-draft-name">{draft.name}</div>
        <div className="qs-dash-draft-meta" title={meta}>{meta}</div>
      </div>
      {active
        ? <span className="qs-dash-using"><Icon name="check" size={13} stroke={2.4} />Đang dùng</span>
        : <button className="qs-dash-use-btn" onClick={onUse}>Dùng</button>}
    </div>
  )
}
