import Icon from '../../../../components/ui/Icon'

const money = n => Math.round(n).toLocaleString('vi-VN')
const round2 = n => Math.round(n * 100) / 100
let seq = 0
export const newStep = (pct = 0) => { seq += 1; return { id: `pay${seq}`, pct, date: '', note: '' } }
/* Chia đều thành n đợt, đợt cuối nhận phần lẻ để tổng luôn đúng 100% */
export const evenSteps = n => Array.from({ length: n }, (_, i) => newStep(i < n - 1 ? round2(100 / n) : round2(100 - round2(100 / n) * (n - 1))))

/* Khối "Đề xuất thanh toán mục tiêu" của một nhà cung cấp: chia đợt, nhập % / số tiền / ngày / ghi chú từng đợt.
   steps: [{ id, pct, date, note }]; số tiền mỗi đợt = total × pct */
export default function PaymentPlan({ total, steps, onSteps, onSend }) {
  const sum = round2(steps.reduce((s, x) => s + (Number(x.pct) || 0), 0))
  const proposed = (total * sum) / 100
  const patch = (id, p) => onSteps(steps.map(s => (s.id === id ? { ...s, ...p } : s)))
  const full = sum === 100

  return (
    <div className="qs-po-pay">
      <div className="qs-po-pay-top">
        <span>Chia nhanh</span>
        {[2, 3, 4].map(n => <button key={n} className="qs-po-pay-quick" onClick={() => onSteps(evenSteps(n))}>{n} đợt</button>)}
        <span style={{ flex: 1 }} />
        <button className="qs-po-pay-add" onClick={() => onSteps([...steps, newStep(Math.max(0, round2(100 - sum)))])}><Icon name="plus" size={12} />Thêm đợt</button>
      </div>

      <div className="qs-po-pay-steps">
        {steps.map((s, i) => (
          <div key={s.id} className="qs-po-pay-step">
            <div className="qs-po-pay-step-head">
              <b>Thanh toán đợt {i + 1}</b>
              <button title="Xoá đợt này" disabled={steps.length < 2} onClick={() => onSteps(steps.filter(x => x.id !== s.id))}><Icon name="x" size={13} /></button>
            </div>
            <label><span>%</span><input inputMode="decimal" value={s.pct} onChange={e => patch(s.id, { pct: e.target.value.replace(/[^\d.]/g, '') })} /></label>
            <label>
              <span>Số tiền</span>
              <input
                inputMode="numeric" value={money((total * (Number(s.pct) || 0)) / 100)}
                onChange={e => { const n = Number(e.target.value.replace(/\D/g, '')); patch(s.id, { pct: total ? round2((n / total) * 100) : 0 }) }}
              />
            </label>
            <label><span>Ngày</span><input type="date" value={s.date} onChange={e => patch(s.id, { date: e.target.value })} /></label>
            <label><span>Ghi chú</span><textarea rows={2} value={s.note} placeholder="VD: tạm ứng ký hợp đồng" onChange={e => patch(s.id, { note: e.target.value })} /></label>
          </div>
        ))}
      </div>

      <div className={`qs-po-pay-status${full ? ' ok' : ''}`}>
        <span>
          {full && <Icon name="check" size={13} stroke={2.4} />}
          {full ? 'Đã phân bổ đủ 100% giá trị đơn hàng'
            : sum < 100 ? `Mới phân bổ ${sum}% — còn thiếu ${round2(100 - sum)}%` : `Đang phân bổ ${sum}% — vượt ${round2(sum - 100)}%`}
        </span>
        <span>Tổng đề xuất: <b>{money(proposed)} đ</b> / {money(total)} đ</span>
      </div>
      <button className="qs-po-send" disabled={!full} title={full ? undefined : 'Cần phân bổ đủ 100% trước khi gửi'} onClick={onSend}><Icon name="cart" size={14} />Gửi đề xuất thanh toán</button>
    </div>
  )
}
