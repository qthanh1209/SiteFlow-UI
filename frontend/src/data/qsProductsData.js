/* Dữ liệu màn "Danh sách sản phẩm" của QS — bảng sản phẩm (dữ liệu mẫu, hiện chỉ có đề mục 3.2.6.1 Thiết bị đèn) */
import { findIndustry, industryFields, IMPORT_DOC_KINDS } from './qsImportData'

/* Cây đề mục của danh mục sản phẩm: cấp của một đề mục suy ra từ mã (3.2.6.1 là con của 3.2.6) */
export const PRODUCT_SECTIONS = [
  ['1', 'Tư vấn dự án'], ['1.1', 'Tư vấn quản lý dự án'],
  ['2', 'Tư vấn thiết kế'], ['2.1', 'Tư vấn thiết kế kiến trúc'], ['2.2', 'Tư vấn thiết kế nội thất'], ['2.3', 'Tư vấn thiết kế kết cấu'], ['2.4', 'Tư vấn thiết kế MEP'],
  ['3', 'Xây dựng'], ['3.1', 'Phần thô'], ['3.2', 'Phần hoàn thiện cơ bản'],
  ['3.2.1', 'Thạch cao'], ['3.2.2', 'Sơn nước'], ['3.2.3', 'Xây tô'], ['3.2.4', 'Ốp lát'], ['3.2.5', 'Thiết bị vệ sinh'],
  ['3.2.6', 'Thiết bị điện'], ['3.2.6.1', 'Thiết bị đèn'], ['3.2.6.2', 'Công tắc - ổ cắm'],
  ['3.2.7', 'Điện lạnh'], ['3.2.8', 'Cửa'], ['3.2.8.1', 'Cửa ngoại thất'], ['3.2.8.2', 'Cửa nội thất'],
  ['4', 'Hoàn thiện nội thất'], ['4.1', 'Nội thất liền tường'], ['4.2', 'Nội thất rời'], ['4.3', 'Rèm cửa'], ['4.4', 'Đồ trang trí'],
  ['5', 'Bảo dưỡng'],
].map(([code, name]) => ({ code, name }))
export const ALL_SECTIONS = 'all'
export const DEFAULT_SECTION = '3.2.6.1'
const sectionOf = code => PRODUCT_SECTIONS.find(s => s.code === code)
export const sectionName = code => (code === ALL_SECTIONS ? 'Tất cả hạng mục' : sectionOf(code).name)
export const sectionLabel = code => (code === ALL_SECTIONS ? 'Tất cả hạng mục' : `${code}.${sectionOf(code).name}`)
/* Sản phẩm có thuộc đề mục (hoặc một đề mục con của nó) không */
export const inSection = (p, code) => code === ALL_SECTIONS || p.section === code || p.section.startsWith(`${code}.`)

/* ---------- Cột của bảng ----------
   Cột STT và Sản phẩm luôn hiện; các cột dưới đây bật/tắt được. Nhãn thông số lấy từ form Nhập dữ liệu của ngành đèn */
