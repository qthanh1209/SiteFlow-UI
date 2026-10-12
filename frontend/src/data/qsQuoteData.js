/* Dữ liệu mẫu & tiện ích cho tab "Xuất báo giá" của trang QS (chưa có API) */
import { CATALOG, productCode, rowValues } from './qsBreakdownData'

const money = n => Math.round(n).toLocaleString('vi-VN')

/* 27 cột có thể xuất trên bảng báo giá chi tiết. internal: cột nội bộ, không in trên bản gửi khách */
export const QUOTE_COLUMNS = [
  { key: 'stt', label: 'STT', w: 54, align: 'center' },
  { key: 'room', label: 'Phòng', w: 100 },
  { key: 'drawing', label: 'Mã số bản vẽ', w: 96 },
  { key: 'line', label: 'Dòng sản phẩm', w: 130 },
  { key: 'code', label: 'Mã sản phẩm', w: 90 },
  { key: 'name', label: 'Tên sản phẩm', w: 170 },
  { key: 'brand', label: 'Thương hiệu', w: 96 },
  { key: 'supplier', label: 'Nhà cung cấp', w: 100 },
  { key: 'info', label: 'Thông tin chính', w: 170 },
  { key: 'specs', label: 'Thông số thiết kế', w: 150 },
  { key: 'image', label: 'Hình ảnh', w: 90, align: 'center' },
  { key: 'docs', label: 'Tài liệu', w: 76, align: 'center' },
  { key: 'unit', label: 'Đơn vị tính', w: 72, align: 'center' },
  { key: 'qty', label: 'Số lượng', w: 72, align: 'right' },
  { key: 'retail', label: 'Giá bán lẻ', w: 100, align: 'right', internal: true },
  { key: 'discount', label: 'Chiết khấu của đại lý (%)', w: 104, align: 'right', internal: true },
  { key: 'dealer', label: 'Giá đại lý', w: 100, align: 'right', internal: true },
  { key: 'margin', label: 'Lợi nhuận dự kiến (%)', w: 92, align: 'right', internal: true },
  { key: 'price', label: 'Giá bán', w: 100, align: 'right' },
  { key: 'custDiscount', label: 'Chiết khấu cho khách hàng (%)', w: 104, align: 'right' },
  { key: 'unitPrice', label: 'Đơn giá', w: 100, align: 'right' },
  { key: 'markup', label: 'Markup (%) — LN/giá vốn', w: 96, align: 'right', internal: true },
  { key: 'marginPct', label: 'Margin (%) — LN/giá bán', w: 96, align: 'right', internal: true },
  { key: 'profit', label: 'Lợi nhuận (VND)', w: 104, align: 'right', internal: true },
  { key: 'amount', label: 'Thành tiền', w: 110, align: 'right' },
  { key: 'status', label: 'Trạng thái', w: 86, align: 'center' },
  { key: 'note', label: 'Ghi chú', w: 130 },
]
/* Mặc định tắt cột Markup như giao diện mẫu (26/27) */
export const QUOTE_DEFAULT_HIDDEN = ['markup']
const INTERNAL = QUOTE_COLUMNS.filter(c => c.internal).map(c => c.key)
const MINIMAL = ['stt', 'name', 'brand', 'unit', 'qty', 'unitPrice', 'amount']
export const QUOTE_COL_PRESETS = [
  { key: 'default', label: 'Mặc định', note: '26 cột, tắt Markup', hidden: QUOTE_DEFAULT_HIDDEN },
  { key: 'all', label: 'Đầy đủ', note: 'Bật cả 27 cột', hidden: [] },
  { key: 'client', label: 'Gửi khách', note: 'Tắt các cột giá nội bộ', hidden: INTERNAL },
  { key: 'minimal', label: 'Tối giản', note: 'Tên, thương hiệu, số lượng, đơn giá, thành tiền', hidden: QUOTE_COLUMNS.filter(c => !MINIMAL.includes(c.key)).map(c => c.key) },
]
export const QUOTE_INTERNAL_LABEL = 'Giá bán lẻ NCC, CK đại lý, Giá đại lý, % lợi nhuận, Margin, Lợi nhuận (VND)'

const field = (text, label) => {
  const m = (text || '').match(new RegExp(`${label}: ([^\\n]+)`))
  return m ? m[1].trim() : ''
}
/* Chữ của một ô trên bảng báo giá chi tiết (cột image / docs do nơi hiển thị tự vẽ) */
export function quoteCell(r, key, stt) {
  const v = rowValues(r)
  const has = r.retail > 0
  switch (key) {
    case 'stt': return stt
    case 'drawing': return ''
    case 'line': return field(r.info, 'Dòng sản phẩm')
    case 'code': { const p = CATALOG.find(c => c.id === r.productId); return p ? productCode(p) : '' }
    case 'supplier': return r.brand || ''
    case 'specs': return r.features || ''
    case 'image': return ''
    case 'docs': return r.docs ? String(r.docs) : '—'
    case 'qty': return r.qty ? String(r.qty) : ''
    case 'retail': return money(r.retail)
    case 'discount': return String(r.discount)
    case 'dealer': return money(v.dealer)
    case 'margin': return String(r.margin)
    case 'price': case 'unitPrice': return money(v.price)
    case 'custDiscount': return '0'
    case 'markup': return has && v.dealer ? String(Math.round(((v.price - v.dealer) / v.dealer) * 100)) : '0'
    case 'marginPct': return has && v.price ? String(Math.round(((v.price - v.dealer) / v.price) * 100)) : '0'
    case 'profit': return money(v.profit)
    case 'amount': return money(v.amount)
    case 'status': return ''
    default: return r[key] || ''
  }
}

