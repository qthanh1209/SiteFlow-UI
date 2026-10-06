import { Link } from 'react-router-dom'
import { MISSIONS, PRIO_LABEL } from '../../../data/banLamViecData'

const KPI_CARD = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '17px 20px', display: 'flex', flexDirection: 'column', gap: 8 }
const KPI_LABEL = { fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }
const KPI_NUM = { fontFamily: 'var(--blv-font)', fontWeight: 800, fontSize: 26 }
const KPI_SUB = { fontSize: 12, color: 'var(--text-muted)' }
const KPI_OF = { fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }

const CARD = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }
const STAT_BOX = { background: 'var(--surface-alt)', borderRadius: 10, padding: '12px 14px' }
const STAT_NUM = { fontFamily: 'var(--blv-font)', fontWeight: 800, fontSize: 18 }
const STAT_LABEL = { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }
const INFO_ROW = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,12 9,17 20,6" /></svg>
)

/* Tab "Tổng quan": KPI, nhiệm vụ, task hàng ngày & các thống kê cá nhân */
export default function OverviewTab({ tasks, onToggleTask, onAddTask }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={KPI_CARD}>
          <div style={KPI_LABEL}>Nhiệm vụ đang làm</div>
          <div style={KPI_NUM}>7</div>
          <div style={KPI_SUB}>2 việc sắp đến hạn</div>
        </div>
        <div style={KPI_CARD}>
          <div style={KPI_LABEL}>Hoàn thành tuần này</div>
          <div style={{ ...KPI_NUM, color: 'var(--success)' }}>12</div>
          <div style={KPI_SUB}>+3 so với tuần trước</div>
        </div>
        <div style={KPI_CARD}>
          <div style={KPI_LABEL}>Ngày công tháng này</div>
          <div style={{ ...KPI_NUM, color: 'var(--attendance)' }}>18<span style={KPI_OF}>/20</span></div>
          <div style={KPI_SUB}>1 lần đi trễ</div>
        </div>
        <div style={KPI_CARD}>
          <div style={KPI_LABEL}>Ngày phép còn lại</div>
          <div style={{ ...KPI_NUM, color: 'var(--finance)' }}>8<span style={KPI_OF}>/12</span></div>
          <div style={KPI_SUB}>Đã dùng 4 ngày</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, minHeight: 0 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>

          {/* Nhiệm vụ của tôi: tổng hợp nhiệm vụ từ các hạng mục khác, tích điểm đổi quà */}
          <div style={{ ...CARD, flex: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 700 }}>Nhiệm vụ của tôi</h3>
              <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}><span style={{ color: 'var(--finance)' }}>330</span><span style={{ color: 'var(--text-muted)', fontWeight: 600 }}> / 1.450 điểm</span></div>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '0 0 12px' }}>Tổng hợp nhiệm vụ bạn được giao &amp; tham gia từ các hạng mục khác — hoàn thành để tích điểm đổi quà.</p>
            <div className="blv-leave-bar-track" style={{ marginBottom: 14 }}><div className="blv-leave-bar-fill" style={{ width: '23%', background: 'var(--finance)' }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 14 }}>
              {MISSIONS.map(m => (
                <div key={m.title} className="blv-task-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="blv-task-title">{m.title}</div>
                    <div className="blv-task-meta">{m.meta}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--finance)', flex: 'none' }}>{m.points}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/gantt#nhiemvu-rewards" className="blv-add-btn" style={{ background: 'var(--finance)', textDecoration: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
                Đổi quà
              </Link>
              <Link to="/gantt#nhiemvu-mission" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>Xem tất cả tại Quản lý dự án ›</Link>
            </div>
          </div>

          {/* Task hàng ngày: ghi chú công việc cá nhân */}
          <div style={{ ...CARD, display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
            <div style={{ marginBottom: 6, flex: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 700 }}>Task hàng ngày</h3>
                <button className="blv-add-btn" onClick={onAddTask}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Thêm việc
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '4px 0 0' }}>Ghi chú &amp; việc cần làm cá nhân trong ngày — không tính điểm.</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {tasks.map(t => (
                <div key={t.id} className={`blv-task-row${t.done ? ' done' : ''}`}>
                  <div className={`blv-task-chk${t.done ? ' done' : ''}`} onClick={() => onToggleTask(t.id)}>{t.done && <CheckIcon />}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="blv-task-title">{t.title}</div>
                    <div className="blv-task-meta">{t.meta}</div>
                  </div>
                  <div className={`blv-task-prio ${t.prio}`}>{PRIO_LABEL[t.prio]}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Cột phải */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, overflowY: 'auto' }}>

          <div style={CARD}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 14 }}>Thống kê chấm công</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div style={STAT_BOX}>
                <div style={{ ...STAT_NUM, color: 'var(--attendance)' }}>18</div>
                <div style={STAT_LABEL}>Ngày công đủ giờ</div>
              </div>
              <div style={STAT_BOX}>
                <div style={{ ...STAT_NUM, color: 'var(--finance)' }}>1</div>
                <div style={STAT_LABEL}>Đi trễ</div>
              </div>
              <div style={STAT_BOX}>
                <div style={STAT_NUM}>0</div>
                <div style={STAT_LABEL}>Về sớm</div>
              </div>
              <div style={STAT_BOX}>
                <div style={{ ...STAT_NUM, color: 'var(--danger)' }}>0</div>
                <div style={STAT_LABEL}>Nghỉ không phép</div>
              </div>
            </div>
          </div>

          <div style={CARD}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>Ngày nghỉ phép</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Đã dùng 4 / 12 ngày</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--attendance)' }}>33%</span>
            </div>
            <div className="blv-leave-bar-track"><div className="blv-leave-bar-fill" style={{ width: '33%' }} /></div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 10 }}>Còn lại 8 ngày phép năm 2026, có thể đăng ký nghỉ trước 3 ngày.</div>
          </div>

          <div style={CARD}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>Thông số khác</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={INFO_ROW}>
                <span style={{ color: 'var(--text-muted)' }}>Dự án đang tham gia</span>
                <span className="mono" style={{ fontWeight: 700 }}>4</span>
              </div>
              <div style={INFO_ROW}>
                <span style={{ color: 'var(--text-muted)' }}>Điểm đánh giá KPI quý này</span>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--success)' }}>92/100</span>
              </div>
              <div style={INFO_ROW}>
                <span style={{ color: 'var(--text-muted)' }}>Tin nhắn chưa đọc</span>
                <span className="mono" style={{ fontWeight: 700 }}>6</span>
              </div>
              <div style={INFO_ROW}>
                <span style={{ color: 'var(--text-muted)' }}>Đơn mua hàng đang chờ duyệt</span>
                <span className="mono" style={{ fontWeight: 700 }}>2</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
