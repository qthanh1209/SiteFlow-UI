import { QUOTE_SECTIONS } from '../../../data/qsData'

const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
)
const sans = { fontFamily: 'var(--qs-font)' }

export default function QuoteTab() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <div className="qs-btn" style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '8px 14px' }}><DocIcon />Xuất Excel</div>
        <div className="qs-btn" style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '8px 14px' }}><DocIcon />Xuất PDF</div>
        <div className="qs-btn primary" style={{ padding: '8px 14px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          Gửi khách hàng
        </div>
      </div>

      <div className="qs-card qs-quote-paper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--text)', paddingBottom: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" /><circle cx="12" cy="9" r="2.3" /></svg>
            </div>
            <div>
              <div style={{ ...sans, fontWeight: 800, fontSize: 16 }}>CÔNG TY TNHH XÂY DỰNG SITEFLOW</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>123 Đại lộ Nguyễn Văn Linh, Q7, TP.HCM · Hotline: 1900 6868</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...sans, fontWeight: 800, fontSize: 20, color: 'var(--qs)' }}>BÁO GIÁ</div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Số: QS-03/2026</div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Ngày: 21/09/2026</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24, fontSize: 12.5 }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Khách hàng: </span><strong>BQL Riverside</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Điện thoại: </span><strong className="mono">0909 123 456</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Dự án: </span><strong>Sảnh &amp; hành lang chung — Riverside GĐ2</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Địa chỉ: </span><strong>Riverside GĐ2, khu chung</strong></div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--text)' }}>
              <th className="qs-quote-th" style={{ textAlign: 'left' }}>Hạng mục / Sản phẩm</th>
              <th className="qs-quote-th" style={{ textAlign: 'center' }}>SL</th>
              <th className="qs-quote-th" style={{ textAlign: 'right' }}>Đơn giá</th>
              <th className="qs-quote-th" style={{ textAlign: 'right' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody className="mono">
            {QUOTE_SECTIONS.map(sec => [
              <tr key={sec.title}><td colSpan={4} style={{ padding: '10px 4px 4px', fontWeight: 700, ...sans }}>{sec.title}</td></tr>,
              ...sec.items.map(it => (
                <tr key={`${sec.title}-${it.name}`} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="qs-quote-td" style={sans}>{it.name}</td>
                  <td className="qs-quote-td" style={{ textAlign: 'center' }}>{it.qty}</td>
                  <td className="qs-quote-td" style={{ textAlign: 'right' }}>{it.price}</td>
                  <td className="qs-quote-td" style={{ textAlign: 'right' }}>{it.amount}</td>
                </tr>
              )),
            ])}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span style={{ color: 'var(--text-muted)' }}>Tạm tính</span><span className="mono">19.100.000 đ</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span style={{ color: 'var(--text-muted)' }}>VAT (8%)</span><span className="mono">1.528.000 đ</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, borderTop: '1.5px solid var(--text)', paddingTop: 8 }}><span>Tổng cộng</span><span className="mono">20.628.000 đ</span></div>
          </div>
        </div>

        <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px dashed var(--border)', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Báo giá có hiệu lực trong 15 ngày kể từ ngày phát hành. Giá đã bao gồm VAT, chưa bao gồm chi phí lắp đặt (nếu có).
        </div>
      </div>
    </>
  )
}
