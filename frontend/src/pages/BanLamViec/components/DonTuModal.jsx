import { useState } from 'react'
import { DONTU_CONFIG, APPROVER_SUGGESTIONS, shortDate } from '../../../data/banLamViecData'

const TEXTAREA_STYLE = { padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }

/* Modal tạo đơn từ (Xin phép / Tạm ứng / Hoàn ứng).
   Luôn được mount: ngày & người duyệt được giữ giữa các lần mở như bản HTML,
   chỉ "Lý do" và "Số tiền" bị xoá sau khi gửi đơn. */
export default function DonTuModal({ open, type, onClose, onSubmit }) {
  const [dateFrom, setDateFrom] = useState('2026-09-24')
  const [dateTo, setDateTo] = useState('2026-09-24')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [approver1, setApprover1] = useState('Nguyễn Đức Anh')
  const [approver2, setApprover2] = useState('Phan Bảo Ngọc')

  const cfg = type ? DONTU_CONFIG[type] : null

  function submit() {
    if (!type) return
    const r = reason.trim()
    if (!r) { alert('Vui lòng nhập ' + cfg.reasonLabel.toLowerCase() + '.'); return }
    const dateFromLabel = shortDate(dateFrom)
    const amt = amount.trim()
    const a1 = approver1.trim() || 'Quản lý trực tiếp'
    const a2 = approver2.trim() || 'Nhân sự (HR)'

    let titleText = cfg.title
    if (type === 'xinphep') {
      const dateToLabel = shortDate(dateTo)
      titleText += ' — ' + dateFromLabel + (dateToLabel && dateToLabel !== dateFromLabel ? ' đến ' + dateToLabel : '')
    } else if (amt) {
      titleText += ' — ' + amt + 'đ'
    }

    onSubmit({
      type,
      title: titleText,
      sub: 'Gửi ' + dateFromLabel + ' · ' + r,
      approveTitle: 'Đang chờ ' + a1 + ' duyệt · ' + a2 + ' chưa xét',
      segs: [['QL ⏳', 'active'], ['HR', '']],
    })
    setReason('')
    setAmount('')
    onClose()
  }

  return (
    <div className={`blv-modal-overlay${open ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="blv-modal-box">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{cfg ? 'Tạo đơn — ' + cfg.title : 'Tạo đơn'}</h3>
        <div className="blv-modal-row">
          <div className="blv-modal-field">
            <label>{cfg ? cfg.dateFromLabel : 'Từ ngày'}</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="blv-modal-field" style={type && type !== 'xinphep' ? { display: 'none' } : undefined}>
            <label>Đến ngày</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
        <div className="blv-modal-field" style={{ display: cfg && cfg.showAmount ? 'flex' : 'none' }}>
          <label>{cfg && cfg.amountLabel ? cfg.amountLabel : 'Số tiền'}</label>
          <input type="text" inputMode="numeric" placeholder="VD: 3.000.000" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div className="blv-modal-field">
          <label>{cfg ? cfg.reasonLabel : 'Lý do'}</label>
          <textarea rows={3} style={TEXTAREA_STYLE} placeholder="Nhập nội dung..." value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <div className="blv-modal-field">
          <label>Cấp duyệt <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(chọn gợi ý hoặc tự nhập tên)</span></label>
          <div className="blv-approver-steps">
            <div className="blv-approver-step">
              <div className="blv-approver-num">1</div>
              <input className="blv-approver-input" list="blvApproverSuggestions" placeholder="Nhập tên người duyệt" value={approver1} onChange={e => setApprover1(e.target.value)} />
              <div className="blv-approver-role">Quản lý trực tiếp</div>
            </div>
            <div className="blv-approver-step">
              <div className="blv-approver-num">2</div>
              <input className="blv-approver-input" list="blvApproverSuggestions" placeholder="Nhập tên người duyệt" value={approver2} onChange={e => setApprover2(e.target.value)} />
              <div className="blv-approver-role">Nhân sự (HR)</div>
            </div>
          </div>
          <datalist id="blvApproverSuggestions">
            {APPROVER_SUGGESTIONS.map(n => <option key={n} value={n} />)}
          </datalist>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
          <button className="blv-modal-btn cancel" onClick={onClose}>Hủy</button>
          <button className="blv-modal-btn submit" onClick={submit}>Gửi đơn</button>
        </div>
      </div>
    </div>
  )
}