const LABEL = Object.fromEntries(industryFields(findIndustry('lighting')).map(f => [f.key, f.label]))
const SPEC_KEYS = [
  'brand', 'supplier', 'category', 'line', 'group', 'retail', 'discount', 'power', 'cct', 'beam', 'color', 'material', 'tilt', 'height', 'diameter',
  'lumen', 'ip', 'cri', 'efficacy', 'ugr', 'sdcm', 'coi', 'life', 'chipName', 'chipType', 'driverSeparate', 'driverName', 'driverCode', 'driverBrand',
  'driverPrice', 'driverPosition', 'driverControl', 'driverCurrent', 'cutout', 'protection', 'warranty', 'unit',
]
export const PRODUCT_COLUMNS = [
  { key: 'image', label: 'Ảnh' },
  { key: 'approval', label: 'Trạng thái' },
  { key: 'sku', label: 'Số SKU' },
  ...SPEC_KEYS.map(key => ({ key, label: LABEL[key] })),
  { key: 'status', label: 'Trạng thái KD' },
  { key: 'note', label: 'Ghi chú' },
  ...IMPORT_DOC_KINDS.map(k => ({ key: `doc_${k.key}`, label: k.label })),
  { key: 'dealer', label: 'Giá đại lý' },
  { key: 'createdBy', label: 'Người tạo' },
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'updatedBy', label: 'Người sửa cuối' },
]
export const FIXED_COLUMN_COUNT = 2
export const DEFAULT_COLUMNS = ['image', 'approval', 'sku', 'brand', 'category', 'power', 'cct', 'beam', 'cri', 'dealer']
export const BASIC_COLUMNS = ['image', 'brand', 'category', 'dealer']
const MONEY_KEYS = new Set(['retail', 'dealer', 'driverPrice'])
const CENTER_KEYS = new Set(['image', 'approval', 'sku', 'power', 'cct', 'beam', 'cri', 'discount', 'ip', 'unit', 'warranty'])
export const columnAlign = key => (MONEY_KEYS.has(key) ? 'r' : CENTER_KEYS.has(key) ? 'c' : '')

export const APPROVAL = { pending: 'Chưa duyệt', approved: 'Đã duyệt' }
/* Số SKU của một sản phẩm = số biến thể (dòng chính là biến thể đầu tiên), tối thiểu 1 */
export const skuCount = p => Math.max(1, p.variants.length)
export const formatPrice = n => `${Math.round(n).toLocaleString('vi-VN')}đ`

/* Giá trị dạng chữ của một ô (dùng cho bảng, tìm kiếm và file tải về); '' = không có dữ liệu */
export function productText(p, key) {
  if (key === 'approval') return APPROVAL[p.approval]
  if (key === 'sku') return String(skuCount(p))
  if (key === 'retail') return formatPrice(p.dealer / (1 - p.discount / 100))
  if (MONEY_KEYS.has(key)) return p[key] ? formatPrice(p[key]) : ''
  if (key === 'discount') return `${p.discount}%`
  if (key === 'image') return ''
  return p[key] === undefined || p[key] === null ? '' : String(p[key])
}

/* ---------- Sản phẩm mẫu ----------
   tone: màu nền ảnh minh hoạ.
   variants: các biến thể cùng mã, [{ label, ...thông số khác dòng chính, fav?, approval? }] — biến thể đầu tiên chính là dòng chính.
   combo: sản phẩm đi kèm, khai báo [[mã sản phẩm, số lượng]] rồi được đổi thành [{ id, qty }] ở cuối file */
let seq = 0
const product = (name, code, brand, category, power, cct, beam, cri, dealer, extra = {}) => {
  seq += 1
  return {
    id: `pd${seq}`, section: DEFAULT_SECTION, name, code, brand, category, power, cct, beam, cri, dealer,
    supplier: brand, line: name, discount: 30, unit: 'Cái', warranty: 2, status: 'Đang kinh doanh', approval: 'pending', fav: false,
    createdBy: 'Trần Anh', createdAt: '06/10/2026', updatedBy: 'Trần Anh', tone: '#8A93A3', variants: [], combo: [],
    ...extra,
  }
}
const cross = (ccts, beams) => ccts.flatMap(cct => beams.map(beam => ({ label: `${cct} · ${beam}`, cct, beam })))
const each = (key, values) => values.map(value => ({ label: value, [key]: value }))
const SPOT = 'Đèn âm trần chiếu điểm (Recessed Spotlight)'

