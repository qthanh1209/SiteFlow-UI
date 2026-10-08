import { useMemo, useRef, useState } from 'react'
import Icon from '../../../components/ui/Icon'
import PaintThumb from './breakdown/PaintThumb'
import ProductInfo from './breakdown/ProductInfo'
import PaymentPlan, { newStep } from './purchase/PaymentPlan'
import { CATALOG, COST_CATEGORIES, formatTable, rowValues } from '../../../data/qsBreakdownData'
import { PO_OTHER, PO_SEED_ORDERS, paymentPlan, supplierOf } from '../../../data/qsPurchaseData'

const money = n => Math.round(n).toLocaleString('vi-VN')
const pct = v => Math.max(0, Math.min(100, Number(v) || 0))
const today = () => { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}` }
const orderCode = () => `MH-${Date.now().toString(36).toUpperCase().slice(-8)}-${String(Math.floor(1000 + Math.random() * 9000))}`

function download(name, matrix) {
  const blob = new Blob([`﻿${formatTable(matrix, ',')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

/* Tab "Mua hàng": gom các dòng của bảng Bóc tách theo nhà cung cấp để lập và gửi đơn mua.
   Cùng một sản phẩm ở nhiều tầng được gộp thành một dòng (cộng số lượng, ghi các vị trí). */
export default function PurchaseTab({ sheet, vat, onGoto }) {
  const { groups } = sheet
  const [catCode, setCatCode] = useState(COST_CATEGORIES[0].code)
  const [q, setQ] = useState('')
  /* Chiết khấu theo dòng: { [key]: { propose, ncc } } — đề xuất giảm (%) và giảm giá NCC đồng ý (%) */
  const [disc, setDisc] = useState({})
  const [unchecked, setUnchecked] = useState(() => new Set())
  const [planOpen, setPlanOpen] = useState(() => new Set())
  /* Các đợt thanh toán đã chỉnh của từng nhà cung cấp; chưa chỉnh thì dùng bộ đợt gợi ý (giữ trong ref để id không đổi giữa các lần vẽ) */
  const [plans, setPlans] = useState({})
  const planDefaults = useRef({})
  const planOf = (name, total) => {
    if (plans[name]) return plans[name]
    if (!planDefaults.current[name]) planDefaults.current[name] = paymentPlan(total).map(x => newStep(x.pct))
    return planDefaults.current[name]
  }
  const [form, setForm] = useState({ sender: '', dept: '', note: '' })
  const [touched, setTouched] = useState(false)
  const [orders, setOrders] = useState(PO_SEED_ORDERS)
  const [proposals, setProposals] = useState([])
  const [sentOpen, setSentOpen] = useState(true)
  /* Sản phẩm đang xem thông tin (bấm tên sản phẩm trong bảng) */
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const senderRef = useRef(null)

  const category = COST_CATEGORIES.find(c => c.code === catCode)
  const rowCount = category.live ? groups.reduce((s, g) => s + g.rows.length, 0) : 0
  const notify = text => { clearTimeout(toastTimer.current); setToast(text); toastTimer.current = setTimeout(() => setToast(null), 2600) }

  /* Gom dòng theo nhà cung cấp → sản phẩm */
  const suppliers = useMemo(() => {
    if (!category.live) return []
    const by = new Map()
    groups.forEach(g => g.rows.forEach(r => {
      const sup = supplierOf(r.brand)
      const key = `${sup}|${r.productId || r.name}`
      if (!by.has(sup)) by.set(sup, new Map())
      const lines = by.get(sup)
      const v = rowValues(r)
      const cur = lines.get(key) || { key, r, qty: 0, places: [], price: v.dealer }
      cur.qty += r.qty
      if (!cur.places.includes(g.name)) cur.places.push(g.name)
      lines.set(key, cur)
    }))
    const k = q.trim().toLowerCase()
    return [...by].map(([name, lines]) => ({ name, lines: [...lines.values()].filter(l => !k || [l.r.name, l.r.brand, ...l.places].some(t => (t || '').toLowerCase().includes(k))) }))
      .filter(s => s.lines.length)
      .sort((a, b) => (a.name === PO_OTHER) - (b.name === PO_OTHER))
  }, [groups, q, category.live])

  /* Số tiền của một dòng: NCC đã đồng ý giảm thì tính theo mức đó, chưa thì tính theo mức mình đề xuất */
  const lineOf = l => {
    const d = disc[l.key] || {}
    const amount = l.price * l.qty
    const rate = pct(d.ncc) > 0 ? pct(d.ncc) : pct(d.propose)
    return { amount, after: amount * (1 - rate / 100) }
  }
  const totalOf = s => {
    const after = s.lines.reduce((a, l) => a + lineOf(l).after, 0)
    const vatAmount = (after * vat) / 100
    return { after, vatAmount, total: after + vatAmount }
  }
  const setLine = (key, field, value) => setDisc(d => ({ ...d, [key]: { ...(d[key] || {}), [field]: value } }))
  const setAll = (s, field, value) => setDisc(d => s.lines.reduce((acc, l) => ({ ...acc, [l.key]: { ...(acc[l.key] || {}), [field]: value } }), { ...d }))
  const toggleCheck = name => setUnchecked(prev => { const n = new Set(prev); if (n.has(name)) n.delete(name); else n.add(name); return n })
  const togglePlan = name => setPlanOpen(prev => { const n = new Set(prev); if (n.has(name)) n.delete(name); else n.add(name); return n })

  const chosen = suppliers.filter(s => !unchecked.has(s.name))
  const grand = chosen.reduce((a, s) => a + totalOf(s).total, 0)
  const formOk = form.sender.trim() && form.dept.trim()

  /* Gửi đơn mua cho một hoặc nhiều nhà cung cấp: cần tên người gửi và phòng ban */
  function send(list) {
    setTouched(true)
    if (!list.length) return
    if (!formOk) { notify('Nhập người gửi và phòng ban trước khi gửi đơn'); if (senderRef.current) senderRef.current.focus(); return }
    const made = list.map(s => ({
      code: orderCode(), status: 'Chờ duyệt', supplier: s.name, count: s.lines.length, total: totalOf(s).total, date: today(), sender: form.sender.trim(), dept: form.dept.trim(), note: form.note.trim(),
      lines: s.lines.map((l, i) => { const x = lineOf(l); return [`${i + 1}`, l.r.name, l.r.unit, l.qty, money(l.price), money(x.amount), money(x.after)] }),
    }))
    setOrders(o => [...made, ...o])
    setSentOpen(true)
    notify(made.length > 1 ? `Đã gửi ${made.length} đơn mua hàng` : `Đã gửi đơn mua hàng ${made[0].supplier}`)
  }
  const exportOrder = o => download(`${o.code}.csv`, [
    ['Mã đơn', o.code, 'Nhà cung cấp', o.supplier, 'Ngày', o.date], [],
    ['#', 'Sản phẩm', 'ĐVT', 'SL', 'Đơn giá', 'Thành tiền', 'Thành tiền sau CK'], ...(o.lines || []), [], ['', '', '', '', '', 'Tổng (gồm VAT)', money(o.total)],
  ])
  function sendProposal(s, plan) {
    const t = totalOf(s)
    setProposals(p => [{ id: orderCode(), supplier: s.name, plan, total: t.total, date: today() }, ...p])
    notify(`Đã gửi đề xuất thanh toán ${s.name}`)
  }

  return (
    <>
      <div className="qs-card qs-ct-top">
        <Icon name="history" size={15} className="qs-ct-top-icon" />
        <div className="qs-ct-cats">
          {COST_CATEGORIES.map(c => (
            <button key={c.code} className={`qs-ct-cat-chip${c.code === catCode ? ' on' : ''}`} onClick={() => setCatCode(c.code)}>
              <small>{c.code}</small>{c.name}
              {(c.live || c.count) && <span>{c.live ? groups.reduce((s, g) => s + g.rows.length, 0) : c.count}</span>}
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <div className="qs-ct-search wide">
          <Icon name="search" size={15} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm sản phẩm, công tác, dòng trong bảng, hạng mục…" />
        </div>
        <button className="qs-ct-btn" onClick={() => onGoto('quote')}><Icon name="download" size={14} />Xuất báo giá</button>
      </div>

      <div className="qs-card qs-ct-bar">
        <span className="qs-ct-title">Hạng mục đã bóc</span>
        <span className="qs-bd-count">[{rowCount}]</span>
        <button className="qs-bd-category">
          <b>{category.code}.{category.name}</b>
          <span className="qs-bd-count">[{rowCount}]</span>
          <span style={{ flex: 1 }} />
          <span className="qs-bd-acc-plus"><Icon name="plus" size={10} stroke={3} /></span>
        </button>
        <span style={{ flex: 1 }} />
        <button className="qs-bd-round-btn accent" title={sentOpen ? 'Thu gọn đơn đã gửi' : 'Mở đơn đã gửi'} onClick={() => setSentOpen(v => !v)}><Icon name={sentOpen ? 'chevronDown' : 'chevronUp'} size={14} /></button>
      </div>

      <div className="qs-po-main">
        <div className="qs-po-list">
          {suppliers.map((s, si) => {
            const t = totalOf(s)
            const plan = planOf(s.name, t.total)
            const on = !unchecked.has(s.name)
            return (
              <div key={s.name} className={`qs-card qs-po-card${on ? ' on' : ''}`}>
                <div className="qs-po-card-head">
                  <span className="qs-po-card-icon"><Icon name="building" size={16} /></span>
                  <b>{s.name}</b><span className="qs-bd-badge">{s.lines.length} SP</span>
                  <span style={{ flex: 1 }} />
                  <b className="qs-po-card-total">{money(t.total)} đ</b>
                  <button className={`qs-po-check${on ? ' on' : ''}`} title={on ? 'Bỏ chọn đơn này' : 'Chọn đơn này'} onClick={() => toggleCheck(s.name)}>{on && <Icon name="check" size={13} stroke={3} />}</button>
                </div>
                <table className="qs-po-table">
                  <thead>
                    <tr>
                      <th className="c">#</th><th className="c">Ảnh</th><th>Sản phẩm</th><th className="c">ĐVT</th><th className="c">SL</th><th className="r">Đơn giá</th><th className="r">Thành tiền</th>
                      <th className="c">Đề xuất giảm (%)<input className="qs-po-bulk" placeholder="%" title="Đặt cho mọi dòng của nhà cung cấp này" onChange={e => setAll(s, 'propose', e.target.value)} /></th>
                      <th className="c">Giảm giá NCC (%)<input className="qs-po-bulk" placeholder="%" title="Đặt cho mọi dòng của nhà cung cấp này" onChange={e => setAll(s, 'ncc', e.target.value)} /></th>
                      <th className="r">Thành tiền sau CK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.lines.map((l, i) => {
                      const x = lineOf(l)
                      const d = disc[l.key] || {}
                      const desc = [l.r.info, l.r.features].filter(Boolean).join(' · ').replace(/\n/g, ' ')
                      const product = CATALOG.find(c => c.id === l.r.productId)
                      return (
                        <tr key={l.key}>
                          <td className="c no">{si + 1}.{i + 1}</td>
                          <td className="c"><span className="qs-po-thumb">{l.r.tone && <PaintThumb tone={l.r.tone} size={30} />}</span></td>
                          <td className="prod">
                            {product
                              ? <button className="qs-po-name" title="Xem thông tin sản phẩm" onClick={() => setDetail(product)}>{l.r.name}<Icon name="eye" size={12} /></button>
                              : <b>{l.r.name}</b>}
                            <small>{l.places.length > 1 ? `${l.places.length} vị trí: ` : ''}{l.places.join(', ')}{l.r.brand ? ` · ${l.r.brand}` : ''}</small>
                            {desc && <p>{desc}</p>}
                          </td>
                          <td className="c unit">{l.r.unit}</td>
                          <td className="c"><b>{l.qty}</b></td>
                          <td className={`r${l.price ? '' : ' zero'}`}>{money(l.price)}</td>
                          <td className="r"><b>{money(x.amount)}</b></td>
                          <td className="c"><label className="qs-po-pct propose"><input inputMode="numeric" placeholder="0" value={d.propose || ''} onChange={e => setLine(l.key, 'propose', e.target.value.replace(/[^\d.]/g, ''))} />%</label></td>
                          <td className="c"><label className="qs-po-pct"><input inputMode="numeric" placeholder="0" value={d.ncc || ''} onChange={e => setLine(l.key, 'ncc', e.target.value.replace(/[^\d.]/g, ''))} />%</label></td>
                          <td className="r after">{money(x.after)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr><td colSpan={9} className="r">VAT {vat}%</td><td className="r">{money(t.vatAmount)}</td></tr>
                    <tr className="grand"><td colSpan={9} className="r">Tổng</td><td className="r">{money(t.total)}</td></tr>
                  </tfoot>
                </table>
                <button className="qs-po-plan-head" onClick={() => togglePlan(s.name)}>
                  <Icon name="banknote" size={15} className="qs-dash-accent" /><b>Đề xuất thanh toán mục tiêu</b><span>{plan.length} đợt · {money(t.total)} đ</span>
                  <span style={{ flex: 1 }} /><span className={`qs-bd-caret${planOpen.has(s.name) ? ' up' : ''}`} />
                </button>
                {planOpen.has(s.name) && (
                  <PaymentPlan
                    total={t.total} steps={plan}
                    onSteps={steps => setPlans(m => ({ ...m, [s.name]: steps }))}
                    onSend={() => sendProposal(s, plan)}
                  />
                )}
                <div className="qs-po-card-foot">
                  <button className="qs-po-send" onClick={() => send([s])}><Icon name="cart" size={14} />Gửi mua hàng NCC này</button>
                </div>
              </div>
            )
          })}
          {!suppliers.length && <div className="qs-card qs-po-empty">{category.live ? 'Không có sản phẩm nào khớp.' : 'Hạng mục này chưa có dữ liệu bóc tách.'}</div>}
        </div>

        <div className="qs-po-side">
          <div className="qs-card qs-po-box">
            <div className="qs-po-box-head"><Icon name="cart" size={15} /><b>Tổng hợp đơn</b><span className="qs-bd-badge">{String(chosen.length).padStart(2, '0')}</span></div>
            <div className="qs-po-sum-list">
              {suppliers.map(s => {
                const on = !unchecked.has(s.name)
                return (
                  <div key={s.name} className="qs-po-sum-row">
                    <button className={`qs-po-check${on ? ' on' : ''}`} onClick={() => toggleCheck(s.name)}>{on && <Icon name="check" size={12} stroke={3} />}</button>
                    <div><b>{s.name}</b><small>{s.lines.length} SP</small></div>
                    <b>{money(totalOf(s).total)}</b>
                  </div>
                )
              })}
              {!suppliers.length && <p className="qs-po-none">Chưa có đơn nào.</p>}
            </div>
            <div className="qs-po-form">
              <label><span>Người gửi <i>*</i></span><input ref={senderRef} className={touched && !form.sender.trim() ? 'invalid' : ''} value={form.sender} onChange={e => setForm({ ...form, sender: e.target.value })} placeholder="Tên người gửi" /></label>
              <label><span>Phòng ban <i>*</i></span><input className={touched && !form.dept.trim() ? 'invalid' : ''} value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} placeholder="VD: Mua hàng / Kỹ thuật" /></label>
              <label><span>Ghi chú</span><textarea rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú cho đơn..." /></label>
            </div>
            <div className="qs-po-grand"><span>Tổng cộng (VAT)</span><b>{money(grand)} đ</b></div>
            <button className="qs-po-send wide" disabled={!chosen.length} onClick={() => send(chosen)}><Icon name="cart" size={14} />Gửi {chosen.length} đơn đã chọn</button>
          </div>

          <div className="qs-card qs-po-box">
            <div className="qs-po-box-head">
              <Icon name="cart" size={15} /><b>Đơn đã gửi</b><span className="qs-bd-badge">{String(orders.length).padStart(2, '0')}</span>
              <span style={{ flex: 1 }} />
              <button className="qs-po-fold" title={sentOpen ? 'Thu gọn' : 'Mở rộng'} onClick={() => setSentOpen(v => !v)}><span className={`qs-bd-caret${sentOpen ? ' up' : ''}`} /></button>
            </div>
            {sentOpen && orders.map(o => (
              <div key={o.code} className="qs-po-order">
                <div><b>{o.code}</b><span className="qs-po-status">{o.status}</span></div>
                <small>{o.supplier} · {o.count} SP · {money(o.total)} đ · {o.date}</small>
                <button className="qs-qt-btn" onClick={() => exportOrder(o)}><Icon name="download" size={12} />Excel</button>
              </div>
            ))}
            {sentOpen && !orders.length && <p className="qs-po-none">Chưa gửi đơn nào.</p>}
          </div>

          <div className="qs-card qs-po-box">
            <div className="qs-po-box-head"><Icon name="gauge" size={15} /><b>Phiếu đề xuất đã gửi</b><span className="qs-bd-badge">{String(proposals.length).padStart(2, '0')}</span></div>
            {proposals.map(p => (
              <div key={p.id} className="qs-po-order">
                <div><b>{p.supplier}</b><span className="qs-po-status">Chờ duyệt</span></div>
                <small>{p.plan.length} đợt · {money(p.total)} đ · {p.date}</small>
              </div>
            ))}
            {!proposals.length && <p className="qs-po-none dashed">Chưa gửi đề xuất nào cho dự án này.</p>}
          </div>
        </div>
      </div>

      {detail && (
        <div className="qs-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setDetail(null) }}>
          <div className="qs-po-detail"><ProductInfo product={detail} onClose={() => setDetail(null)} /></div>
        </div>
      )}
      {toast && <div className="qs-qt-toast">{toast}</div>}
    </>
  )
}