let seq = 0
export const quoteId = () => { seq += 1; return `q${seq}` }
/* src: 'sheet' = lấy số tự động từ bảng Bóc tách (hạng mục Sơn nước); agg: dòng tổng của các mục inAgg cùng mục lớn */
const item = (name, desc, extra = {}) => ({ id: quoteId(), name, desc, amount: null, ...extra })
const fitout = (name, desc, extra = {}) => item(name, desc, { inAgg: true, ...extra })

/* Mẫu tờ bìa "Ước tính chi phí dự án" */
export function coverTemplate() {
  return [
    { id: quoteId(), no: 1, name: 'TƯ VẤN DỰ ÁN', on: true, items: [
      item('Tư vấn QLDA', 'Bao gồm tư vấn tài chính dự án, tư vấn pháp lý dự án, tư vấn quản lý dự án, tư vấn mua hàng, đặt hàng, mở thầu, chọn thầu....'),
    ] },
    { id: quoteId(), no: 2, name: 'TƯ VẤN THIẾT KẾ', on: true, items: [
      item('Tư vấn thiết kế kiến trúc', 'Tư vấn thiết kế kiến trúc, mặt tiền công trình, mặt bằng bố trí kiến trúc...'),
      item('Tư vấn thiết kế nội thất', 'Tư vấn thiết kế mặt bằng công năng nội thất, thiết kế 3D, tư vấn chọn vật liệu, màu sắc, ánh sáng. Triển khai bản vẽ thi công nội thất'),
      item('Tư vấn thiết kế kết cấu', 'Tư vấn thiết kế kết cấu móng, cột, dầm, sàn. Triển khai bản vẽ thi công kết cấu'),
      item('Tư vấn thiết kế MEP (Mechanical, Electrical, Plumbing)', 'Tư vấn thiết kế hệ thống điện (Electrical), Hệ thống Thông gió & Điều hòa không khí (Mechanical / HVAC), hệ thống Cấp thoát nước (Plumbing & Sanitary), hệ thống Phòng cháy chữa cháy'),
    ] },
    { id: quoteId(), no: 3, name: 'XÂY DỰNG', on: true, items: [
      item('Phần thô', 'Chuẩn bị mặt bằng, thi công móng và nền, thi công cột, dầm, sàn, thi công tường bao, tường ngăn, tô trát, hoàn thiện phần thô, kiểm tra và nghiệm thu phần thô'),
      item('Phần hoàn thiện cơ bản', 'Thi công hoàn thiện trần, tường, sàn, lắp đặt TBVS, thiết bị điện lạnh, lắp đặt cửa nội thất, tay vịn cầu thang...', { agg: true }),
      fitout('Trần thạch cao', 'Nhân công và vật tư'),
      fitout('Sơn nước', 'Nhân công và vật tư', { src: 'sheet' }),
      fitout('Xây tô', 'Nhân công và vật tư'),
      fitout('Ốp lát', 'Nhân công và vật tư'),
      fitout('Thiết bị vệ sinh', 'Cung cấp thiết bị và nhân công lắp đặt'),
      fitout('Thiết bị điện', 'Đèn, công tắc - ổ cắm: cung cấp thiết bị và nhân công lắp đặt'),
      fitout('Thiết bị điện lạnh', 'Cung cấp thiết bị và nhân công lắp đặt'),
      fitout('Cửa', 'Sản xuất và nhân công lắp đặt'),
    ] },
    { id: quoteId(), no: 4, name: 'HOÀN THIỆN NỘI THẤT', on: true, items: [
      item('Nội thất liền tường', 'Thi công lắp đặt nội thất liền tường, tủ bếp, tủ trang trí, vách liền tường'),
      item('Đồ rời (Loose furniture)', 'Sản xuất, cung cấp nội thất đồ rời, kệ, tủ rời, giường, ghế sofa, bàn, tủ lavabo....'),
      item('Rèm cửa', 'Sản xuất, cung cấp, lắp đặt rèm cửa'),
      item('Đồ trang trí', 'Sản xuất, cung cấp đồ trang trí nội thất: thảm, đồ decor, tranh treo tường v.v....'),
    ] },
    { id: quoteId(), no: 5, name: 'BẢO DƯỠNG', on: true, items: [
      item('Bảo dưỡng định kỳ', 'Cung cấp các gói bảo dưỡng định kỳ cho các thiết bị như máy lạnh, bình nước nóng....'),
      item('Bảo hiểm', 'Cung cấp các gói bảo hiểm thay thế, sửa chữa cho các thiết bị như đèn, thiết bị vệ sinh, sơn nước, sàn gỗ...v.....'),
    ] },
  ]
}