const RAW_PRODUCTS = [
  product('1,5M, thanh ray T2, đen /trắng', 'YZ6212A_1.5M', 'Aura Lighting', 'Đèn nội thất', '', '', '', '', 252009120, {
    tone: '#1B1E24', fav: true, line: 'Thanh ray', color: 'Đen, Trắng', material: 'Nhôm cao cấp, sơn tĩnh điện', driverSeparate: 'Có', cutout: '34x21x1500mm',
    combo: [['YZ6212A_1M', 1], ['NCW-240105', 1], ['1616', 1]],
  }),
  product('1M, thanh ray T2, đen /trắng', 'YZ6212A_1M', 'Aura Lightingg', 'Đèn nội thất', '', '', '', '', 168000, {
    tone: '#1B1E24', fav: true, approval: 'approved', line: 'Thanh ray', color: 'Đen, Trắng', material: 'Nhôm cao cấp, sơn tĩnh điện', cutout: '34x21x1000mm',
    combo: [['YZ6212A_1.5M', 1]],
  }),
  product('Âm trần spotlight', 'Mars M5507A', 'Ades', 'Đèn nội thất', '7W', '3000K', '36°', '>90', 299000, { tone: '#9AA0AA', fav: true, variants: each('color', ['Trắng', 'Đen', 'Vàng đồng', 'Xám']) }),
  product('Bộ đổi nguồn đèn Led', 'SVD-06024A', 'SV Lighting', 'Đèn nội thất', '60W', '', '', '', 186000, { tone: '#5B6472' }),
  product('Bộ đổi nguồn đèn Led', 'SVD-10024A', 'SV Lighting', 'Đèn nội thất', '100W', '', '', '', 264000, { tone: '#5B6472' }),
  product('Bộ đổi nguồn đèn Led', 'SVD-15024A', 'SV Lighting', 'Đèn nội thất', '150W', '', '', '', 372000, { tone: '#5B6472' }),
  product('Bộ đổi nguồn đèn Led siêu mỏng', 'SVS-10024A', 'SV Lighting', 'Đèn nội thất', '100W', '', '', '', 318000, { tone: '#5B6472' }),
  product('Bộ đổi nguồn đèn Led', 'SVD-20024A', 'SV Lighting', 'Đèn nội thất', '200W', '', '', '', 510000, { tone: '#5B6472', fav: true }),
  product('Bộ đổi nguồn đèn Led', 'SVD-30024A', 'SV Lighting', 'Đèn nội thất', '300W', '', '', '', 676200, { tone: '#5B6472', fav: true }),
  product('Đầu cấp điện áp DC 48V cho hệ ray', '20IN', 'Aura Lighting', 'Đèn nội thất', '', '', '', '', 90000, { tone: '#1B1E24' }),
  product('Dây treo hệ khung ray nam châm. Độ dài: 2m', 'Phụ kiện treo ray', 'Aura Lighting', 'Đèn nội thất', '', '', '', '', 111000, { tone: '#B8BEC9' }),
  product('Đèn âm sàn', 'NCI-13A', 'Aura Lighting', 'Đèn ngoại thất', '3W', '3000K', '10°', '>80', 630000, { tone: '#3A3F4A', ip: 'IP67' }),
  product('Đèn âm sàn', 'NCI-33A', 'Aura Lighting', 'Đèn ngoại thất', '9W', '3000K', '15°', '>80', 1350000, { tone: '#3A3F4A', ip: 'IP67' }),
  product(SPOT, 'FL76037', 'Lyk', 'Đèn nội thất', '7W', '3000K', '36°', '>90', 671400, { tone: '#2B2F38', fav: true, variants: each('cct', ['3000K', '2700K', '4000K']) }),
  product(SPOT, 'FL76017', 'Lyk', 'Đèn nội thất', '18W', '4000K', '24°', '>90', 1107600, { tone: '#D9DCE3', fav: true }),
  product(SPOT, 'FL76001', 'Lyk', 'Đèn nội thất', '18W', '2700K', '15°', '>90', 747000, { tone: '#7A5A3A', variants: cross(['2700K', '3000K', '4000K'], ['15°', '24°', '36°', '60°']) }),
  product(SPOT, 'FL76009', 'Lyk', 'Đèn nội thất', '12W', '3000K', '24°', '>90', 589000, { tone: '#2B2F38' }),
  product('Đèn rọi ray nam châm', 'MT-2012', 'Aura Lighting', 'Đèn nội thất', '12W', '3000K', '24°', '>90', 486000, { tone: '#1B1E24', approval: 'approved' }),
  product('Đèn hắt tường ngoài trời', 'WL-0806', 'Aura Lighting', 'Đèn ngoại thất', '6W', '3000K', '60°', '>80', 842000, { tone: '#4A4F5A', ip: 'IP65' }),
  product('Đèn LED dây 24V', 'SVL-2835-120', 'SV Lighting', 'Đèn nội thất', '9.6W/m', '4000K', '120°', '>90', 78000, { tone: '#E8C66A', unit: 'm' }),
  product('Đèn Led thanh', 'NCW-240105', 'Aura Lighting', 'Đèn nội thất', '24W', '3000K', '120°', '>90', 1230000, { tone: '#3A3F4A', line: 'Đèn thanh' }),
  product('Thanh Nhôm Định Hình 1616', '1616', 'Aura Lighting', 'Đèn nội thất', '', '', '', '', 25000, { tone: '#B8BEC9', line: 'Phụ kiện', material: 'Nhôm định hình', unit: 'm' }),
  product('Đèn cắm cỏ sân vườn', 'GS-0705', 'Aura Lighting', 'Đèn ngoại thất', '5W', '3000K', '36°', '>80', 395000, { tone: '#3E5A3A', ip: 'IP65' }),
]
/* Đổi mã sản phẩm đi kèm thành id */
export const INITIAL_PRODUCTS = RAW_PRODUCTS.map(p => ({
  ...p, combo: p.combo.map(([code, qty]) => ({ id: RAW_PRODUCTS.find(x => x.code === code).id, qty })),
}))

