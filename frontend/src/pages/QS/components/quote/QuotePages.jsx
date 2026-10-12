import Icon from '../../../../components/ui/Icon'
import PaintThumb from '../breakdown/PaintThumb'
import { roman } from '../../../../data/qsBreakdownData'
import { PAYMENT_STAGES, VALID_DAYS, coverAmount, coverNumbers, moneyWords, quoteCell, quoteMoney } from '../../../../data/qsQuoteData'

const pct = (n, total) => `${total ? ((n / total) * 100).toFixed(2) : '0.00'}%`

/* doc: { company, brand, code, version, date, until, info, areas, template, accent } — company: tên công ty;
   brand: { name, logo, address, phone, email, website, extra }; accent: màu tiêu đề & bảng */
function Page({ doc, className = '', children }) {
  return <div className={`qs-qt-page ${className}`} style={{ '--qt-accent': doc.accent }}>{children}</div>
}

/* Logo (ảnh nếu có link, không thì tên công ty) và các dòng liên hệ đã điền */
function Brand({ doc, small }) {
  const b = doc.brand
  const contact = [b.phone && `ĐT: ${b.phone}`, b.email, b.website].filter(Boolean).join(' · ')
  return (
    <div className="qs-qt-brand">
      {b.logo ? <img className={`qs-qt-logo-img${small ? ' small' : ''}`} src={b.logo} alt={b.name} /> : <div className={`qs-qt-logo${small ? ' small' : ''}`}>{b.name}</div>}
      {!small && [b.address, contact, b.extra].filter(Boolean).map(line => <span key={line}>{line}</span>)}
    </div>
  )
}

function PageFoot({ doc, title, page, pages }) {
  return (
    <div className="qs-qt-foot">
      <span>{[doc.company, doc.info.project].filter(Boolean).join(' — ')}</span><span>{title}</span><span>Trang {page} / {pages}</span>
    </div>
  )
}

/* Phần kết của báo giá, in ở trang cuối: tổng cộng + VAT, số tiền bằng chữ, tiến độ thanh toán, điều khoản và ô ký.
   summary: { subtotal, vat, vatAmount, terms } */
function Closing({ doc, summary }) {
  const grand = summary.subtotal + summary.vatAmount
  const terms = [
    ...summary.terms.split('\n').map(t => t.trim()).filter(Boolean),
    `Báo giá có hiệu lực ${VALID_DAYS} ngày kể từ ngày ${doc.date} (đến hết ngày ${doc.until}).`,
  ]
  return (
    <>
      <div className="qs-qt-grand">
        <div><span>Tổng cộng:</span><b>{quoteMoney(summary.subtotal)} đ</b></div>
        <div><span>VAT {summary.vat}%:</span><b>{quoteMoney(summary.vatAmount)} đ</b></div>
        <div className="final"><span>Thành tiền sau thuế:</span><b>{quoteMoney(grand)} đ</b></div>
      </div>
      <div className="qs-qt-words"><i>Bằng chữ:</i> <b>{moneyWords(grand)}</b></div>

      <div className="qs-qt-box">
        <div className="qs-qt-box-h">Tiến độ thanh toán</div>
        <table className="qs-qt-pay">
          <thead><tr><th>Đợt</th><th>Nội dung</th><th className="r">Tỷ lệ</th><th className="r">Số tiền</th></tr></thead>
          <tbody>
            {PAYMENT_STAGES.map(([label, rate], i) => (
              <tr key={label}><td>{i + 1}</td><td>{label}</td><td className="r">{rate}%</td><td className="r">{quoteMoney((grand * rate) / 100)} đ</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="qs-qt-box soft">
        <div className="qs-qt-box-h">Ghi chú &amp; điều khoản:</div>
        <ol className="qs-qt-terms">{terms.map(t => <li key={t}>{t}</li>)}</ol>
      </div>

      <div className="qs-qt-sign">
        <div><span>Khách hàng / Customer</span><b>{doc.info.client}</b></div>
        <div><span>{doc.company}</span><b>Người lập: Quản trị viên</b></div>
      </div>
    </>
  )
}

/* Trang 1: tờ bìa "Bảng ước tính chi phí dự án". summary chỉ truyền khi tờ bìa cũng là trang cuối */
export function CoverPage({ doc, sections, sheetTotal, total, page, pages, summary }) {
  const { info } = doc
  const shown = sections.filter(s => s.on)
  return (
    <Page doc={doc} className={`tpl-${doc.template}`}>
      <div className="qs-qt-cover-head">
        <Brand doc={doc} />
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
          <tr><th className="c">No</th><th>Hạng mục</th><th className="r">Chi phí dự kiến</th><th className="r">Tỷ trọng</th><th>Mô tả</th></tr>
        </thead>
        <tbody>
          {shown.map(s => {
            const numbers = coverNumbers(s)
            const sum = s.items.filter(it => !it.agg).reduce((a, it) => a + coverAmount(it, s, sheetTotal), 0)
            return [
              <tr key={s.id} className="sec">
                <td className="c">{s.no}</td><td>{s.name}</td><td className="r">{quoteMoney(sum)}</td><td className="r">{pct(sum, total)}</td><td />
              </tr>,
              ...s.items.map((it, i) => {
                const amount = coverAmount(it, s, sheetTotal)
                return (
                  <tr key={it.id}>
                    <td className="c">{numbers[i]}</td>
                    <td>{it.name}</td>
                    <td className="r">{quoteMoney(amount)}</td>
                    <td className="r">{pct(amount, total)}</td>
                    <td className="desc">{it.desc}</td>
                  </tr>
                )
              }),
            ]
          })}
          <tr className="total">
            <td colSpan={2} className="r">Tổng chi phí dự kiến</td>
            <td className="r">{quoteMoney(total)}</td><td className="r">100%</td><td />
          </tr>
        </tbody>
      </table>
      {summary && <Closing doc={doc} summary={summary} />}
      <PageFoot doc={doc} title="Tờ bìa" page={page} pages={pages} />
    </Page>
  )
}

/* Trang 2+: một phần của bảng báo giá chi tiết. lines: dòng nhóm + dòng sản phẩm của trang này;
   summary: { subtotal, vat, vatAmount, terms } chỉ truyền cho trang cuối */
export function DetailPage({ doc, lines, cols, page, pages, summary }) {
  return (
    <Page doc={doc}>
      <div className="qs-qt-detail-head">
        <Brand doc={doc} small />
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
      {summary && <Closing doc={doc} summary={summary} />}
      <PageFoot doc={doc} title="Bảng báo giá chi tiết" page={page} pages={pages} />
    </Page>
  )
}
