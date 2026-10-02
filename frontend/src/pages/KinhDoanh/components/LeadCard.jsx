import { stages, deptColors, deptShort } from '../../../data/kinhDoanhData'
import { stageAccent, formatValue, initials } from '../utils'

export default function LeadCard({ lead, compact = false, removeLead, changeStage, setDetailLead, onStartDrag, onEndDrag }) {
  const accent = stageAccent(lead.stage)
  const isLost = lead.stage === 'truot-thau'
  return (
    <article
      className={`lead-card ${compact ? 'compact' : ''}`}
      draggable
      onDragStart={event => { event.dataTransfer.setData('text/plain', lead.id); event.dataTransfer.effectAllowed = 'move'; onStartDrag?.(lead.id) }}
      onDragEnd={() => onEndDrag?.()}
      onClick={() => setDetailLead(lead.id)}
      style={{ borderLeft: compact ? `3px solid ${accent?.border || 'var(--sales)'}` : undefined, borderColor: accent?.border, background: isLost ? 'var(--danger-tint)' : undefined }}
    >
      {!compact && <div className="kd-card-top">
        <strong title={lead.name}>{lead.name}</strong>
        <button className="kd-icon-button delete" title="Xoá" onClick={event => { event.stopPropagation(); removeLead(lead.id) }}>×</button>
      </div>}
      {compact && <strong title={lead.name}>{lead.name}</strong>}
      <div className="kd-card-type" title={lead.type}>{lead.type}</div>
      {!compact && <div className="kd-card-tags">
        <span style={{ color: deptColors[lead.dept] }}>{deptShort[lead.dept]}</span>
        {accent && !isLost && <span className="kd-tag" style={{ color: accent.color, background: accent.bg }}>→ Dự án</span>}
        {['pending-qs', 'pending-handoff'].includes(lead.handoff?.status) && <span className="kd-tag pending">⏳ Chờ {lead.handoff.dept} xác nhận</span>}
        {lead.handoff?.status === 'self-quoted' && <span className="kd-tag">KD tự đề xuất</span>}
      </div>}
      {!compact && <div className="kd-card-assignees">
        {(lead.assignees || []).slice(0, 3).map(person => (
          <span className="kd-avatar" title={`${person.name}${person.role ? ` — ${person.role}` : ''}`} key={`${person.name}${person.role}`}>{initials(person.name)}</span>
        ))}
        {lead.assignees?.length > 3 && <span className="kd-avatar more">+{lead.assignees.length - 3}</span>}
        <button title="Thêm người phụ trách" onClick={event => { event.stopPropagation(); setDetailLead(lead.id) }}>+</button>
      </div>}
      <div className="kd-card-value">{formatValue(lead.value)}</div>
      {!compact && (
        <select value={lead.stage} onClick={event => event.stopPropagation()} onChange={event => changeStage(lead.id, event.target.value)}>
          {stages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      )}
    </article>
  )
}
