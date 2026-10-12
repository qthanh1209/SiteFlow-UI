import Icon from '../../../../components/ui/Icon'
import { draftTotals, formatVnd } from '../../../../data/qsDashboardData'

const fmtDateTime = iso => new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

/* Thanh biên lợi nhuận (giống cột Tiến độ của trang Quản lý dự án) */
function MarginBar({ margin }) {
  const pct = Math.max(0, Math.min(100, margin))
  return (
    <div className="qs-pl-margin">
      <div className="qs-pl-track">{pct > 0 && <div style={{ width: `${pct}%` }} />}</div>
      <span>{margin.toFixed(1)}%</span>
    </div>
  )
}

/* Một dòng dự án; mở ra thì hiện phiếu yêu cầu (nếu từ Kinh doanh) và các bản nháp.
   Nút "Dùng" ở dòng dự án chọn bản nháp mới nhất. */
export default function ProjectRow({ project, latest, totals, status, open, onToggle, activeDraftId, onUse, onAddDraft, onDelete, onDeleteDraft }) {
  const req = project.request
  const client = project.client
    ? (project.phone ? `${project.client} · ${project.phone}` : project.client)
    : '—'
  const renderUse = (draftId, using) => (using
    ? <span className="qs-pl-using"><Icon name="check" size={12} stroke={2.4} />Đang dùng</span>
    : <button className="qs-pl-use" onClick={e => { e.stopPropagation(); onUse(project.id, draftId) }}>Dùng</button>)

  return (
    <div className={`qs-pl-prow${open ? ' open' : ''}${activeDraftId ? ' active' : ''}`}>
      <div className="qs-pl-grid qs-pl-row" onClick={onToggle}>
        <span className="qs-pl-name">
          <Icon name="chevronDown" size={13} className="qs-pl-chev" />
          <span title={project.name}>{project.name}</span>
          {project.linked && <Icon name="link" size={12} className="qs-pl-linked" />}
          {req && <span className="qs-pl-badge">Từ Kinh doanh</span>}
        </span>
        <span className="qs-pl-cell muted" title={client}>{client}</span>
        <span className="qs-pl-cell">{project.drafts.length} bản</span>
        <span className="qs-pl-cell">{formatVnd(totals.sale)}</span>
        <MarginBar margin={totals.margin} />
        <span><span className={`qs-pl-pill ${status.tone}`}>{status.label}</span></span>
        <span className="qs-pl-act">
          {renderUse(latest.id, Boolean(activeDraftId))}
          <button className="qs-pl-del" title="Xoá dự án" onClick={e => { e.stopPropagation(); onDelete() }}><Icon name="trash" size={13} /></button>
        </span>
      </div>

      {open && (
        <div className="qs-pl-body">
          {req && (
            <div className="qs-pl-req">
              <Icon name="fileText" size={14} />
              <b>{req.title}</b>
              <span>
                {req.info} · Từ {req.sender}{req.senderDept ? ` · ${req.senderDept}` : ''}
                {req.requestedAt ? ` · Hẹn ${fmtDateTime(req.requestedAt)}` : ''}
                {req.assignee ? ` · Phụ trách: ${req.assignee}` : ''}
              </span>
            </div>
          )}
          {project.drafts.map(d => {
            const t = draftTotals(d)
            const using = d.id === activeDraftId
            return (
              <div key={d.id} className={`qs-pl-grid qs-pl-draft${using ? ' active' : ''}`}>
                <span className="qs-pl-dname">{d.name}</span>
                <span className="qs-pl-cell muted" title={d.code}>{d.code}</span>
                <span className="qs-pl-cell muted">{d.lines} dòng</span>
                <span className="qs-pl-cell">{formatVnd(t.sale)}</span>
                <MarginBar margin={t.margin} />
                <span className="qs-pl-cell muted">Tạo {d.date}</span>
                <span className="qs-pl-act">
                  {renderUse(d.id, using)}
                  {/* Dự án luôn giữ ít nhất một bản nháp */}
                  <button className="qs-pl-del" title={project.drafts.length > 1 ? 'Xoá bản nháp' : 'Dự án cần ít nhất một bản nháp'} disabled={project.drafts.length < 2} onClick={() => onDeleteDraft(d)}><Icon name="trash" size={13} /></button>
                </span>
              </div>
            )
          })}
          <button className="qs-bd-add-group qs-pl-add" onClick={() => onAddDraft(project.id)}><Icon name="plus" size={13} />Thêm bản nháp</button>
        </div>
      )}
    </div>
  )
}
