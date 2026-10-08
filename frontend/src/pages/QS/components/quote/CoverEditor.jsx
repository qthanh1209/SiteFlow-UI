import Icon from '../../../../components/ui/Icon'
import { coverAmount, quoteId, quoteMoney } from '../../../../data/qsQuoteData'

const pct = (n, total) => `${total ? ((n / total) * 100).toFixed(2) : '0.00'}%`
const INFO_ROWS = [
  [['client', 'Khách hàng'], ['scale', 'Quy mô']],
  [['areaTotal', 'Tổng diện tích XD (m²)'], ['need', 'Nhu cầu']],
  [[null, 'DT báo giá [đã nhân hệ số] (m²)'], ['segment', 'Phân khúc']],
]

/* Chế độ "Chỉnh sửa": chọn mục hiện trên tờ bìa + sửa trực tiếp nội dung tờ bìa.
   sections / onSections: các mục lớn của tờ bìa; info / onInfo: thông tin dự án; sheetTotal: tạm tính từ Bóc tách */
export default function CoverEditor({ sections, onSections, info, onInfo, code, onCode, quoteArea, sheetTotal, total, template, onTemplate, onLoadTemplate, onSave }) {
  const patchSection = (id, patch) => onSections(sections.map(s => (s.id === id ? { ...s, ...patch } : s)))
  const patchItem = (sid, iid, patch) => onSections(sections.map(s => (s.id === sid ? { ...s, items: s.items.map(it => (it.id === iid ? { ...it, ...patch } : it)) } : s)))
  /* Đổi số ở ô No rồi rời ô: các mục lớn tự xếp lại theo số */
  const renumber = (id, text) => {
    const no = Number(text.replace(',', '.'))
    if (!Number.isFinite(no) || no <= 0) return
    onSections(sections.map(s => (s.id === id ? { ...s, no } : s)).sort((a, b) => a.no - b.no))
  }
  const addSection = () => onSections([...sections, { id: quoteId(), no: Math.max(0, ...sections.map(s => Math.floor(s.no))) + 1, name: 'Mục mới', on: true, items: [{ id: quoteId(), name: 'Mục nhỏ', desc: '', amount: null }] }])
  /* Mục nhỏ mới thêm vào mục lớn đang bật cuối cùng */
  const addItem = () => {
    const last = [...sections].reverse().find(s => s.on)
    if (last) patchSection(last.id, { items: [...last.items, { id: quoteId(), name: 'Mục nhỏ', desc: '', amount: null }] })
  }
  const removeItem = (s, iid) => {
    const items = s.items.filter(it => it.id !== iid)
    onSections(items.length ? sections.map(x => (x.id === s.id ? { ...x, items } : x)) : sections.filter(x => x.id !== s.id))
  }
  const resetAuto = () => onSections(sections.map(s => ({ ...s, items: s.items.map(it => (it.src ? { ...it, amount: null } : it)) })))
  const shown = sections.filter(s => s.on)

  return (
    <>
      <div className="qs-card qs-qt-card">
        <div className="qs-qt-card-head"><span className="qs-qt-card-icon"><Icon name="listLines" size={15} /></span><b>Chọn mục hiện trên tờ bìa</b></div>
        <div className="qs-qt-card-body">
          <p className="qs-qt-note">Bỏ chọn mục nào thì mục đó ẩn khỏi tờ bìa.</p>
          <div className="qs-qt-toggles">
            {sections.map(s => <button key={s.id} className={s.on ? 'on' : ''} onClick={() => patchSection(s.id, { on: !s.on })}>{s.name}</button>)}
          </div>
        </div>
      </div>

      <div className="qs-card qs-qt-card">
        <div className="qs-qt-card-head">
          <span className="qs-qt-card-icon"><Icon name="fileText" size={15} /></span>
          <b>Tờ bìa — Ước tính chi phí dự án</b><span className="qs-qt-sub">bấm thẳng vào ô để sửa</span>
          <span style={{ flex: 1 }} />
          <div className="qs-qt-seg">
            <button className={template === 1 ? 'on' : ''} onClick={() => onTemplate(1)}>Mẫu 1</button>
            <button className={template === 2 ? 'on' : ''} onClick={() => onTemplate(2)}>Mẫu 2</button>
          </div>
          <button className="qs-qt-btn" title="Đưa tờ bìa về mẫu ban đầu" onClick={onLoadTemplate}><Icon name="refresh" size={13} />Nạp mẫu</button>
          <button className="qs-qt-btn" title="Bỏ các số đã gõ tay ở những dòng tự động" onClick={resetAuto}><Icon name="download" size={13} />Lấy lại số từ bóc tách</button>
          <button className="qs-qt-btn green" onClick={onSave}><Icon name="check" size={13} stroke={2.4} />Lưu tờ bìa</button>
        </div>
        <div className="qs-qt-card-body">
          <div className="qs-qt-ed">
            <div className="qs-qt-ed-title">
              <b>BẢNG ƯỚC TÍNH CHI PHÍ DỰ ÁN</b>
              <span>[Tư vấn thiết kế, thi công chuyên nghiệp]</span>
              <label>Mã báo giá số : <input value={code} onChange={e => onCode(e.target.value)} /></label>
            </div>
            <div className="qs-qt-ed-info">
              {INFO_ROWS.map(row => row.map(([key, label]) => (
                <div key={label} className="qs-qt-ed-field">
                  <span>{label}</span>
                  {key ? <input value={info[key]} onChange={e => onInfo({ ...info, [key]: e.target.value })} /> : <input value={quoteArea || ''} readOnly title="Tính từ Bảng tính diện tích (hệ số) bên dưới" />}
                </div>
              )))}
            </div>
            <table className="qs-qt-ed-table">
              <thead>
                <tr><th className="c">No</th><th>Hạng mục</th><th>Nội dung</th><th className="r">Chi phí dự kiến</th><th className="r">Tỷ trọng</th><th>Mô tả</th><th /></tr>
              </thead>
              <tbody>
                {shown.map(s => s.items.map((it, i) => {
                  const amount = coverAmount(it, s, sheetTotal)
                  const auto = it.amount === null && (it.src || it.agg)
                  return (
                    <tr key={it.id} className={i === 0 ? 'first' : ''}>
                      {i === 0 && (
                        <td className="c" rowSpan={s.items.length}>
                          <input className="c no" key={s.no} defaultValue={s.no} onBlur={e => renumber(s.id, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }} />
                        </td>
                      )}
                      {i === 0 && <td rowSpan={s.items.length}><input className="sec" value={s.name} onChange={e => patchSection(s.id, { name: e.target.value })} /></td>}
                      <td><input value={it.name} onChange={e => patchItem(s.id, it.id, { name: e.target.value })} /></td>
                      <td className="r">
                        {it.agg
                          ? <span className="qs-qt-ed-num">{quoteMoney(amount)}</span>
                          : (
                            <input
                              className="r" inputMode="numeric" value={quoteMoney(amount)}
                              onChange={e => { const n = Number(e.target.value.replace(/\D/g, '')); patchItem(s.id, it.id, { amount: e.target.value.trim() === '' && it.src ? null : n }) }}
                            />
                          )}
                        {auto && it.src && <i className="qs-qt-auto">tự động</i>}
                      </td>
                      <td className="r pct">{pct(amount, total)}</td>
                      <td><input className="desc" value={it.desc} onChange={e => patchItem(s.id, it.id, { desc: e.target.value })} /></td>
                      <td className="c"><button className="qs-qt-del" title="Xoá dòng này" onClick={() => removeItem(s, it.id)}><Icon name="x" size={12} /></button></td>
                    </tr>
                  )
                }))}
                {!shown.length && <tr><td colSpan={7} className="c empty">Chưa chọn mục nào để hiện trên tờ bìa.</td></tr>}
              </tbody>
              <tfoot>
                <tr><td colSpan={3} className="r">TỔNG CHI PHÍ DỰ KIẾN (VND)</td><td className="r">{quoteMoney(total)}</td><td colSpan={3} /></tr>
              </tfoot>
            </table>
          </div>
          <div className="qs-qt-ed-actions">
            <button className="qs-qt-btn" onClick={addSection}><Icon name="plus" size={12} />Thêm mục lớn</button>
            <button className="qs-qt-btn" onClick={addItem}><Icon name="plus" size={12} />Thêm mục nhỏ</button>
            <span className="qs-qt-note">Sửa số ở ô No (vd gõ 1.4) — dòng tự về đúng thứ tự.</span>
          </div>
        </div>
      </div>
    </>
  )
}
