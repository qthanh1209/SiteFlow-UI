import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../../components/ui/Icon'
import ImageZone from './import/ImageZone'
import SessionPanel from './import/SessionPanel'
import IndustryPicker from './import/IndustryPicker'
import ComboField from './import/ComboField'
import SpecGroups, { newSpecGroup, filledSpecGroups } from './import/SpecGroups'
import { CATALOG } from '../../../data/qsBreakdownData'
import { DASH_PROJECTS } from '../../../data/qsDashboardData'
import {
  IMPORT_INDUSTRIES, IMPORT_DOC_KINDS, IMAGE_TYPES, IMAGE_MAX_BYTES,
  findIndustry, industryFields, sectionFields, emptyImportForm, emptyDocs, emptyVariants, variantCombos, toNumber, importTemplateCsv, parseImportCsv,
} from '../../../data/qsImportData'

let seq = 0
const nextId = prefix => { seq += 1; return `${prefix}${seq}` }
const today = () => new Date().toLocaleDateString('vi-VN')

function SectionCard({ icon, title, right, note, children }) {
  return (
    <div className="qs-card qs-im-sec">
      <div className="qs-im-sec-head">
        <span className="qs-im-sec-ico"><Icon name={icon} size={17} /></span>
        <h3>{title}</h3>
        <span style={{ flex: 1 }} />
        {right}
      </div>
      <div className="qs-im-sec-body">
        {note && <p className="qs-im-note">{note}</p>}
        {children}
      </div>
    </div>
  )
}

/* Dòng xem trước của công tác trong bảng bóc tách: số lượng mặc định × giá bán lẻ */
function RowPreview({ form }) {
  const qty = toNumber(form.defaultQty)
  const price = toNumber(form.retail)
  const money = n => `${n.toLocaleString('vi-VN')} đ`
  return (
    <div className="qs-im-rowprev">
      <small>Dòng trong bảng</small>
      <b>{qty} {form.unit || '—'} × {money(price)} = {money(qty * price)}</b>
      <span>{form.dealer === '' ? 'Chưa nhập giá vốn' : `Giá vốn ${money(toNumber(form.dealer))}`}</span>
    </div>
  )
}

/* Màn "Nhập dữ liệu": form nhập một sản phẩm (kèm biến thể) hoặc nhập hàng loạt từ CSV → danh sách chờ → lưu.
   active: tab đang hiển thị (chỉ khi đó mới bắt Ctrl+V để dán ảnh) */
