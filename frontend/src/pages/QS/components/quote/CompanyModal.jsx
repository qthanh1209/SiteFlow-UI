import { useEffect, useState } from 'react'
import Icon from '../../../../components/ui/Icon'

const FIELDS = [
  ['name', 'Tên hiển thị'],
  ['logo', 'Link logo (để trống = logo của công ty)', 'https://...'],
  ['address', 'Địa chỉ'],
  ['phone', 'Điện thoại'],
  ['email', 'Email'],
  ['website', 'Website'],
  ['extra', 'Dòng thêm (xưởng, MST...)'],
]

/* Hộp thoại "Thông tin công ty trên báo giá". value: { name, logo, address, phone, email, website, extra };
   onSave nhận bản đã cắt khoảng trắng */
export default function CompanyModal({ value, onClose, onSave }) {
  const [form, setForm] = useState(value)
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(e) {
    e.preventDefault()
    onSave(Object.fromEntries(FIELDS.map(([key]) => [key, form[key].trim()])))
  }

  return (
    <div className="qs-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <form className="qs-modal" onSubmit={submit}>
        <div className="qs-modal-head">
          <h3 className="qs-modal-title">Thông tin công ty trên báo giá</h3>
          <button type="button" title="Đóng" onClick={onClose}><Icon name="x" size={15} /></button>
        </div>
        <p className="qs-modal-note">Áp dụng cho mọi báo giá của công ty. Ô nào để trống thì không in.</p>
        {FIELDS.map(([key, label, placeholder], i) => (
          <label key={key} className="qs-field">
            <span>{label}</span>
            <input autoFocus={i === 0} value={form[key]} onChange={set(key)} placeholder={placeholder} />
          </label>
        ))}
        <div className="qs-modal-actions">
          <button type="button" className="qs-modal-btn" onClick={onClose}>Huỷ</button>
          <button type="submit" className="qs-modal-btn primary">Lưu</button>
        </div>
      </form>
    </div>
  )
}
