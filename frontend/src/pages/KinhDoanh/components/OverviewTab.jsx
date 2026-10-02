import { useMemo, useState } from 'react'
import { stages, stageLabels } from '../../../data/kinhDoanhData'
import { stageAccent, formatValue } from '../utils'

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function trendData(period, leads) {
  const cfg = {
    week:  { labels: ['T2','T3','T4','T5','T6','T7','CN'], seed: 11 },
    month: { labels: ['Th4','Th5','Th6','Th7','Th8','Th9'], seed: 22 },
    year:  { labels: ['2023','2024','2025','2026'], seed: 33 },
  }[period] || { labels: ['Th4','Th5','Th6','Th7','Th8','Th9'], seed: 22 }
  const rand = mulberry32(cfg.seed)
  const avg = leads.reduce((s, l) => s + Number(l.value || 0), 0) / cfg.labels.length || 1
  const values = cfg.labels.map((_, i) => {
    const trend = avg * (0.55 + i / ((cfg.labels.length - 1) || 1) * 0.75)
    return Math.max(0.5, +(trend + (rand() - 0.5) * avg * 0.7).toFixed(1))
  })
  values[values.length - 1] = +avg.toFixed(1)
  return { labels: cfg.labels, values }
}

function funnelColor(key) {
  if (key === 'bao-gia' || key === 'bao-gia-thi-cong') return 'var(--danger)'
  const accent = stageAccent(key)
  return accent ? accent.border : 'var(--sales)'
}

