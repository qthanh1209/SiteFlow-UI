import Icon from '../../../../components/ui/Icon'

/* Cột phải: sản phẩm / công tác đã đưa vào danh sách chờ trong phiên này + nút lưu vào Database.
   industry: ngành đang chọn (quyết định cách gọi và tiêu đề cột); Noun: cách gọi viết hoa chữ đầu */
export default function SessionPanel({ industry, Noun, items, onEdit, onSave, onGotoCatalog }) {
  const pending = items.filter(it => !it.saved).length
  const brandCol = industry.brandCol || { key: 'brand', label: 'Thương hiệu' }
  return (
    <div className="qs-card qs-im-side">
      <div className="qs-im-side-head">
        <b>{Noun} vừa nhập (phiên này)</b>
        <span className="qs-im-side-count">{String(items.length).padStart(2, '0')}</span>
      </div>
      <p className="qs-im-side-note">
        Danh sách này chỉ ghi lại thao tác của <b>phiên đang mở</b> — tải lại trang sẽ trống. {Noun} đã lưu <b>vẫn nằm trong Database</b>:{' '}
        <button onClick={onGotoCatalog}>xem Danh sách sản phẩm →</button>
      </p>
      <div className="qs-im-side-table">
        <table>
          <thead>
            <tr><th>Sửa</th><th>STT</th><th>{industry.nameLabel || 'Tên sản phẩm'}</th><th>Hình ảnh</th><th>{brandCol.label}</th><th>Ngày cập nhật</th></tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id} className={it.saved ? 'saved' : ''}>
                <td>
                  {it.saved
                    ? <span className="qs-im-saved" title="Đã lưu vào Database"><Icon name="check" size={13} stroke={3} /></span>
                    : <button title="Sửa lại trong form" onClick={() => onEdit(it)}><Icon name="edit" size={13} /></button>}
                </td>
                <td>{i + 1}</td>
                <td className="name" title={it.form.name}>{it.form.name}<small>{it.form.code}</small></td>
                <td>{it.image ? <img src={it.image.src} alt="" /> : '—'}</td>
                <td>{it.form[brandCol.key]}</td>
                <td>{it.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <div className="qs-im-side-empty">
            Chưa nhập {industry.noun} nào trong phiên này.<br />
            {Noun} bạn <b>thêm / nhập file</b> sẽ hiện ở đây — bấm <b>Thêm {industry.noun}</b> để lưu vào Database.
          </div>
        )}
      </div>
      <button className="qs-im-save" disabled={!pending} onClick={onSave}>
        <Icon name="plus" size={16} />Thêm {industry.noun}{pending ? ` (${pending})` : ''}
      </button>
    </div>
  )
}
