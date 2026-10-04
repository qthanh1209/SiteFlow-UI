import { useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { QUOTE_TEMPLATES, TEMPLATE_ACCENT, STATUS_LABEL, STATUS_COLOR, STATUS_TINT, monthsBetween } from '../../../data/marketingData'
import QuoteDoc from './QuoteDoc'

const ACCENT_KEY = 'siteflow-quote-accent'
const TEXT_KEY = 'siteflow-quote-textcolor'
const FONT_KEY = 'siteflow-quote-font'

function loadStyle(key) {
  try { return localStorage.getItem(key) || '' } catch { return '' }
}
function saveStyle(key, value) {
  try { localStorage.setItem(key, value) } catch { /* bỏ qua */ }
}

const muted = { color: 'var(--text-muted)' }
const sideCard = { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }
const sideTitle = { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }
const colorInput = { width: 38, height: 24, border: '1px solid var(--border)', borderRadius: 6, padding: 2, cursor: 'pointer', background: 'none' }

/* Phần thân tab báo giá. Bản HTML dựng lại toàn bộ khối này mỗi lần renderQuoteTab()
   nên VAT / khổ giấy / hướng giấy quay về mặc định — component được gắn `key` để mô phỏng. */
function QuoteBody({ catalog, camp, template, setTemplate, accent, setAccent, textColor, setTextColor, font, setFont, onResetStyle, onExport }) {
  const [vatOn, setVatOn] = useState(false)
  const [paperSize, setPaperSize] = useState('A4')
  const [paperOrient, setPaperOrient] = useState('portrait')
  const months = monthsBetween(camp.start, camp.end)

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 0 }}>
      <div style={{ width: 230, flex: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="mk-grp-card">
          <div className="mk-grp-head" style={{ background: 'var(--marketing-tint)', color: 'var(--marketing)' }}>Thông tin chiến dịch</div>
          <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
            <div><span style={muted}>Tên:</span> <strong>{camp.name}</strong></div>
            <div><span style={muted}>Loại:</span> {camp.type}</div>
            <div><span style={muted}>Dự án/KH:</span> {camp.client}</div>
            <div><span style={muted}>Phụ trách:</span> {camp.owner}</div>
            <div><span style={muted}>Thời gian:</span> {camp.start || '—'} → {camp.end || '—'} ({months} tháng)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={muted}>Trạng thái:</span> <span style={{ padding: '2px 8px', borderRadius: 999, background: STATUS_TINT[camp.status], color: STATUS_COLOR[camp.status], fontSize: 10.5, fontWeight: 700 }}>{STATUS_LABEL[camp.status]}</span></div>
            {camp.notes ? <div style={{ paddingTop: 6, borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>{camp.notes}</div> : null}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setVatOn(v => !v)}
            style={{ flex: 1, border: `1px solid ${vatOn ? 'var(--marketing)' : 'var(--border)'}`, background: vatOn ? 'var(--marketing-tint)' : 'var(--surface)', color: vatOn ? 'var(--marketing)' : 'var(--text)', padding: '9px 10px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >{vatOn ? '✓ VAT 8% đã áp dụng' : '+ VAT 8%'}</button>
        </div>
        <div className="mk-grp-card" style={{ padding: '12px 14px' }}>
          <div style={{ ...sideTitle, marginBottom: 8 }}>MẪU BÁO GIÁ</div>
          <div className="mk-tpl-picker" style={{ flexDirection: 'column', gap: 6 }}>
            {QUOTE_TEMPLATES.map(t => (
              <button key={t.id} className={`mk-tpl-btn${t.id === template ? ' active' : ''}`} style={{ width: '100%' }} onClick={() => setTemplate(t.id)}>
                <span className="mk-tpl-swatch" style={{ background: t.swatch }} />
                Mẫu {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mk-grp-card" style={sideCard}>
          <div style={sideTitle}>TÙY CHỈNH GIAO DIỆN</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="mkQpAccentInput" style={{ fontSize: 12, fontWeight: 600 }}>Màu tiêu đề</label>
            <input type="color" id="mkQpAccentInput" style={colorInput} value={accent || TEMPLATE_ACCENT[template] || '#C23B78'} onChange={e => setAccent(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="mkQpTextColorInput" style={{ fontSize: 12, fontWeight: 600 }}>Màu chữ</label>
            <input type="color" id="mkQpTextColorInput" style={colorInput} value={textColor || '#1C1F26'} onChange={e => setTextColor(e.target.value)} />
          </div>
          <div>
            <label htmlFor="mkQpFontSelect" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Font chữ</label>
            <select id="mkQpFontSelect" value={font || ''} onChange={e => setFont(e.target.value)} style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px', fontSize: 12, fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
              <option value="">Mặc định (Montserrat)</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Inter', sans-serif">Inter</option>
              <option value="Georgia, 'Times New Roman', serif">Georgia / Times</option>
              <option value="Arial, sans-serif">Arial</option>
            </select>
          </div>
          <button type="button" onClick={onResetStyle} style={{ width: '100%', border: '1px dashed var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: 11.5, fontWeight: 600, padding: 7, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Khôi phục mặc định</button>
        </div>
        <div className="mk-grp-card" style={sideCard}>
          <div style={sideTitle}>XUẤT BÁO GIÁ</div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 6 }}>Khổ giấy</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['A4', 'A3', 'A2'].map(s => (
                <button type="button" key={s} className={`mk-qexport-pill${paperSize === s ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setPaperSize(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 6 }}>Hướng giấy</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className={`mk-qexport-pill${paperOrient === 'portrait' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setPaperOrient('portrait')}>Dọc</button>
              <button type="button" className={`mk-qexport-pill${paperOrient === 'landscape' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setPaperOrient('landscape')}>Ngang</button>
            </div>
          </div>
          <button type="button" className="mk-qexport-btn" onClick={() => onExport({ vatOn, paperSize, paperOrient })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            Xuất báo giá
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <QuoteDoc catalog={catalog} camp={camp} vatOn={vatOn} template={template} accent={accent} textColor={textColor} font={font} />
      </div>
    </div>
  )
}

/* Tab "Báo giá" (renderQuoteTab của bản HTML) */
export default function QuoteTab({ visible, catalog, campaigns, quoteCampaignId, renderKey, onSelectCampaign }) {
  /* Mẫu + tuỳ chỉnh giao diện giữ nguyên qua các lần dựng lại (biến toàn cục ở bản HTML) */
  const [template, setTemplate] = useState('modern')
  const [accent, setAccentState] = useState(() => loadStyle(ACCENT_KEY))
  const [textColor, setTextColorState] = useState(() => loadStyle(TEXT_KEY))
  const [font, setFontState] = useState(() => loadStyle(FONT_KEY))
  /* Nội dung vùng in (#quotePrintRoot) — chỉ được điền khi bấm "Xuất báo giá" */
  const [printSnap, setPrintSnap] = useState(null)

  const camp = campaigns.find(c => c.id === quoteCampaignId) || campaigns[0]

  function setAccent(v) { setAccentState(v); saveStyle(ACCENT_KEY, v) }
  function setTextColor(v) { setTextColorState(v); saveStyle(TEXT_KEY, v) }
  function setFont(v) { setFontState(v); saveStyle(FONT_KEY, v) }
  function resetStyle() {
    setAccentState(''); setTextColorState(''); setFontState('')
    try {
      localStorage.removeItem(ACCENT_KEY)
      localStorage.removeItem(TEXT_KEY)
      localStorage.removeItem(FONT_KEY)
    } catch { /* bỏ qua */ }
  }
  function exportQuote({ vatOn, paperSize, paperOrient }) {
    /* Dựng xong vùng in rồi mới gọi hộp thoại in của trình duyệt */
    flushSync(() => setPrintSnap({ catalog, camp, vatOn, template, accent, textColor, font, paperSize, paperOrient }))
    window.print()
  }

  return (
    <div style={{ display: visible ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: campaigns.length ? 'flex' : 'none', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>Xem báo giá chiến dịch:</span>
        <select value={camp ? camp.id : ''} onChange={e => onSelectCampaign(e.target.value)} style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 12.5, fontFamily: 'inherit', minWidth: 260 }}>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div style={{ display: campaigns.length ? 'none' : 'block', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 14, padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        Chưa có chiến dịch nào để lập báo giá — bấm "Tạo chiến dịch" ở góc trên bên phải.
      </div>
      {camp
        ? <QuoteBody
            key={renderKey}
            catalog={catalog} camp={camp}
            template={template} setTemplate={setTemplate}
            accent={accent} setAccent={setAccent}
            textColor={textColor} setTextColor={setTextColor}
            font={font} setFont={setFont}
            onResetStyle={resetStyle} onExport={exportQuote}
          />
        : <div style={{ display: 'flex', gap: 16, minHeight: 0 }} />}

      {/* Vùng in: nằm ngoài khung ứng dụng (con trực tiếp của <body>) như #quotePrintRoot của bản HTML */}
      {createPortal(
        <div className="mk-print-root">
          {printSnap && (
            <>
              <style>{`@page{ size: ${printSnap.paperSize} ${printSnap.paperOrient}; margin: 12mm; }`}</style>
              <QuoteDoc catalog={printSnap.catalog} camp={printSnap.camp} vatOn={printSnap.vatOn} template={printSnap.template} accent={printSnap.accent} textColor={printSnap.textColor} font={printSnap.font} />
            </>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