function TrendLine({ labels, values }) {
  const max = Math.max(...values) * 1.18
  const w = 600, h = 190, pL = 24, pR = 24, pT = 32, pB = 30
  const pH = h - pT - pB
  const stepX = (w - pL - pR) / ((labels.length - 1) || 1)
  const pts = values.map((v, i) => [pL + i * stepX, pT + (1 - v / max) * pH])
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length-1][0].toFixed(1)},${pT+pH} L${pts[0][0].toFixed(1)},${pT+pH} Z`
  const last = pts.length - 1
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, overflow: 'visible' }}>
      <defs>
        <linearGradient id="kdTrendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.38" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map(f => { const y = (pT + f * pH).toFixed(1); return <line key={f} x1={pL} y1={y} x2={w-pR} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,4" /> })}
      <path d={area} fill="url(#kdTrendGrad)" />
      <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r={i === last ? 5 : 3.5} fill={i === last ? 'var(--primary)' : 'var(--surface)'} stroke="var(--primary)" strokeWidth="2" />)}
      {pts.map((p, i) => <text key={`l${i}`} x={p[0].toFixed(1)} y={h - 8} textAnchor="middle" fontSize="11" fill="var(--text-muted)">{labels[i]}</text>)}
      {pts.map((p, i) => <text key={`v${i}`} x={p[0].toFixed(1)} y={(p[1] - 13).toFixed(1)} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--primary)">{values[i]}</text>)}
    </svg>
  )
}

function TrendBar({ labels, values }) {
  const max = Math.max(...values) * 1.18
  const w = 600, h = 190, pL = 24, pR = 24, pT = 32, pB = 30
  const pH = h - pT - pB
  const stepX = (w - pL - pR) / labels.length
  const bW = stepX * 0.55
  const bars = values.map((v, i) => {
    const cx = pL + stepX * i + stepX / 2
    const bH = (v / max) * pH
    return { cx, y: pT + pH - bH, bH, v, label: labels[i] }
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, overflow: 'visible' }}>
      <defs>
        <linearGradient id="kdBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map(f => { const y = (pT + f * pH).toFixed(1); return <line key={f} x1={pL} y1={y} x2={w-pR} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,4" /> })}
      {bars.map((b, i) => <rect key={i} x={(b.cx - bW/2).toFixed(1)} y={b.y.toFixed(1)} width={bW.toFixed(1)} height={b.bH.toFixed(1)} rx="4" fill="url(#kdBarGrad)" />)}
      {bars.map((b, i) => <text key={`l${i}`} x={b.cx.toFixed(1)} y={h - 8} textAnchor="middle" fontSize="11" fill="var(--text-muted)">{b.label}</text>)}
      {bars.map((b, i) => <text key={`v${i}`} x={b.cx.toFixed(1)} y={(b.y - 8).toFixed(1)} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--primary)">{b.v}</text>)}
    </svg>
  )
}

function FunnelDonut({ leads }) {
  const counts = stages.map(([key]) => leads.filter(l => l.stage === key).length)
  const total = counts.reduce((a, b) => a + b, 0) || 1
  const colors = stages.map(([key]) => funnelColor(key))
  const cx = 70, cy = 70, r = 55, sw = 26
  const circ = 2 * Math.PI * r
  let acc = 0
  const segs = stages.map(([key], i) => {
    const dash = (counts[i] / total) * circ
    const seg = (
      <circle key={key} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i]} strokeWidth={sw}
        strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`}
        strokeDashoffset={(-acc).toFixed(2)}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    )
    acc += dash
    return seg
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minHeight: 70 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ flex: 'none' }}>
        {segs}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text)">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">cơ hội</text>
      </svg>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto', maxHeight: 160 }}>
        {stages.map(([key, label], i) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10.5px' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: colors[i], flex: 'none' }} />
            <span style={{ color: 'var(--text-muted)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>{label}</span>
            <span style={{ fontWeight: 700, color: colors[i] }}>{counts[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FunnelBars({ leads }) {
  const counts = stages.map(([key]) => leads.filter(l => l.stage === key).length)
  const max = Math.max(1, ...counts)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minHeight: 70 }}>
      {stages.map(([key, label], i) => {
        const c = counts[i]
        const pct = Math.max(4, Math.round(c / max * 100))
        const color = funnelColor(key)
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 120, flex: 'none', fontSize: '10.5px', color: 'var(--text-muted)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>{label}</span>
            <div style={{ flex: 1, background: 'var(--surface-alt)', borderRadius: 5, height: 18, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 5, transition: 'width .3s' }} />
            </div>
            <span style={{ width: 22, flex: 'none', fontSize: '11.5px', fontWeight: 700, textAlign: 'right', color }}>{c}</span>
          </div>
        )
      })}
    </div>
  )
}

function FunnelColumns({ leads }) {
  const counts = stages.map(([key]) => leads.filter(l => l.stage === key).length)
  const max = Math.max(1, ...counts)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, minHeight: 140, overflowX: 'auto', paddingBottom: 2 }}>
      {stages.map(([key, label], i) => {
        const c = counts[i]
        const hPct = Math.max(12, Math.round(c / max * 100))
        const accent = stageAccent(key)
        const isRed = key === 'bao-gia' || key === 'bao-gia-thi-cong'
        const barColor = isRed ? 'var(--danger)' : (accent ? accent.border : 'var(--sales-tint)')
        const textColor = (isRed || accent) ? '#fff' : 'var(--sales)'
        return (
          <div key={key} style={{ flex: 1, minWidth: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', height: `${hPct}%`, background: barColor, borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: textColor }}>{c}</span>
            </div>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function OverviewTab({ filtered, stats, filterBar, stagesEarned, totalPoints, doneSteps, tasks }) {
  const [ovPeriod, setOvPeriod] = useState('month')
  const [trendType, setTrendType] = useState('line')
  const [funnelType, setFunnelType] = useState('donut')

  const { labels, values } = useMemo(() => trendData(ovPeriod, filtered), [ovPeriod, filtered])

  const upcoming = useMemo(() =>
    filtered.filter(l => l.stage === 'bao-gia' || l.stage === 'dam-phan').sort((a, b) => b.value - a.value).slice(0, 4),
    [filtered]
  )

  return (
    <section className="sales-panel">
      <div className="kd-toolbar">
        <span>Số liệu tổng hợp theo phòng ban & mốc thời gian đã chọn</span>
        {filterBar}
      </div>

      <div className="kd-kpi-grid">
        {[
          ['Tổng giá trị pipeline', formatValue(stats.totalValue), `${stats.total} cơ hội đang theo dõi`, 'var(--sales)'],
          ['Khách hàng tiềm năng', stats.total, '+4 trong tháng này', 'var(--primary)'],
          ['Tỷ lệ chốt hợp đồng', `${stats.closeRate}%`, 'Trên tổng số cơ hội', 'var(--success)'],
          ['Đã chốt tháng này', formatValue(stats.wonValue), `${stats.won.length} hợp đồng`, 'var(--success)'],
          ['Tỷ lệ hợp đồng rớt', `${stats.lostRate}%`, `${stats.lost.length} cơ hội trượt thầu`, 'var(--danger)'],
          ['Chuyển giao cho đối tác', `${stats.partnerRate}%`, 'Trên các hợp đồng đã chốt', 'var(--primary)'],
        ].map(([label, value, caption, color]) => (
          <article className="kd-kpi" key={label}>
            <span>{label}</span>
            <strong style={{ color }}>{value}</strong>
            <small>{caption}</small>
          </article>
        ))}
      </div>

      <div className="kd-overview-grid">
        <article className="kd-widget">
          <div className="kd-widget-header">
            <h3>Doanh số theo thời gian</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="ov-period-btns">
                {[['week','Tuần'],['month','Tháng'],['year','Năm']].map(([key, label]) => (
                  <button key={key} className={ovPeriod === key ? 'active' : ''} onClick={() => setOvPeriod(key)}>{label}</button>
                ))}
              </div>
              <select value={trendType} onChange={e => setTrendType(e.target.value)} className="ov-chart-select">
                <option value="line">Đường</option>
                <option value="bar">Cột</option>
              </select>
            </div>
          </div>
          <div className="ov-chart-body">
            {trendType === 'bar' ? <TrendBar labels={labels} values={values} /> : <TrendLine labels={labels} values={values} />}
          </div>
        </article>

        <article className="kd-widget">
          <div className="kd-widget-header">
            <h3>Phễu bán hàng (Sales Funnel)</h3>
            <select value={funnelType} onChange={e => setFunnelType(e.target.value)} className="ov-chart-select">
              <option value="bars">Thanh ngang</option>
              <option value="columns">Cột dọc</option>
              <option value="donut">Biểu đồ tròn</option>
            </select>
          </div>
          <div className="ov-chart-body">
            {funnelType === 'donut' ? <FunnelDonut leads={filtered} />
              : funnelType === 'columns' ? <FunnelColumns leads={filtered} />
              : <FunnelBars leads={filtered} />}
          </div>
        </article>
      </div>

      <article className="kd-widget kd-upcoming-widget">
        <h3>Cơ hội sắp chốt</h3>
        {upcoming.length === 0
          ? <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', padding: '12px 0' }}>Chưa có cơ hội nào sắp chốt.</div>
          : upcoming.map((l, i) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < upcoming.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{l.name}{l.type ? ` — ${l.type}` : ''}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stageLabels[l.stage]}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sales)', fontFamily: 'ui-monospace, monospace' }}>{formatValue(l.value)}</span>
            </div>
          ))
        }
      </article>
    </section>
  )
}
