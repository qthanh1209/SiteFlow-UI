import { useEffect, useState } from 'react'

const EMPTY = { name: '', client: '', phone: '', address: '', link: '', vat: '0' }

/* Hộp thoại "Tạo dự án mới"; onSave nhận dữ liệu form khi tên dự án hợp lệ */
export default function CreateProjectModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [touched, setTouched] = useState(false)
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const nameMissing = !form.name.trim()

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(e) {
    e.preventDefault()
    setTouched(true)
    if (nameMissing) return
    onSave(form)
  }

  return (
    <div className="qs-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <form className="qs-modal" onSubmit={submit}>
        <h3 className="qs-modal-title">Tạo dự án mới</h3>
        <label className="qs-field">
          <span>Tên dự án *</span>
          <input autoFocus value={form.name} onChange={set('name')} placeholder="VD: Nhà phố anh Thành" className={touched && nameMissing ? 'invalid' : ''} />
        </label>
        <label className="qs-field"><span>Khách hàng</span><input value={form.client} onChange={set('client')} /></label>
        <label className="qs-field"><span>Số điện thoại</span><input value={form.phone} onChange={set('phone')} /></label>
        <label className="qs-field"><span>Địa chỉ</span><input value={form.address} onChange={set('address')} /></label>
        <label className="qs-field">
          <span>Link dự án trên Dezon <i>(tuỳ chọn)</i></span>
          <input value={form.link} onChange={set('link')} placeholder="https://dezon.vn/..." />
        </label>
        <label className="qs-field"><span>VAT (%)</span><input type="number" min="0" max="100" value={form.vat} onChange={set('vat')} /></label>
        <div className="qs-modal-actions">
          <button type="button" className="qs-modal-btn" onClick={onClose}>Huỷ</button>
          <button type="submit" className="qs-modal-btn primary">Lưu dự án</button>
        </div>
      </form>
    </div>
  )
}
