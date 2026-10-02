import { useState } from 'react'
import PageShell from '../../components/layout/PageShell'

const TABS = ['Đối tượng', 'Tầng', 'Phòng', 'Vật liệu']

const objects = [
  { ma: 'COL-001', ten: 'Cột vuông 300×300', loai: 'Cột', tang: 'Tầng 1', dienTich: '0.09 m²' },
  { ma: 'WAL-014', ten: 'Tường ngoại vi 200mm', loai: 'Tường', tang: 'Tầng 2', dienTich: '48.6 m²' },
  { ma: 'FLR-003', ten: 'Sàn bê tông cốt thép', loai: 'Sàn', tang: 'Tầng 3', dienTich: '124.0 m²' },
  { ma: 'STR-007', ten: 'Dầm chính DG1', loai: 'Dầm', tang: 'Tầng 1', dienTich: '0.45 m²' },
  { ma: 'WIN-022', ten: 'Cửa sổ nhôm kính', loai: 'Cửa sổ', tang: 'Tầng 4', dienTich: '3.6 m²' },
]

const typeBadge = {
  Cột: '#3b82f6', Tường: '#10b981', Sàn: '#f59e0b', Dầm: '#8b5cf6', 'Cửa sổ': '#06b6d4',
}

const thStyle = {
  textAlign: 'left', padding: '10px 14px', fontSize: '12px',
  fontWeight: 700, color: 'var(--text-muted)', borderBottom: '2px solid var(--border)',
  background: 'var(--surface-alt)',
}
const tdStyle = { padding: '11px 14px', fontSize: '13.5px', borderBottom: '1px solid var(--border)' }

export default function BIM() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <PageShell title="BIM" subtitle="Building Information Modeling">

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng đối tượng', value: '1.248' },
          { label: 'Số tầng', value: '12' },
          { label: 'Tổng diện tích sàn', value: '6.840 m²' },
          { label: 'Vật liệu', value: '34 loại' },
        ].map((c) => (
          <div key={c.label} style={{
            flex: '1 1 140px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '16px 20px',
          }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>{c.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Tab chips */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)} style={{
              padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border)',
              background: activeTab === i ? 'var(--primary)' : 'var(--surface-alt)',
              color: activeTab === i ? '#fff' : 'var(--text)',
              fontWeight: activeTab === i ? 700 : 500, fontSize: '13px', cursor: 'pointer',
            }}>{tab}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Mã', 'Tên', 'Loại', 'Tầng', 'Diện tích'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {objects.map((o, i) => (
                <tr key={o.ma} style={{ background: i % 2 === 1 ? 'var(--surface-alt)' : undefined }}>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--text-muted)' }}>{o.ma}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{o.ten}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                      background: (typeBadge[o.loai] || '#6b7280') + '22',
                      color: typeBadge[o.loai] || '#6b7280',
                    }}>{o.loai}</span>
                  </td>
                  <td style={tdStyle}>{o.tang}</td>
                  <td style={tdStyle}>{o.dienTich}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}
