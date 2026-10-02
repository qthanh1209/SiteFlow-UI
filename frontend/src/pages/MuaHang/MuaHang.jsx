import PageShell from '../../components/layout/PageShell'

const orders = [
  { ma: 'PO-2026-041', nhaCungCap: 'Công ty Thép Miền Nam', hangMuc: 'Thép xây dựng Ø16-Ø32', giaTriRaw: 284500000, trangThai: 'Đã duyệt' },
  { ma: 'PO-2026-042', nhaCungCap: 'CTCP Vật liệu Hà Nội', hangMuc: 'Gạch không nung 200×100', giaTriRaw: 67200000, trangThai: 'Chờ duyệt' },
  { ma: 'PO-2026-043', nhaCungCap: 'Xi măng Hoàng Thạch', hangMuc: 'Xi măng PCB40 (120 tấn)', giaTriRaw: 156000000, trangThai: 'Đang giao' },
  { ma: 'PO-2026-044', nhaCungCap: 'Cát Đồng Nai Trading', hangMuc: 'Cát vàng xây dựng', giaTriRaw: 38400000, trangThai: 'Hoàn thành' },
  { ma: 'PO-2026-045', nhaCungCap: 'Sơn Jotun Việt Nam', hangMuc: 'Sơn nội ngoại thất', giaTriRaw: 92750000, trangThai: 'Từ chối' },
]

const statusColor = {
  'Đã duyệt': { bg: '#d1fae5', color: '#059669' },
  'Chờ duyệt': { bg: '#fef3c7', color: '#d97706' },
  'Đang giao': { bg: '#dbeafe', color: '#2563eb' },
  'Hoàn thành': { bg: '#ede9fe', color: '#7c3aed' },
  'Từ chối': { bg: '#fee2e2', color: '#dc2626' },
}

const fmt = (n) => n.toLocaleString('vi-VN') + ' đ'

const thStyle = {
  textAlign: 'left', padding: '10px 14px', fontSize: '12px',
  fontWeight: 700, color: 'var(--text-muted)', borderBottom: '2px solid var(--border)',
  background: 'var(--surface-alt)', whiteSpace: 'nowrap',
}
const tdStyle = { padding: '11px 14px', fontSize: '13.5px', borderBottom: '1px solid var(--border)' }

export default function MuaHang() {
  const total = orders.reduce((s, o) => s + o.giaTriRaw, 0)

  return (
    <PageShell title="Mua hàng" subtitle="Đơn mua hàng & nhà cung cấp">

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng đơn hàng', value: orders.length },
          { label: 'Tổng giá trị', value: fmt(total) },
          { label: 'Đã duyệt', value: '2' },
          { label: 'Chờ xử lý', value: '2' },
        ].map((c) => (
          <div key={c.label} style={{
            flex: '1 1 150px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '16px 20px',
          }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>{c.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>Danh sách đơn mua hàng</span>
          <button style={{
            padding: '7px 16px', borderRadius: '8px', border: 'none',
            background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
          }}>+ Tạo đơn mới</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Mã đơn', 'Nhà cung cấp', 'Hạng mục', 'Giá trị', 'Trạng thái'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => {
                const s = statusColor[o.trangThai] || { bg: '#f3f4f6', color: '#6b7280' }
                return (
                  <tr key={o.ma} style={{ background: i % 2 === 1 ? 'var(--surface-alt)' : undefined }}>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--primary)', fontWeight: 600 }}>{o.ma}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{o.nhaCungCap}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{o.hangMuc}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{fmt(o.giaTriRaw)}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                        background: s.bg, color: s.color,
                      }}>{o.trangThai}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}
