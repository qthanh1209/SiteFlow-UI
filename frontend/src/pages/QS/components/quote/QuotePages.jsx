import Icon from '../../../../components/ui/Icon'
import PaintThumb from '../breakdown/PaintThumb'
import { roman } from '../../../../data/qsBreakdownData'
import { coverAmount, quoteCell, quoteMoney } from '../../../../data/qsQuoteData'

const pct = (n, total) => `${total ? ((n / total) * 100).toFixed(2) : '0.00'}%`

function PageFoot({ doc, title, page, pages }) {
  return (
    <div className="qs-qt-foot">
      <span>{doc.company} — {doc.info.project}</span><span>{title}</span><span>Trang {page} / {pages}</span>
    </div>
  )
}

/* Trang 1: tờ bìa "Bảng ước tính chi phí dự án". doc: { company, code, version, date, info, areas, template } */
export function CoverPage({ doc, sections, sheetTotal, total, page, pages }) {
  const { info } = doc
  const shown = sections.filter(s => s.on)
  return (
    <div className={`qs-qt-page tpl-${doc.template}`}>
      <div className="qs-qt-cover-head">
        <div className="qs-qt-logo">{doc.company}</div>
        <div className="qs-qt-titlebox">
          <b>BẢNG ƯỚC TÍNH CHI PHÍ DỰ ÁN</b>
          <span>HẠNG MỤC: TỔNG HỢP CHI PHÍ</span>
          <small>Mã: <b>{doc.code}</b> · <b>v{doc.version}</b> · Ngày {doc.date}</small>
        </div>
      </div>

      <div className="qs-qt-info">
        {[['Khách hàng', info.client, 'Hiện trạng', info.status], ['Tên dự án', info.project, 'Quy mô', info.scale],
          ['DT sử dụng', doc.areas.use ? `${doc.areas.use} m²` : '', 'Nhu cầu', info.need], ['Phong cách', info.style, 'DT báo giá [nhân hệ số]', doc.areas.quote ? `${doc.areas.quote} m²` : '']].map(row => (
          <div key={row[0]} className="qs-qt-info-row">
            <span>{row[0]}</span><b>{row[1]}</b><span>{row[2]}</span><b>{row[3]}</b>
          </div>
        ))}
      </div>

      <div className="qs-qt-h">Chi tiết các hạng mục</div>
      <table className="qs-qt-table cover">
        <thead>
          <tr><th className="c">No</th><th>Hạng mục</th><th>Nội dung</th><th className="r">Chi phí dự kiến</th><th className="r">Tỷ trọng</th><th>Mô tả</th></tr>
        </thead>
        <tbody>
          {shown.map(s => s.items.map((it, i) => {
            const amount = coverAmount(it, s, sheetTotal)
            return (
              <tr key={it.id} className={i === 0 ? 'first' : ''}>
                {i === 0 && <td className="c" rowSpan={s.items.length}>{s.no}</td>}
                {i === 0 && <td className="sec" rowSpan={s.items.length}>{s.name}</td>}
                <td>{it.name}</td>
                <td className="r">{quoteMoney(amount)}</td>
                <td className="r">{pct(amount, total)}</td>
                <td className="desc">{it.desc}</td>
              </tr>
            )
          }))}
          <tr className="total">
            <td colSpan={3} className="r">Tổng chi phí dự kiến</td>
            <td className="r">{quoteMoney(total)}</td><td className="r">100%</td><td />
          </tr>
        </tbody>
      </table>
      <PageFoot doc={doc} title="Tờ bìa" page={page} pages={pages} />
    </div>
  )
}

/* Trang 2+: một phần của bảng báo giá chi tiết. lines: dòng nhóm + dòng sản phẩm của trang này;
   summary: { subtotal, vat, vatAmount, terms } chỉ truyền cho trang cuối */
export function DetailPage({ doc, lines, cols, page, pages, summary }) {
  return (
    <div className="qs-qt-page">
      <div className="qs-qt-detail-head">
        <div className="qs-qt-logo small">{doc.company}</div>
        <div><b>BẢNG BÁO GIÁ CHI TIẾT</b><small>Mã: {doc.code} · v{doc.version} · Ngày {doc.date}</small></div>
      </div>
      <table className="qs-qt-table detail">
        <thead>
          <tr>{cols.map(c => <th key={c.key} className={c.align === 'right' ? 'r' : c.align === 'center' ? 'c' : ''}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {lines.map(l => (l.type === 'group'
            ? <tr key={`g${l.g.id}`} className="group"><td colSpan={cols.length}>{roman(l.gi)}. {l.g.name}</td></tr>
            : (
              <tr key={l.r.id}>
                {cols.map(c => (
                  <td key={c.key} className={c.align === 'right' ? 'r' : c.align === 'center' ? 'c' : ''}>
                    {c.key === 'image' ? (l.r.tone && <PaintThumb tone={l.r.tone} size={44} />)
                      : c.key === 'docs' ? (l.r.docs > 0 ? <span className="qs-bd-doc"><Icon name="fileText" size={11} />{l.r.docs}</span> : '—')
                        : quoteCell(l.r, c.key, l.stt)}
                  </td>
                ))}
              </tr>
            )))}
          {!lines.length && <tr><td colSpan={cols.length} className="c">Chưa có hạng mục nào.</td></tr>}
        </tbody>
      </table>
      {summary && (
        <div className="qs-qt-summary">
          <div className="qs-qt-terms"><b>Điều khoản</b><p>{summary.terms}</p></div>
          <div className="qs-qt-sum">
            <div><span>Tạm tính</span><b>{quoteMoney(summary.subtotal)} đ</b></div>
            <div><span>VAT {summary.vat}%</span><b>{quoteMoney(summary.vatAmount)} đ</b></div>
            <div className="grand"><span>Tổng cộng</span><b>{quoteMoney(summary.subtotal + summary.vatAmount)} đ</b></div>
          </div>
        </div>
      )}
      <PageFoot doc={doc} title="Bảng báo giá chi tiết" page={page} pages={pages} />
    </div>
  )
}
