import Icon from '../../../../components/ui/Icon'

let seq = 0
const nextId = () => { seq += 1; return `sg${seq}` }
const newItem = () => ({ id: nextId(), text: '', saved: false })
/* Một đề mục lớn mới với 4 ô đề mục nhỏ trống */
export const newSpecGroup = () => ({ id: nextId(), title: '', items: [newItem(), newItem(), newItem(), newItem()] })
/* Chỉ giữ đề mục có nội dung để lưu kèm công tác */
export const filledSpecGroups = groups => groups
  .map(g => ({ title: g.title.trim(), items: g.items.map(it => it.text.trim()).filter(Boolean) }))
  .filter(g => g.title || g.items.length)

const insertAfter = (list, id, item) => list.flatMap(x => (x.id === id ? [x, item] : [x]))

/* Thông số kỹ thuật tự do của công tác: nhiều "đề mục lớn", mỗi đề mục lớn gồm các ô "đề mục nhỏ".
   groups: [{ id, title, items: [{ id, text, saved }] }] */
export default function SpecGroups({ groups, onChange }) {
  const patchGroup = (id, patch) => onChange(groups.map(g => (g.id === id ? { ...g, ...patch } : g)))
  const patchItem = (g, itemId, patch) => patchGroup(g.id, { items: g.items.map(it => (it.id === itemId ? { ...it, ...patch } : it)) })

  return groups.map(g => (
    <div key={g.id} className="qs-card qs-im-sec">
      <div className="qs-im-sec-head">
        <span className="qs-im-sec-ico"><Icon name="fileText" size={17} /></span>
        <input className="qs-im-sg-title" value={g.title} placeholder="Đề mục lớn — VD: Thông số kỹ thuật tham khảo" onChange={e => patchGroup(g.id, { title: e.target.value })} />
        <button className="qs-im-round" title="Thêm đề mục lớn" onClick={() => onChange(insertAfter(groups, g.id, newSpecGroup()))}>+</button>
        {groups.length > 1 && <button className="qs-im-sg-del" onClick={() => onChange(groups.filter(x => x.id !== g.id))}>Xoá</button>}
      </div>
      <div className="qs-im-sec-body">
        <p className="qs-im-note">Thông số kỹ thuật của công tác — đặt tên đề mục lớn, mỗi ô đề mục nhỏ 1 thông tin (VD Lực ép tối đa: 90 tấn). Bấm + để thêm.</p>
        <div className="qs-im-grid">
          {g.items.map(it => (
            <div key={it.id} className="qs-im-field">
              <label>Đề mục nhỏ<button className="qs-im-round" title="Thêm đề mục nhỏ" onClick={() => patchGroup(g.id, { items: insertAfter(g.items, it.id, newItem()) })}>+</button></label>
              <div className="qs-im-sg-item">
                <textarea value={it.text} placeholder="Nhập thông tin đề mục nhỏ — VD: Lực ép tối đa: 90 tấn" onChange={e => patchItem(g, it.id, { text: e.target.value, saved: false })} />
                <button className={it.saved ? 'saved' : ''} disabled={!it.text.trim()} onClick={() => patchItem(g, it.id, { saved: true })}>{it.saved ? 'Đã lưu' : 'Lưu'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ))
}
