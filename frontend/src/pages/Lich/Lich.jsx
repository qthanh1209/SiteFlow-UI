import PageShell from '../../components/layout/PageShell'

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// October 2026 starts on Thursday (index 4)
const MONTH_START_DOW = 4
const DAYS_IN_MONTH = 31

const events = {
  3:  [{ color: '#3b82f6', label: 'Họp ban giám đốc' }],
  7:  [{ color: '#10b981', label: 'Đánh giá tiến độ DA' }],
  12: [{ color: '#f59e0b', label: 'Hội thảo BIM 2026' }, { color: '#8b5cf6', label: 'Họp kỹ thuật' }],
  15: [{ color: '#ef4444', label: 'Deadline báo cáo Q3' }],
  20: [{ color: '#06b6d4', label: 'Bàn giao công trình' }],
  22: [{ color: '#10b981', label: 'Họp nhóm dự án' }],
  28: [{ color: '#3b82f6', label: 'Review sprint tháng 10' }],
  31: [{ color: '#f59e0b', label: 'Tổng kết tháng 10' }],
}

const upcomingEvents = [
  { date: '12/10', day: 'Thứ Hai', title: 'Hội thảo BIM 2026', time: '08:30 – 17:00', color: '#f59e0b' },
  { date: '12/10', day: 'Thứ Hai', title: 'Họp kỹ thuật nội bộ', time: '17:30 – 18:30', color: '#8b5cf6' },
  { date: '15/10', day: 'Thứ Năm', title: 'Deadline báo cáo Q3', time: 'Cả ngày', color: '#ef4444' },
  { date: '20/10', day: 'Thứ Ba', title: 'Lễ bàn giao công trình Khu A', time: '09:00 – 11:00', color: '#06b6d4' },
  { date: '28/10', day: 'Thứ Tư', title: 'Review sprint tháng 10', time: '14:00 – 15:30', color: '#3b82f6' },
]

const TODAY = 2 // 2 Oct 2026

export default function Lich() {
  const cells = []
  for (let i = 0; i < MONTH_START_DOW; i++) cells.push(null)
  for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <PageShell title="Lịch" subtitle="Lịch họp & sự kiện công ty">
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Calendar grid */}
        <div style={{
          flex: '1 1 380px', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          {/* Month header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-alt)', cursor: 'pointer', color: 'var(--text)' }}>‹</button>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Tháng 10, 2026</span>
            <button style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-alt)', cursor: 'pointer', color: 'var(--text)' }}>›</button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--border)' }}>
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} style={{ textAlign: 'center', padding: '8px 0', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {cells.map((day, i) => {
              const isToday = day === TODAY
              const dayEvents = day ? events[day] || [] : []
              return (
                <div key={i} style={{
                  minHeight: '64px', padding: '6px', borderBottom: '1px solid var(--border)',
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                  background: isToday ? 'var(--primary-tint)' : undefined,
                  cursor: day ? 'pointer' : undefined,
                }}>
                  {day && (
                    <>
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: isToday ? 800 : 500,
                        background: isToday ? 'var(--primary)' : 'transparent',
                        color: isToday ? '#fff' : 'var(--text)',
                      }}>{day}</div>
                      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {dayEvents.map((ev, ei) => (
                          <div key={ei} style={{ width: '7px', height: '7px', borderRadius: '50%', background: ev.color }} title={ev.label} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div style={{
          flex: '1 1 280px', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '14px' }}>
            Sự kiện sắp tới
          </div>
          {upcomingEvents.map((ev, i) => (
            <div key={i} style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', gap: '12px', alignItems: 'flex-start',
            }}>
              <div style={{ width: '4px', borderRadius: '4px', alignSelf: 'stretch', background: ev.color, flex: 'none' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '13.5px', marginBottom: '3px' }}>{ev.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ev.day} {ev.date} · {ev.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