/* Số tiền của một dòng tờ bìa. sheetTotal: tạm tính của bảng Bóc tách */
export function coverAmount(it, section, sheetTotal) {
  if (it.agg) return section.items.filter(x => x.inAgg).reduce((s, x) => s + coverAmount(x, section, sheetTotal), 0)
  if (it.amount !== null) return it.amount
  return it.src === 'sheet' ? sheetTotal : 0
}
/* Tổng tờ bìa: cộng các mục đang bật, bỏ qua dòng tổng (agg) để không cộng trùng */
export const coverTotal = (sections, sheetTotal) => sections.filter(s => s.on).reduce((sum, s) => sum + s.items.filter(it => !it.agg).reduce((a, it) => a + coverAmount(it, s, sheetTotal), 0), 0)

export const EMPTY_INFO = { client: 'test', project: 'test', status: '', scale: '', areaTotal: '', need: '', style: '', segment: '' }
/* Thông tin công ty in trên báo giá; ô nào để trống thì không in. logo: link ảnh, để trống thì in tên công ty */
export const DEFAULT_COMPANY = { name: 'Dezon', logo: '', address: '', phone: '', email: '', website: '', extra: '' }
/* Mỗi dòng là một điều khoản, in thành danh sách đánh số ở trang cuối; dòng hiệu lực báo giá được tự thêm vào cuối */
export const DEFAULT_TERMS = 'Khối lượng trên là tạm tính, khối lượng quyết toán theo thực tế thi công.\nGiá trên chưa bao gồm nhân công hoàn thiện.\nGiá trên chưa bao gồm thuế VAT.'
export const VALID_DAYS = 30
/* Tiến độ thanh toán in ở trang cuối: [nội dung, tỷ lệ %] */
export const PAYMENT_STAGES = [['Tạm ứng khi ký hợp đồng', 50], ['Khi giao hàng / thi công', 40], ['Nghiệm thu, bàn giao', 10]]
export const ROWS_PER_PAGE = [['auto', 'Tự động'], ['6', '6'], ['10', '10'], ['12', '12'], ['15', '15'], ['20', '20']]
export const ZOOMS = [['fit', 'Vừa khung'], ['75', '75%'], ['100', '100%'], ['125', '125%']]
export const AUTO_ROWS = 8
/* Màu tiêu đề & bảng của báo giá; màu đầu tiên là mặc định */
export const QUOTE_ACCENTS = ['#0F2942', '#2563EB', '#0D9488', '#16A34A', '#B7791F', '#DC2626', '#7C3AED', '#1F2937']
export const quoteMoney = money

/* Đánh số các dòng của một mục lớn trên tờ bìa: 3.1, 3.2, rồi 3.2.1… cho các dòng con (inAgg) của dòng tổng đứng trước */
export function coverNumbers(section) {
  let main = 0
  let sub = 0
  return section.items.map(it => {
    if (it.inAgg && main) { sub += 1; return `${section.no}.${main}.${sub}` }
    main += 1
    sub = 0
    return `${section.no}.${main}`
  })
}

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
const SCALES = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
/* Đọc một nhóm 3 chữ số; pad: nhóm đứng sau một nhóm khác nên phải đọc cả "không trăm" */
function readTriple(n, pad) {
  const h = Math.floor(n / 100)
  const t = Math.floor((n % 100) / 10)
  const u = n % 10
  const out = []
  if (h || pad) out.push(DIGITS[h], 'trăm')
  if (t === 0) { if (u && (h || pad)) out.push('lẻ') } else if (t === 1) out.push('mười'); else out.push(DIGITS[t], 'mươi')
  if (u) out.push(u === 1 && t > 1 ? 'mốt' : u === 5 && t >= 1 ? 'lăm' : DIGITS[u])
  return out.join(' ')
}
/* Số tiền bằng chữ: 14590000 → "Mười bốn triệu năm trăm chín mươi nghìn đồng" */
export function moneyWords(amount) {
  let n = Math.round(Math.abs(amount))
  if (!n) return 'Không đồng'
  const groups = []
  while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000) }
  const parts = []
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    if (groups[i]) parts.push(`${readTriple(groups[i], parts.length > 0)} ${SCALES[i] || ''}`.trim())
  }
  const text = `${parts.join(' ')} đồng`
  return text[0].toUpperCase() + text.slice(1)
}

const dmy = d => { const p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}` }
/* Ngày lập báo giá và ngày hết hiệu lực (dd/mm/yyyy) */
export function quoteDates() {
  const now = new Date()
  const until = new Date(now)
  until.setDate(until.getDate() + VALID_DAYS)
  return { date: dmy(now), until: dmy(until) }
}
