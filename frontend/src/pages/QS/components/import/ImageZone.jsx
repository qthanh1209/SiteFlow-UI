import { useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'

/* Ô chọn ảnh: kéo/thả, bấm để chọn file, dán link. images: [{ id, src, name }]; multiple = nhận nhiều ảnh.
   onHover: báo cho form biết ô nào đang được trỏ tới để Ctrl+V dán ảnh vào đúng ô */
export default function ImageZone({ label, tag, hint, multiple, images, onFiles, onLink, onRemove, onHover, invalid }) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)
  const [link, setLink] = useState('')

  function addLink(e) {
    e.preventDefault()
    if (!link.trim()) return
    onLink(link.trim())
    setLink('')
  }

  return (
    <div className="qs-im-zone" onMouseEnter={onHover}>
      <div className="qs-im-zone-label">{label}<span className="qs-im-tag">{tag}</span></div>
      <div
        className={`qs-im-drop${over ? ' over' : ''}${invalid ? ' invalid' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); onFiles([...e.dataTransfer.files]) }}
      >
        {images.length ? (
          <div className="qs-im-thumbs">
            {images.map(img => (
              <div key={img.id} className="qs-im-thumb" title={img.name}>
                <img src={img.src} alt={img.name} />
                <button title="Bỏ ảnh này" onClick={e => { e.stopPropagation(); onRemove(img.id) }}><Icon name="x" size={11} stroke={3} /></button>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Icon name="scan" size={20} />
            <b>Kéo/thả hoặc bấm để chọn</b>
            <span>{hint}</span>
            <span className="qs-im-paste"><Icon name="copy" size={12} />hoặc dán ảnh bằng Ctrl+V</span>
          </>
        )}
        <input
          ref={inputRef} type="file" hidden accept="image/jpeg,image/png,image/webp" multiple={multiple}
          onChange={e => { onFiles([...e.target.files]); e.target.value = '' }}
        />
      </div>
      <form className="qs-im-link" onSubmit={addLink}>
        <Icon name="link" size={15} />
        <input value={link} onChange={e => setLink(e.target.value)} placeholder="Dán link ảnh..." />
        <button type="submit">Thêm</button>
      </form>
    </div>
  )
}
