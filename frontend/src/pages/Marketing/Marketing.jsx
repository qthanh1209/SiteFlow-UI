import { useState } from 'react'
import PageShell from '../../components/layout/PageShell'

const STATS = [
  { label: 'Chi phí tháng này', value: '142.5 tr', color: 'danger', sub: '+12% so với tháng trước' },
  { label: 'Chiến dịch đang chạy', value: '4', color: 'primary', sub: '2 kết thúc tuần này' },
  { label: 'ROI trung bình', value: '3.2x', color: 'success', sub: 'Tăng 0.4x so với Q2' },
]

const CAMPAIGNS = [
  { name: 'Google Ads Q3', budget: '40 tr', spent: '32 tr', roi: '3.8x', status: 'Đang chạy' },
  { name: 'Facebook Riverside', budget: '25 tr', spent: '25 tr', roi: '2.9x', status: 'Đã kết thúc' },
  { name: 'SEO Thảo Điền', budget: '15 tr', spent: '8 tr', roi: '—', status: 'Đang chạy' },
  { name: 'Email Remarketing', budget: '5 tr', spent: '3 tr', roi: '4.1x', status: 'Đang chạy' },
]

const TABS = ['Tổng quan', 'Chiến dịch', 'Ngân sách']

export default function Marketing() {
  const [tab, setTab] = useState('Tổng quan')

  return (
    <PageShell title="Marketing" subtitle="Quản lý chi phí & chiến dịch marketing">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '12.5px', background: tab === t ? 'var(--primary-tint)' : 'var(--surface-alt)', color: tab === t ? 'var(--primary)' : 'var(--text-muted)' }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        {STATS.map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: `var(--${s.color})` }}>{s.value}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          <span>Chiến dịch</span><span>Ngân sách</span><span>Đã chi</span><span>ROI</span><span>Trạng thái</span>
        </div>
        {CAMPAIGNS.map((c, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '14px 20px', alignItems: 'center', borderBottom: i < CAMPAIGNS.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>{c.name}</span>
            <span style={{ fontSize: '13px' }}>{c.budget}</span>
            <span style={{ fontSize: '13px' }}>{c.spent}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>{c.roi}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: c.status === 'Đang chạy' ? 'var(--success-tint)' : 'var(--surface-alt)', color: c.status === 'Đang chạy' ? 'var(--success)' : 'var(--text-muted)', display: 'inline-block' }}>{c.status}</span>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