/* ---------- Hộp "Thông tin sản phẩm" ----------
   Thông tin chính hiện dạng biểu tượng + giá trị; các nhóm thông số chỉ hiện những dòng có dữ liệu */
export const DETAIL_KEY_INFO = [
  { key: 'power', label: 'Công suất', icon: 'gauge' },
  { key: 'cct', label: 'Nhiệt độ màu', icon: 'sun' },
  { key: 'beam', label: 'Góc chiếu', icon: 'target' },
  { key: 'cri', label: 'CRI', icon: 'eye' },
  { key: 'color', label: 'Màu sắc', icon: 'droplet' },
]
export const DETAIL_GROUPS = [
  { title: 'Design Specifications', sub: 'Thông số thiết kế', fields: [['material', 'Chất liệu'], ['line', 'Dòng sản phẩm'], ['tilt', 'Góc nghiêng'], ['height', 'Chiều cao'], ['diameter', 'Đường kính']] },
  { title: 'Installation Specifications', sub: 'Thông số lắp đặt', fields: [['driverSeparate', 'Lắp đặt bộ nguồn rời'], ['cutout', 'Kích thước lỗ khoét trần (Cutout Size)'], ['protection', 'Cấp bảo vệ điện'], ['driverPosition', 'Vị trí lắp nguồn']] },
  { title: 'Performance Specifications', sub: 'Thông số hiệu suất', fields: [['lumen', 'Quang thông'], ['ip', 'Chỉ số IP'], ['efficacy', 'Hiệu suất phát quang (lm/W)'], ['ugr', 'UGR'], ['life', 'Tuổi thọ']] },]

/* Tạo bản sao của một sản phẩm (nút nhân bản) */
export function cloneProduct(p) {
  seq += 1
  return { ...p, id: `pd${seq}`, code: `${p.code}-COPY`, approval: 'pending', fav: false }
}

/* File tải về: các dòng đang lọc × các cột đang hiện, dạng CSV có BOM để Excel đọc đúng tiếng Việt */
export function productsCsv(products, columns) {
  const cell = text => (/[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text)
  const cols = columns.filter(c => c.key !== 'image')
  const head = ['STT', 'Tên sản phẩm', 'Mã sản phẩm', ...cols.map(c => c.label)]
  const rows = products.map((p, i) => [String(i + 1), p.name, p.code, ...cols.map(c => productText(p, c.key))])
  return `﻿${[head, ...rows].map(r => r.map(cell).join(',')).join('\n')}\n`
}