export default function ImportTab({ active, onGoto }) {
  const [industry, setIndustry] = useState(IMPORT_INDUSTRIES[0].key)
  const [form, setForm] = useState(emptyImportForm)
  const [mainImg, setMainImg] = useState(null)
  const [detailImgs, setDetailImgs] = useState([])
  const [docs, setDocs] = useState(emptyDocs)
  const [docLinks, setDocLinks] = useState({})
  const [combo, setCombo] = useState([])
  const [comboQuery, setComboQuery] = useState('')
  const [variants, setVariants] = useState(emptyVariants)
  const [enroll, setEnroll] = useState({ projectId: DASH_PROJECTS[0].id, qty: 1, on: false })
  const [items, setItems] = useState([])
  /* Giá trị người dùng thêm bằng nút + của các ô vừa gõ vừa chọn, theo key của trường */
  const [extraOptions, setExtraOptions] = useState({})
  const [specGroups, setSpecGroups] = useState(() => [newSpecGroup()])
  const [errors, setErrors] = useState([])
  const [message, setMessage] = useState(null)
  const pasteZone = useRef('main')
  const rootRef = useRef(null)

  const current = findIndustry(industry)
  const saved = items.filter(it => it.saved)
  const Noun = current.noun[0].toUpperCase() + current.noun.slice(1)
  const stats = current.stats ? current.stats(saved) : [
    [saved.length, 'Số lượng SKU đã nhập'],
    [new Set(saved.map(it => it.form.brand).filter(Boolean)).size, 'Số lượng Brand'],
    [new Set(saved.map(it => it.form.supplier).filter(Boolean)).size, 'Số lượng nhà cung cấp'],
  ]

  const setField = (key, value) => {
    setForm(f => {
      const next = { ...f, [key]: value }
      return current.derive ? { ...next, ...current.derive(next, key) } : next
    })
    setErrors(e => e.filter(k => k !== key))
  }
  const notify = (text, error = false) => setMessage({ text, error })
  /* Đổi ngành hàng: các khối trường đổi theo, giá trị của trường dùng chung (thương hiệu, giá...) được giữ lại */
  function pickIndustry(key) {
    const next = findIndustry(key)
    const category = industryFields(next).find(f => f.key === 'category')
    setForm(f => {
      const patch = {}
      /* Ngành mới chọn Hạng mục từ danh sách cố định: bỏ giá trị đang có nếu không nằm trong danh sách đó */
      if (category.type === 'select' && !category.options.includes(f.category)) patch.category = ''
      /* Điền giá trị mặc định của ngành mới vào những ô còn trống */
      Object.entries(next.defaults || {}).forEach(([k, v]) => { if (!(k in patch ? patch[k] : f[k])) patch[k] = v })
      return { ...f, ...patch }
    })
    setIndustry(key)
    setErrors([])
    setMessage(null)
  }

  /* ---------- Ảnh ---------- */
  function addImages(zone, list) {
    if (!list.length) return
    if (zone === 'main') { setMainImg(list[0]); setErrors(e => e.filter(k => k !== 'mainImg')) } else setDetailImgs(imgs => [...imgs, ...list])
  }
  function addFiles(zone, files) {
    const ok = files.filter(f => IMAGE_TYPES.includes(f.type) && f.size <= IMAGE_MAX_BYTES)
    if (ok.length < files.length) notify('Chỉ nhận ảnh JPG · PNG · WEBP, tối đa 5MB mỗi ảnh.', true)
    addImages(zone, ok.map(f => ({ id: nextId('img'), src: URL.createObjectURL(f), name: f.name })))
  }
  const addLink = (zone, url) => addImages(zone, [{ id: nextId('img'), src: url, name: url }])

  /* Ctrl+V: dán ảnh từ clipboard vào ô ảnh vừa trỏ chuột tới */
  useEffect(() => {
    if (!active) return undefined
    const onPaste = e => {
      const files = [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'))
      if (!files.length) return
      e.preventDefault()
      addFiles(pasteZone.current, files)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [active])

  /* ---------- Tài liệu ---------- */
  const addDoc = (kind, doc) => setDocs(d => ({ ...d, [kind]: [...d[kind], { id: nextId('doc'), ...doc }] }))
  function addDocLink(kind) {
    const url = (docLinks[kind] || '').trim()
    if (!url) return
    addDoc(kind, { name: url, link: true })
    setDocLinks(l => ({ ...l, [kind]: '' }))
  }

  /* ---------- Sản phẩm đi kèm ---------- */
  const comboResults = useMemo(() => {
    const k = comboQuery.trim().toLowerCase()
    if (!k) return []
    return CATALOG.filter(c => !combo.includes(c.id) && (c.name.toLowerCase().includes(k) || c.brand.toLowerCase().includes(k) || c.id.includes(k))).slice(0, 6)
  }, [comboQuery, combo])

  /* ---------- Danh sách chờ ---------- */
  function resetForm() {
    setForm({ ...emptyImportForm(), ...current.defaults })
    setSpecGroups([newSpecGroup()])
    setMainImg(null)
    setDetailImgs([])
    setDocs(emptyDocs())
    setDocLinks({})
    setCombo([])
    setComboQuery('')
    setVariants(emptyVariants())
    setErrors([])
  }

  function queue() {
    const missing = industryFields(current, form).filter(f => f.req && !String(form[f.key]).trim()).map(f => f.key)
    if (!mainImg && !current.imageOptional) missing.push('mainImg')
    if (missing.length) {
      setErrors(missing)
      notify(`Còn ${missing.length} mục bắt buộc chưa nhập — các ô được tô đỏ.`, true)
      const first = rootRef.current.querySelector('.invalid')
      if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    const project = enroll.on ? DASH_PROJECTS.find(p => p.id === enroll.projectId) : null
    const added = variantCombos(current, variants).map(v => ({
      id: nextId('it'), form: { ...form, ...v }, image: mainImg, date: today(), saved: false,
      specs: current.sections.some(s => s.custom === 'specGroups') ? filledSpecGroups(specGroups) : [],
      project: project ? { name: project.name, qty: enroll.qty } : null,
    }))
    setItems(list => [...list, ...added])
    resetForm()
    notify(`Đã đưa ${added.length} ${current.noun} vào danh sách chờ — bấm "Thêm ${current.noun}" để lưu.`)
  }

  /* Sửa: đưa sản phẩm đang chờ trở lại form */
  function editItem(it) {
    setItems(list => list.filter(x => x.id !== it.id))
    setForm({ ...emptyImportForm(), ...it.form })
    setMainImg(it.image)
    setErrors([])
    setMessage(null)
    rootRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  function saveAll() {
    const count = items.filter(it => !it.saved).length
    setItems(list => list.map(it => ({ ...it, saved: true })))
    notify(`Đã lưu ${count} mục.`)
  }

  /* ---------- Nhập hàng loạt ---------- */
  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([importTemplateCsv(current)], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `mau-nhap-${current.key}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  async function importFile(file) {
    if (!file) return
    const forms = parseImportCsv(current, await file.text()).filter(f => f.name)
    if (!forms.length) { notify('Không đọc được dòng nào — hãy dùng file mẫu (CSV) của đúng ngành hàng và điền cột tên.', true); return }
    setItems(list => [...list, ...forms.map(f => ({ id: nextId('it'), form: f, image: null, date: today(), saved: false, project: null }))])
    notify(`Đã đưa ${forms.length} ${current.noun} từ file vào danh sách chờ.`)
  }

  function renderField(f) {
    const invalid = errors.includes(f.key)
    const common = { className: invalid ? 'invalid' : '', placeholder: f.ph || f.label }
    let control
    if (f.type === 'computed') {
      control = <input className="computed" readOnly placeholder={f.ph} value={f.compute(form) === null ? '' : f.compute(form).toLocaleString('vi-VN')} />
    } else if (f.type === 'select') {
      control = (
        <select className={common.className} value={form[f.key]} onChange={e => setField(f.key, e.target.value)}>
          {f.ph && <option value="">{f.ph}</option>}
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    } else if (f.type === 'combo') {
      control = (
        <ComboField
          value={form[f.key]} placeholder={common.placeholder} invalid={invalid}
          options={[...f.options, ...(extraOptions[f.key] || [])]}
          onChange={v => setField(f.key, v)}
          onAdd={v => setExtraOptions(all => ({ ...all, [f.key]: [...(all[f.key] || []), v] }))}
        />
      )
    } else if (f.type === 'textarea') {
      control = <textarea {...common} value={form[f.key]} onChange={e => setField(f.key, e.target.value)} />
    } else {
      control = <input {...common} inputMode={f.type ? 'decimal' : undefined} value={form[f.key]} onChange={e => setField(f.key, f.type ? e.target.value.replace(/[^\d.]/g, '') : e.target.value)} />
    }
    return (
      <div key={f.key} className="qs-im-field">
        <label>{f.label}{f.req && <span className="qs-im-req"> *</span>}</label>
        {f.suffix ? <div className="qs-im-sfx">{control}<span>{f.suffix}</span></div> : control}
        {f.hint && <p className="qs-im-hint">{f.hint}</p>}
      </div>
    )
  }

  return (
    <div className="qs-im" ref={rootRef}>
      <div className="qs-card qs-im-bar">
        <span className="qs-im-bar-label">Ngành hàng <small>[{current.count}]</small></span>
        <IndustryPicker options={IMPORT_INDUSTRIES} value={industry} onPick={pickIndustry} />
        {stats.map(([value, label]) => (
          <div key={label} className="qs-im-stat"><b>{value}</b><span>{label}</span></div>
        ))}
      </div>

      <div className="qs-im-body">
        <div className="qs-im-main">
          <SectionCard icon="scan" title={`Ảnh ${current.noun}`} right={<span className="qs-im-sec-right"><Icon name="scan" size={13} />JPG · PNG · WEBP · tối đa 5MB</span>}>
            <div className="qs-im-zones">
              <ImageZone
                label="Hình đại diện" tag={current.imageOptional ? 'tuỳ chọn' : 'bắt buộc'} hint={<>ảnh chính hiện trong bảng &amp; báo giá — <b>chỉ 1 ảnh</b></>}
                images={mainImg ? [mainImg] : []} invalid={errors.includes('mainImg')}
                onFiles={files => addFiles('main', files)} onLink={url => addLink('main', url)} onRemove={() => setMainImg(null)}
                onHover={() => { pasteZone.current = 'main' }}
              />
              <ImageZone
                label={`Hình chi tiết ${current.noun}`} tag="tuỳ chọn" hint={<>chọn được <b>nhiều ảnh</b> cùng lúc</>} multiple
                images={detailImgs}
                onFiles={files => addFiles('detail', files)} onLink={url => addLink('detail', url)} onRemove={id => setDetailImgs(imgs => imgs.filter(x => x.id !== id))}
                onHover={() => { pasteZone.current = 'detail' }}
              />
            </div>
          </SectionCard>

          {current.sections.map(s => {
            if (s.custom === 'specGroups') return <SpecGroups key={s.key} groups={specGroups} onChange={setSpecGroups} />
            const fields = sectionFields(s, form)
            return (
              <SectionCard key={s.key} icon={s.icon} title={s.title} note={s.note}>
                {fields.length
                  ? <div className="qs-im-grid">{fields.map(renderField)}</div>
                  : <div className="qs-im-empty">Chọn <b>Hạng mục</b> ở phần Thông tin cơ bản để hiện đúng thông số của hạng mục đó.</div>}
                {s.footer === 'rowPreview' && <RowPreview form={form} />}
              </SectionCard>
            )
          })}

          <SectionCard icon="fileText" title="Tài liệu" note={current.docs?.note || 'Tải file lên (PDF, ảnh, bản vẽ DWG/DXF, ZIP...) hoặc dán link — hiện thành nút mở trong Thông tin sản phẩm.'}>
            <div className="qs-im-grid">
              {IMPORT_DOC_KINDS.map(k => (
                <div key={k.key} className="qs-im-field">
                  <label>{current.docs?.labels?.[k.key] || k.label}</label>
                  <div className="qs-im-doc-row">
                    <input
                      value={docLinks[k.key] || ''} placeholder="Dán link rồi Enter"
                      onChange={e => setDocLinks(l => ({ ...l, [k.key]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') addDocLink(k.key) }}
                    />
                    <button onClick={() => addDocLink(k.key)}>Thêm link</button>
                    <label className="qs-im-upload">
                      <Icon name="upload" size={14} />Tải file
                      <input type="file" hidden multiple onChange={e => { [...e.target.files].forEach(f => addDoc(k.key, { name: f.name })); e.target.value = '' }} />
                    </label>
                  </div>
                  {docs[k.key].map(d => (
                    <span key={d.id} className="qs-im-chip" title={d.name}>
                      <Icon name={d.link ? 'link' : 'file'} size={12} /><span>{d.name}</span>
                      <button title="Bỏ" onClick={() => setDocs(all => ({ ...all, [k.key]: all[k.key].filter(x => x.id !== d.id) }))}><Icon name="x" size={11} stroke={3} /></button>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon="layers" title="Sản phẩm đi kèm (combo)" note="Chọn các sản phẩm luôn bán / lắp cùng sản phẩm này (VD bồn cầu + nắp rửa + vòi xịt). Lưu cùng lúc khi bấm Thêm sản phẩm.">
            <div className="qs-im-combo">
              <input value={comboQuery} onChange={e => setComboQuery(e.target.value)} placeholder="Tìm theo tên, mã hoặc thương hiệu..." />
              {comboQuery.trim() && (
                <div className="qs-im-combo-menu">
                  {comboResults.map(c => (
                    <button key={c.id} onClick={() => { setCombo(ids => [...ids, c.id]); setComboQuery('') }}>
                      <b>{c.name}</b><small>{c.brand}</small>
                    </button>
                  ))}
                  {!comboResults.length && <span>Không tìm thấy sản phẩm phù hợp.</span>}
                </div>
              )}
            </div>
            {combo.length ? (
              <div className="qs-im-combo-list">
                {combo.map(id => {
                  const c = CATALOG.find(x => x.id === id)
                  return (
                    <span key={id} className="qs-im-chip" title={c.name}>
                      <Icon name="layers" size={12} /><span>{c.name}</span>
                      <button title="Bỏ" onClick={() => setCombo(ids => ids.filter(x => x !== id))}><Icon name="x" size={11} stroke={3} /></button>
                    </span>
                  )
                })}
              </div>
            ) : <p className="qs-im-note end">Chưa chọn sản phẩm đi kèm — gõ tên / mã ở ô trên.</p>}
          </SectionCard>

          {current.variants.length > 0 && (
          <SectionCard icon="sliders" title="Nhập biến thể (tuỳ chọn)" note="Nhập nhiều giá trị cách nhau bằng dấu phẩy — hệ thống tạo 1 sản phẩm cho MỖI tổ hợp (cùng mã SP, khác thông số).">
            <div className="qs-im-grid">
              {current.variants.map(v => (
                <div key={v.key} className="qs-im-field">
                  <label>{v.label}</label>
                  <input value={variants[v.key]} placeholder={v.ph} onChange={e => setVariants(all => ({ ...all, [v.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <p className="qs-im-note end">Bỏ trống = chỉ tạo 1 sản phẩm theo thông số đã nhập ở trên.</p>
          </SectionCard>
          )}

          <SectionCard icon="building" title="Ghi danh vào dự án" note="Tuỳ chọn — đưa sản phẩm này vào một dự án ngay sau khi lưu vào Database.">
            <div className="qs-im-grid">
              <div className="qs-im-field">
                <label>Dự án</label>
                <select value={enroll.projectId} onChange={e => setEnroll(x => ({ ...x, projectId: e.target.value }))}>
                  {DASH_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="qs-im-field">
                <label>Số lượng</label>
                <input type="number" min="1" value={enroll.qty} onChange={e => setEnroll(x => ({ ...x, qty: Math.max(1, Number(e.target.value) || 1) }))} />
              </div>
            </div>
            <label className="qs-im-check">
              <input type="checkbox" checked={enroll.on} onChange={e => setEnroll(x => ({ ...x, on: e.target.checked }))} />
              Thêm sản phẩm này vào dự án đã chọn sau khi lưu
            </label>
          </SectionCard>

          {message && <div className={`qs-im-msg${message.error ? ' error' : ''}`}>{message.text}</div>}
          <button className="qs-im-queue" onClick={queue}>Đưa vào danh sách chờ</button>
          <button className="qs-im-reset" onClick={() => { resetForm(); setMessage(null) }}>Xoá form</button>

          <SectionCard icon="download" title="Nhập hàng loạt từ file" note="Tải file mẫu → điền dữ liệu → chọn file lên. Hệ thống tự dò cột theo tiêu đề rồi đưa vào danh sách chờ — bấm Thêm sản phẩm để lưu.">
            <div className="qs-im-file-row">
              <button className="qs-im-template" onClick={downloadTemplate}><Icon name="download" size={14} />Tải file mẫu</button>
              <span className="qs-im-vsep" />
              <input type="file" accept=".csv,text/csv" onChange={e => { importFile(e.target.files[0]); e.target.value = '' }} />
            </div>
          </SectionCard>
        </div>

        <SessionPanel industry={current} Noun={Noun} items={items} onEdit={editItem} onSave={saveAll} onGotoCatalog={() => onGoto('catalog')} />
      </div>
    </div>
  )
}
