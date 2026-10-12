import { useEffect, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'

const ZOOMS = [50, 75, 90, 100, 110, 125, 150]
const Sep = () => <span className="qs-bd-tb-sep" />
const Btn = ({ icon, title, active, disabled, onClick, children, className = '' }) => (
  <button
    className={`qs-bd-tb-btn${active ? ' on' : ''} ${className}`}
    title={title}
    disabled={disabled}
    onMouseDown={e => e.preventDefault() /* giữ tiêu điểm ở bảng để phím tắt vẫn chạy */}
    onClick={onClick}
  >
    <Icon name={icon} size={18} />{children}
  </button>
)
/* Mục bật / tắt trong menu "⋯": bấm xong vẫn giữ menu mở để thấy trạng thái */
const TOGGLE_ICONS = ['sigma', 'table', 'filter', 'heart']
const num = n => n.toLocaleString('vi-VN', { maximumFractionDigits: 2 })

/* Thanh công cụ của bảng tính (một hàng) + thanh công thức.
   Hàng công cụ chỉ giữ thao tác hay dùng; thao tác ít dùng nằm trong menu "⋯".
   Thống kê vùng chọn (Tổng / TB / Min / Max / Đếm) hiện ở cuối thanh công thức khi chọn từ 2 ô.
   s: trạng thái hiện tại để tô nút; a: các thao tác (xem SheetBody) */
export default function SheetToolbar({ s, a, formula }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreBtnRef = useRef(null)
  const menuRef = useRef(null)
  const colorRef = useRef(null)
  const bgRef = useRef(null)
  /* Mở bảng màu của trình duyệt, neo ngay dưới nút */
  const pickColor = ref => { const el = ref.current; if (!el) return; if (el.showPicker) el.showPicker(); else el.click() }

  /* Bấm ra ngoài / Esc thì đóng menu "⋯" */
  useEffect(() => {
    if (!moreOpen) return undefined
    const onDown = e => { if (![moreBtnRef, menuRef].some(r => r.current && r.current.contains(e.target))) setMoreOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setMoreOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [moreOpen])

  /* Thao tác ít dùng: [icon, nhãn, đang bật?, thao tác, phím tắt / ghi chú] */
  const more = [
    { group: 'Định dạng' },
    ['eraser', 'Xoá định dạng', false, a.clearFmt],
    ['sigma', 'Thống kê vùng chọn', s.showStats, a.toggleStats, 'Tổng · TB · Min · Max'],
    { group: 'Hiển thị' },
    ['table', 'Đóng băng cột STT / Phòng / Tên', s.frozen, a.toggleFrozen],
    ['filter', 'Lọc theo giá trị ô đang chọn', s.colFilterOn, a.toggleColFilter],
    ['heart', 'Chỉ hiện sản phẩm yêu thích', s.favOnly, a.toggleFav],
    ['fitWidth', 'Vừa chiều rộng', false, a.fitWidth],
    ['zoomOut', 'Thu nhỏ bảng', false, a.zoomOut],
    ['history', 'Lịch sử thao tác', s.panel === 'history', () => a.togglePanel('history')],
    { group: 'Tệp' },
    ['importDown', 'Nhập dòng từ CSV', false, a.importFile],
    ['download', 'Tải xuống CSV (Excel)', false, a.download],
    ['printer', 'In bảng', false, a.print],
  ]
  /* Có bộ lọc ẩn trong menu đang bật thì chấm báo trên nút "⋯" để không bị lọc ngầm */
  const hiddenActive = s.colFilterOn || s.favOnly

  return (
    <>
      <div className="qs-bd-tb">
        <Btn icon="undo" title="Hoàn tác (Ctrl+Z)" disabled={!s.canUndo} onClick={a.undo} />
        <Btn icon="redo" title="Làm lại (Ctrl+Y)" disabled={!s.canRedo} onClick={a.redo} />
        <Sep />
        <Btn icon="scissors" title="Cắt (Ctrl+X)" onClick={a.cut} /><Btn icon="copy" title="Sao chép (Ctrl+C)" onClick={a.copy} /><Btn icon="clipboard" title="Dán (Ctrl+V)" onClick={a.paste} />
        <Sep />
        <span className="qs-bd-tb-group" title="Cỡ chữ">
          <Btn icon="minus" title="Giảm cỡ chữ" onClick={a.fontDown} />
          <span className="qs-bd-tb-size">{s.fontSize}</span>
          <Btn icon="plus" title="Tăng cỡ chữ" onClick={a.fontUp} />
        </span>
        <Btn icon="bold" title="In đậm (Ctrl+B)" active={s.fmt.b} onClick={() => a.toggleFmt('b')} />
        <Btn icon="italic" title="In nghiêng (Ctrl+I)" active={s.fmt.i} onClick={() => a.toggleFmt('i')} />
        <Btn icon="underline" title="Gạch chân (Ctrl+U)" active={s.fmt.u} onClick={() => a.toggleFmt('u')} />
        <span className="qs-bd-tb-color" style={{ '--sw': s.lastColor.color }}>
          <Btn icon="textColor" title="Màu chữ" className="swatch" onClick={() => pickColor(colorRef)} />
          <input ref={colorRef} type="color" tabIndex={-1} value={s.lastColor.color} onChange={e => a.setColor('color', e.target.value)} />
        </span>
        <span className="qs-bd-tb-color" style={{ '--sw': s.lastColor.bg }}>
          <Btn icon="droplet" title="Màu nền" className="swatch" onClick={() => pickColor(bgRef)} />
          <input ref={bgRef} type="color" tabIndex={-1} value={s.lastColor.bg} onChange={e => a.setColor('bg', e.target.value)} />
        </span>
        <Sep />
        <Btn icon="alignLeft" title="Căn trái" active={s.fmt.align === 'left'} onClick={() => a.align('left')} />
        <Btn icon="alignCenter" title="Căn giữa" active={s.fmt.align === 'center'} onClick={() => a.align('center')} />
        <Btn icon="alignRight" title="Căn phải" active={s.fmt.align === 'right'} onClick={() => a.align('right')} />
        <Btn icon="wrap" title="Xuống dòng tự động" active={!s.fmt.nowrap} onClick={a.toggleWrap} />
        <Sep />
        <Btn icon="rowInsert" title="Chèn dòng bên dưới" onClick={a.insertRow} />
        <Btn icon="rowGroup" title="Nhân bản dòng đang chọn" onClick={a.duplicate} />
        <Btn icon="trash" title="Xoá dòng đang chọn" onClick={a.deleteRows} />
        <Sep />
        <Btn icon="sortAsc" title="Sắp xếp tăng dần theo cột đang chọn" onClick={() => a.sort(1)} />
        <Btn icon="sortDesc" title="Sắp xếp giảm dần theo cột đang chọn" onClick={() => a.sort(-1)} />
        <Btn icon="search" title="Tìm trong bảng (Ctrl+F)" active={s.panel === 'find'} onClick={() => a.togglePanel('find')} />
        <Btn icon="filter" title="Lọc dòng theo từ khoá" active={s.panel === 'filter' || s.filterOn} onClick={() => a.togglePanel('filter')} />

        <span className="qs-bd-tb-spacer" />

        <Btn icon="wrap" title="Chế độ gọn: dòng thấp, chữ dài rút còn 2 dòng" active={s.compact} onClick={a.toggleCompact} className="text">Gọn</Btn>
        <label className="qs-bd-tb-zoom" title="Thu phóng bảng">
          <select value={ZOOMS.includes(s.zoom) ? s.zoom : ''} onChange={e => a.setZoom(Number(e.target.value))}>
            {!ZOOMS.includes(s.zoom) && <option value="">{s.zoom}%</option>}
            {ZOOMS.map(z => <option key={z} value={z}>{z}%</option>)}
          </select>
          <Icon name="chevronDown" size={15} />
        </label>
        <Btn icon="sliders" title="Chọn cột hiển thị" className="text" active={s.panel === 'cols'} onClick={() => a.togglePanel('cols')}>{s.cols.shown}/{s.cols.total}</Btn>
        <Btn icon="coin" title="Hiện / ẩn các cột giá" className="badged" active={s.priceShown > 0} onClick={a.togglePrice}><span className="qs-bd-tb-badge">{s.priceShown}</span></Btn>
        <span ref={moreBtnRef} className="qs-bd-tb-more"><Btn icon="listLines" title="Thêm thao tác" className={`text${hiddenActive ? ' dot' : ''}`} active={moreOpen} onClick={() => setMoreOpen(o => !o)}>Thêm</Btn></span>
        <Btn icon="maximize" title={s.full ? 'Thoát toàn màn hình' : 'Toàn màn hình'} active={s.full} onClick={a.toggleFull} />
      </div>
      {moreOpen && (
        <div className="qs-bd-tb-anchor"><div className="qs-bd-tb-menu" role="menu" ref={menuRef}>
          {more.map(m => (m.group
            ? <div key={m.group} className="qs-bd-tb-menu-cap">{m.group}</div>
            : (
              <button
                key={m[1]}
                className={m[2] ? 'on' : ''}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { m[3](); if (!TOGGLE_ICONS.includes(m[0])) setMoreOpen(false) }}
              >
                <Icon name={m[0]} size={16} /><span>{m[1]}</span>
                {m[4] && <small>{m[4]}</small>}
                {TOGGLE_ICONS.includes(m[0]) && <i className={`qs-bd-tb-switch${m[2] ? ' on' : ''}`} />}
              </button>
            )))}
        </div></div>
      )}
      <div className="qs-bd-formula">
        <span className="qs-bd-formula-ref">{formula.ref}</span>
        <span className="qs-bd-formula-fx">fx</span>
        <input
          className="qs-bd-formula-value"
          placeholder="Chọn 1 ô để xem / sửa nội dung"
          value={formula.value}
          readOnly={!formula.editable}
          onFocus={formula.onFocus}
          onChange={e => formula.onChange(e.target.value)}
          onKeyDown={formula.onKeyDown}
          onBlur={formula.onBlur}
        />
        {s.showStats && s.stats && (
          <span className="qs-bd-tb-stats" title="Thống kê vùng đang chọn">
            {s.stats.sum !== 0 || s.stats.max !== 0 ? (
              <>
                <span>Tổng <b>{num(s.stats.sum)}</b></span><span>TB <b>{num(s.stats.avg)}</b></span>
                <span>Min <b>{num(s.stats.min)}</b></span><span>Max <b>{num(s.stats.max)}</b></span>
              </>
            ) : null}
            <span>Đếm <b>{s.stats.count}</b></span>
          </span>
        )}
      </div>
    </>
  )
}
