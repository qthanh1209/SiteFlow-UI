import PageShell from '../../components/layout/PageShell'

const rows = [
  { hangMuc: 'Đào đắp nền móng', donVi: 'm³', khoiLuong: 320, donGia: 85000 },
  { hangMuc: 'Bê tông móng đơn', donVi: 'm³', khoiLuong: 48, donGia: 1450000 },
  { hangMuc: 'Thép cột Ø16', donVi: 'kg', khoiLuong: 1240, donGia: 22000 },
  { hangMuc: 'Gạch xây tường 200×100', donVi: 'viên', khoiLuong: 8500, donGia: 1800 },
  { hangMuc: 'Sơn nước nội thất', donVi: 'm²', khoiLuong: 620, donGia: 45000 },
]

const fmt = (n) => n.toLocaleString('vi-VN') + ' đ'
const total = rows.reduce((s, r) => s + r.khoiLuong * r.donGia, 0)

const thStyle = {
  textAlign: 'left', padding: '10px 14px', fontSize: '12px',
  fontWeight: 700, color: 'var(--text-muted)', borderBottom: '2px solid var(--border)',
  background: 'var(--surface-alt)', whiteSpace: 'nowrap',
}
const tdStyle = {
  padding: '11px 14px', fontSize: '13.5px', borderBottom: '1px solid var(--border)',
}

export default function QS() {
  return (
    <PageShell title="QS · Bóc tách khối lượng" subtitle="Quản lý bóc tách & báo giá">

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng hạng mục', value: rows.length },
          { label: 'Tổng khối lượng', value: '10.728 đơn vị' },
          { label: 'Tổng giá trị', value: fmt(total) },
          { label: 'Đã duyệt', value: '3 / 5' },
        ].map((c) => (
          <div key={c.label} style={{
            flex: '1 1 160px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '16px 20px',
          }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>{c.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>Bảng bóc tách khối lượng</span>
          <button style={{
            padding: '7px 16px', borderRadius: '8px', border: 'none',
            background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
          }}>+ Thêm hạng mục</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Hạng mục', 'Đơn vị', 'Khối lượng', 'Đơn giá', 'Thành tiền'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 1 ? 'var(--surface-alt)' : undefined }}>
                  <td style={tdStyle}>{r.hangMuc}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{r.donVi}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{r.khoiLuong.toLocaleString('vi-VN')}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(r.donGia)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{fmt(r.khoiLuong * r.donGia)}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr style={{ background: 'var(--primary-tint)', fontWeight: 700 }}>
                <td style={{ ...tdStyle, color: 'var(--primary)' }} colSpan={4}>Tổng cộng</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--primary)', fontSize: '15px' }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}
