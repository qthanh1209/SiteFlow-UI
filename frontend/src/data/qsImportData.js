/* Dữ liệu màn "Nhập dữ liệu" của QS — form nhập sản phẩm, các khối trường thay đổi theo ngành hàng */

export const toNumber = text => Number(String(text).replace(/[^\d.]/g, '')) || 0
/* Giá đại lý = Giá bán lẻ × (1 − %Chiết khấu); thiếu một trong hai thì chưa tính */
export function dealerPrice(form) {
  if (form.retail === '' || form.discount === '') return null
  return Math.round(toNumber(form.retail) * (1 - Math.min(100, toNumber(form.discount)) / 100))
}

/* field: { key, label, req?, ph? (mặc định = label), type?: 'money' | 'percent' | 'computed' | 'textarea' | 'select' | 'combo',
   compute? (của ô computed), options? (của ô select / combo), suffix? (đơn vị hiện cuối ô), hint? (ghi chú dưới ô) }
   section: { key, title, icon, note?, fields } hoặc thay fields bằng byCategory: { [hạng mục]: fields } khi thông số đổi theo Hạng mục;
   hoặc { key, custom: 'specGroups' } = khối đề mục thông số tự do; footer: 'rowPreview' = dòng xem trước dưới khối */
const BASIC = {
  key: 'basic', title: 'Thông tin cơ bản', icon: 'tag',
  fields: [
    { key: 'brand', label: 'Thương hiệu', req: true },
    { key: 'supplier', label: 'Nhà cung cấp', req: true },
    { key: 'category', label: 'Hạng mục', req: true },
    { key: 'line', label: 'Dòng sản phẩm', req: true },
    { key: 'group', label: 'Nhóm sản phẩm', ph: 'Để trống = lấy theo Dòng sản phẩm' },
    { key: 'name', label: 'Tên sản phẩm', req: true },
    { key: 'code', label: 'Mã sản phẩm', req: true },
  ],
}
const PRICE = {
  key: 'price', title: 'Thông tin giá bán', icon: 'banknote',
  note: 'Giá đại lý tự tính = Giá bán lẻ × (1 − %Chiết khấu).',
  fields: [
    { key: 'retail', label: 'Giá bán lẻ', req: true, type: 'money' },
    { key: 'discount', label: '%Chiết khấu', req: true, type: 'percent' },
    { key: 'dealer', label: 'Giá đại lý', req: true, type: 'computed', compute: dealerPrice, ph: 'Tự tính từ giá bán & %CK' },
  ],
}
const FEATURES = {
  key: 'features', title: 'Tính năng', icon: 'fileText',
  note: 'Mỗi dòng một tính năng — hiện ở phần Thông tin sản phẩm (mở rộng).',
  fields: [{ key: 'features', label: 'Tính năng', type: 'textarea' }],
}
const COMMERCIAL = {
  key: 'commercial', title: 'Thương mại', icon: 'sliders',
  fields: [
    { key: 'warranty', label: 'Bảo hành (năm)' },
    { key: 'unit', label: 'Đơn vị tính', req: true },
    { key: 'status', label: 'Trạng thái' },
    { key: 'note', label: 'Ghi chú', type: 'textarea' },
  ],
}

/* Thông số của ngành Thiết bị vệ sinh thay đổi theo Hạng mục: key = khối "Thông tin chính", design = khối "Thông số thiết kế" */
const f = (key, label, req, ph) => ({ key, label, req, ph })
const S_SIZE = f('size', 'Kích thước (D×R×C)', true, 'VD: 700×380×765 mm')
const S_COLOR = f('color', 'Màu sắc', true)
const S_PLATING = f('color', 'Màu / lớp mạ', true, 'VD: Chrome · Đen mờ · Vàng PVD')
const S_MATERIAL = f('material', 'Chất liệu', false, 'VD: Sứ · Đồng · Inox 304')
const S_GLAZE = f('finish', 'Lớp men', false, 'VD: Men Nano · CeFiONtect')
const S_INSTALL = (req, ph) => f('installType', 'Kiểu lắp đặt', req, ph)
const S_POWER = req => f('power', 'Nguồn điện', req, 'VD: 220V · Pin AA')
const S_FLOW = f('flowRate', 'Lưu lượng (L/phút)')
const S_PRESSURE = f('waterPressure', 'Áp lực nước (MPa)', false, 'VD: 0.05 – 0.75')
const S_FLUSH_VOLUME = req => f('flushVolume', 'Lượng nước xả (L)', req, 'VD: 3/4.5')
const SANITARY_SPECS = {
  'Bồn cầu': {
    key: [f('productType', 'Kiểu bồn cầu', true, 'VD: 1 khối · 2 khối · Treo tường'), f('flushType', 'Kiểu xả', true, 'VD: Xả xoáy · Xả thẳng'), S_FLUSH_VOLUME(true), f('roughIn', 'Tâm xả (mm)', true, 'VD: 305'), f('seatType', 'Loại nắp', false, 'VD: Nắp êm · Nắp rửa cơ')],
    design: [S_SIZE, S_COLOR, S_MATERIAL, S_GLAZE, f('outlet', 'Kiểu thoát', false, 'VD: Thoát sàn · Thoát ngang')],
  },
  'Nắp rửa điện tử': {
    key: [f('productType', 'Loại nắp', true, 'VD: Nắp rửa điện tử · Nắp rửa cơ'), f('washModes', 'Chức năng rửa', true, 'VD: Rửa sau · Rửa trước · Massage'), S_POWER(true), f('wattage', 'Công suất (W)'), f('comfort', 'Sấy / khử mùi / sưởi nắp')],
    design: [S_SIZE, S_COLOR, f('shape', 'Kiểu dáng', false, 'VD: Tròn · Elongated'), f('control', 'Điều khiển', false, 'VD: Bảng cạnh · Remote')],
  },
  Lavabo: {
    key: [f('productType', 'Kiểu lavabo', true, 'VD: Đặt bàn · Âm bàn · Treo tường'), f('tapHoles', 'Số lỗ vòi', true, 'VD: 1 lỗ · 3 lỗ · Không lỗ'), f('overflow', 'Xả tràn', false, 'VD: Có · Không')],
    design: [S_SIZE, S_COLOR, S_MATERIAL, S_GLAZE],
  },
  'Vòi lavabo': {
    key: [f('productType', 'Loại vòi', true, 'VD: Nóng lạnh · Lạnh · Cảm ứng'), S_INSTALL(true, 'VD: Gắn chậu · Gắn tường'), S_FLOW, S_PRESSURE],
    design: [f('height', 'Chiều cao vòi', true, 'VD: 165 mm'), f('reach', 'Tầm với vòi', false, 'VD: 110 mm'), S_PLATING, S_MATERIAL],
  },
  'Sen tắm': {
    key: [f('productType', 'Loại sen', true, 'VD: Sen cây · Sen tay · Sen âm tường'), f('valveType', 'Loại van', true, 'VD: Nóng lạnh · Ổn nhiệt'), f('sprayModes', 'Số chế độ phun'), S_FLOW, S_PRESSURE],
    design: [f('headSize', 'Kích thước bát sen', true, 'VD: Ø250 · 300×300'), f('height', 'Chiều cao thân sen', false, 'VD: 900 – 1200 mm'), S_PLATING, S_MATERIAL],
  },
  'Bồn tắm': {
    key: [f('productType', 'Loại bồn', true, 'VD: Đặt sàn · Xây · Massage'), f('capacity', 'Dung tích (L)', true), f('massage', 'Massage / sục khí'), S_POWER(false)],
    design: [S_SIZE, S_COLOR, { ...S_MATERIAL, req: true, ph: 'VD: Acrylic · Gang tráng men' }, f('drainPosition', 'Vị trí xả', false, 'VD: Giữa · Trái · Phải')],
  },
  'Bồn tiểu': {
    key: [f('productType', 'Kiểu bồn tiểu', true, 'VD: Treo tường · Đặt sàn'), f('flushType', 'Kiểu xả', true, 'VD: Cảm ứng · Nhấn tay'), S_FLUSH_VOLUME(false), S_POWER(false)],
    design: [S_SIZE, S_COLOR, S_MATERIAL, S_GLAZE],
  },
  'Chậu rửa': {
    key: [f('bowls', 'Số hộc', true, 'VD: 1 hộc · 2 hộc lệch'), S_INSTALL(true, 'VD: Lắp âm · Lắp dương'), f('thickness', 'Độ dày', false, 'VD: 1.2 mm'), f('drainSize', 'Đường kính lỗ xả', false, 'VD: Ø110')],
    design: [S_SIZE, f('depth', 'Độ sâu hộc', false, 'VD: 220 mm'), f('color', 'Màu / bề mặt', false, 'VD: Xước mờ · Nano đen'), { ...S_MATERIAL, req: true, ph: 'VD: Inox 304 · Đá Granite' }],
  },
  'Phụ kiện vệ sinh': {
    key: [f('productType', 'Loại phụ kiện', true, 'VD: Móc áo · Kệ kính · Lô giấy'), S_INSTALL(false, 'VD: Bắt vít · Dán')],
    design: [{ ...S_SIZE, req: false, ph: 'VD: 600×120×50 mm' }, S_PLATING, { ...S_MATERIAL, req: true }],
  },
  'Thiết bị khác': {
    key: [f('productType', 'Loại thiết bị', true), f('mainSpec', 'Thông số chính')],
    design: [{ ...S_SIZE, req: false }, { ...S_COLOR, req: false }, S_MATERIAL],
  },
}

/* Thông số của ngành Sơn nước thay đổi theo Hạng mục: key = khối "Thông tin chính",
   physical = khối "Tính chất vật lý & hoá học" (mục IX của bảng dữ liệu an toàn) */
const P_SIZE = ph => f('size', 'Kích thước (dung tích)', true, ph)
const P_FINISH = f('finish', 'Bề mặt hoàn thiện', true, 'VD: Bóng · Bóng mờ · Mờ')
const P_COLOR = f('color', 'Màu sắc', true, 'VD: Trắng · Pha màu theo mã')
const P_COVERAGE = ph => f('coverage', 'Độ phủ', true, ph)
const P_COATS = req => f('coats', 'Số lớp', req)
const P_DRY = f('dryTime', 'Thời gian khô', false, 'VD: 1-2 giờ')
const P_SURFACE = ph => f('surface', 'Bề mặt áp dụng', false, ph)
const P_STATE = ph => f('physicalState', 'Trạng thái vật lý', false, ph)
const P_APPEARANCE = f('appearance', 'Màu / ngoại quan', false, 'VD: Trắng sữa')
const P_ODOR = f('odor', 'Mùi', false, 'VD: Nhẹ, đặc trưng')
const P_PH = f('ph', 'Độ pH', false, 'VD: 8 – 9.5')
const P_SOLUBILITY = f('solubility', 'Độ hoà tan trong nước', false, 'VD: Phân tán được')
const PAINT_LIQUID = [
  P_STATE('VD: Lỏng, sệt'), P_APPEARANCE, P_ODOR, P_PH,
  f('density', 'Tỷ trọng (g/cm³)', false, 'VD: 1.30 – 1.45'), f('viscosity', 'Độ nhớt', false, 'VD: 95 – 110 KU'),
  f('solids', 'Hàm lượng chất rắn (%)'), f('voc', 'Hàm lượng VOC (g/L)'),
  f('flashPoint', 'Điểm chớp cháy', false, 'VD: Không bắt cháy'), P_SOLUBILITY,
]
const PAINT_POWDER = [
  P_STATE('VD: Bột mịn'), P_APPEARANCE, P_ODOR, f('ph', 'Độ pH (khi trộn nước)', false, 'VD: 11 – 12.5'),
  f('density', 'Khối lượng riêng (g/cm³)'), f('fineness', 'Độ mịn'), P_SOLUBILITY,
]
const PAINT_TOPCOAT = surface => [P_SIZE('VD: 1L · 5L · 18L'), P_FINISH, P_COLOR, P_COVERAGE('VD: 12-14 m²/L/lớp'), P_COATS(false), P_DRY, P_SURFACE(surface)]
const PAINT_SPECS = {
  'Sơn nội thất': { key: PAINT_TOPCOAT('VD: Tường, trần trong nhà'), physical: PAINT_LIQUID },
  'Sơn ngoại thất': { key: PAINT_TOPCOAT('VD: Tường ngoài trời'), physical: PAINT_LIQUID },
  'Sơn lót': {
    key: [P_SIZE('VD: 5L · 18L'), P_COVERAGE('VD: 10-12 m²/L/lớp'), P_COATS(false), P_DRY, P_SURFACE('VD: Tường mới · Tường cũ'), f('alkaliResist', 'Kháng kiềm', false, 'VD: Có · Không')],
    physical: PAINT_LIQUID,
  },
  'Sơn chống thấm': {
    key: [P_SIZE('VD: 6 Kg · 20 Kg'), P_COVERAGE('VD: 2-2.5 m²/kg/2 lớp'), P_COATS(true), P_DRY, P_SURFACE('VD: Sàn mái · Tường đứng · Nhà vệ sinh'), f('mixRatio', 'Tỷ lệ pha', false, 'VD: 1 xi măng : 1 chống thấm')],
    physical: PAINT_LIQUID,
  },
  'Sơn hiệu ứng': {
    key: [P_SIZE('VD: 1L · 5L'), f('effect', 'Loại hiệu ứng', true, 'VD: Bê tông · Ánh kim · Nhung'), P_COLOR, P_COVERAGE('VD: 6-8 m²/L/lớp'), P_COATS(false), f('tools', 'Dụng cụ thi công', false, 'VD: Bay · Cọ · Con lăn')],
    physical: PAINT_LIQUID,
  },
  'Bả matit': {
    key: [P_SIZE('VD: 20 Kg · 40 Kg'), P_COVERAGE('VD: 1-1.2 m²/kg/2 lớp'), P_COATS(false), P_DRY, P_SURFACE('VD: Nội thất · Nội & ngoại thất'), f('mixRatio', 'Tỷ lệ trộn nước', false, 'VD: 3 bột : 1 nước')],
    physical: PAINT_POWDER,
  },
}

/* Hạng mục có sẵn của ngành Xây dựng (ô Hạng mục vẫn cho gõ và thêm giá trị mới) */
const CONSTRUCTION_CATEGORIES = ['Biện pháp thi công hầm']

/* Ngành hàng: sections = các khối trường của form; variants = các ô "Nhập biến thể" (mỗi ô ghi đè trường cùng key),
   rỗng thì ẩn khối biến thể; noun = cách gọi một dòng dữ liệu của ngành; imageOptional = không bắt buộc hình đại diện;
   docs = ghi chú và nhãn riêng của khối Tài liệu (không có thì dùng mặc định); defaults = giá trị điền sẵn của form;
   derive(form, key) = các trường tính lại sau khi sửa trường key; stats(saved) = số liệu trên thanh ngành hàng;
   nameLabel / brandCol = tiêu đề cột tên và cột thương hiệu ở bảng "vừa nhập" */
export const IMPORT_INDUSTRIES = [
  {
    key: 'lighting', label: 'Thiết bị đèn · sản phẩm', count: 533, noun: 'sản phẩm',
    sections: [
      BASIC, PRICE,
      {
        key: 'keyInfo', title: 'Key Product Info (Thông tin chính)', icon: 'sun',
        fields: [
          { key: 'power', label: 'Công suất', req: true, ph: 'VD: 7 · 2×5 · 9/18' },
          { key: 'cct', label: 'Nhiệt độ màu', req: true },
          { key: 'beam', label: 'Góc chiếu', req: true },
          { key: 'color', label: 'Màu sắc', req: true },
          { key: 'material', label: 'Chất liệu', req: true },
        ],
      },
      {
        key: 'design', title: 'Thông số thiết kế', icon: 'maximize',
        fields: [
          { key: 'tilt', label: 'Góc nghiêng' },
          { key: 'height', label: 'Chiều cao' },
          { key: 'diameter', label: 'Đường kính', req: true },
        ],
      },
      {
        key: 'performance', title: 'Performance Specifications (Thông số hiệu suất)', icon: 'gauge',
        fields: [
          { key: 'lumen', label: 'Quang thông', req: true },
          { key: 'ip', label: 'Chỉ số IP (Chống bụi, nước)', req: true },
          { key: 'cri', label: 'CRI', req: true },
          { key: 'efficacy', label: 'Hiệu suất phát quang (lm/W)' },
          { key: 'ugr', label: 'UGR' },
          { key: 'sdcm', label: 'SDCM' },
          { key: 'coi', label: 'COI' },
          { key: 'life', label: 'Tuổi thọ' },
          { key: 'chipName', label: 'Tên chip LED' },
          { key: 'chipType', label: 'Loại chip LED' },
        ],
      },
      {
        key: 'driver', title: 'Driver (Nguồn LED / Chấn lưu)', icon: 'link',
        fields: [
          { key: 'driverSeparate', label: 'Lắp nguồn rời' },
          { key: 'driverName', label: 'Tên bộ nguồn' },
          { key: 'driverCode', label: 'Mã bộ nguồn' },
          { key: 'driverBrand', label: 'Hãng bộ nguồn' },
          { key: 'driverPrice', label: 'Giá bán bộ nguồn', type: 'money', ph: 'VNĐ — giá bán rời của bộ nguồn' },
          { key: 'driverPosition', label: 'Vị trí lắp nguồn' },
          { key: 'driverControl', label: 'Tương thích điều khiển' },
          { key: 'driverCurrent', label: 'Dòng ra tối đa (mA)' },
        ],
      },
      {
        key: 'install', title: 'Installation Specifications (Thông số lắp đặt)', icon: 'settings',
        fields: [
          { key: 'cutout', label: 'Lỗ khoét trần (Cutout)', req: true, ph: 'VD: Ø75 · Ø40×78 · 60×60' },
          { key: 'protection', label: 'Cấp bảo vệ điện' },
        ],
      },
      COMMERCIAL,
    ],
    variants: [
      { key: 'cct', label: 'Nhiệt độ màu (K)', ph: 'VD: 3000, 4000, 6500' },
      { key: 'power', label: 'Công suất (W)', ph: 'VD: 7, 9, 12' },
      { key: 'beam', label: 'Góc chiếu (°)', ph: 'VD: 24, 36, 60' },
      { key: 'color', label: 'Màu sắc', ph: 'VD: Đen, Trắng, Vàng' },
    ],
  },
  {
    key: 'sanitary', label: 'Thiết bị vệ sinh · sản phẩm', count: 267, noun: 'sản phẩm',
    sections: [
      {
        ...BASIC,
        fields: BASIC.fields.map(f => (
          f.key === 'category' ? { ...f, type: 'select', ph: '— Chọn hạng mục —', options: Object.keys(SANITARY_SPECS) }
            : f.key === 'line' ? { ...f, ph: 'VD: Bồn cầu treo tường' } : f
        )),
      },
      PRICE,
      {
        key: 'keyInfo', title: 'Key Product Info (Thông tin chính)', icon: 'sun',
        note: 'Thông số theo hạng mục đã chọn — lên cột "Thông tin chính" của bảng bóc tách.',
        byCategory: Object.fromEntries(Object.entries(SANITARY_SPECS).map(([name, spec]) => [name, spec.key])),
      },
      {
        key: 'design', title: 'Thông số thiết kế', icon: 'maximize',
        note: 'Thông số theo hạng mục đã chọn — lên cột "Thông số thiết kế" của bảng bóc tách.',
        byCategory: Object.fromEntries(Object.entries(SANITARY_SPECS).map(([name, spec]) => [name, spec.design])),
      },
      FEATURES,
      COMMERCIAL,
    ],
    variants: [],
  },
  {
    key: 'paint', label: 'Sơn nước · sản phẩm', count: 149, noun: 'sản phẩm',
    sections: [
      {
        ...BASIC,
        fields: BASIC.fields.map(x => (
          x.key === 'category' ? { ...x, type: 'select', ph: '— Chọn hạng mục —', options: Object.keys(PAINT_SPECS) }
            : x.key === 'line' ? { ...x, ph: 'VD: Sơn nội thất lau chùi hiệu quả' } : x
        )),
      },
      PRICE,
      {
        key: 'keyInfo', title: 'Key Product Info (Thông tin chính)', icon: 'sun',
        note: 'Thông số theo hạng mục đã chọn — lên cột "Thông tin chính" của bảng bóc tách.',
        byCategory: Object.fromEntries(Object.entries(PAINT_SPECS).map(([name, spec]) => [name, spec.key])),
      },
      {
        key: 'physical', title: 'Tính chất vật lý & hoá học', icon: 'fileText',
        note: 'Theo mục IX của bảng dữ liệu an toàn — lên cột "Thông số thiết kế" của bảng bóc tách.',
        byCategory: Object.fromEntries(Object.entries(PAINT_SPECS).map(([name, spec]) => [name, spec.physical])),
      },
      FEATURES,
      COMMERCIAL,
    ],
    variants: [
      { key: 'size', label: 'Kích thước (dung tích)', ph: 'VD: 1L, 5L, 18L' },
      { key: 'finish', label: 'Bề mặt hoàn thiện', ph: 'VD: Bóng, Mờ' },
      { key: 'color', label: 'Màu sắc', ph: 'VD: Trắng, Kem, Xám' },
    ],
    docs: {
      note: 'Tải file lên (PDF, ảnh, bảng dữ liệu an toàn, ZIP...) hoặc dán link — hiện thành nút mở trong Thông tin sản phẩm.',
      labels: { guide: 'Hướng dẫn thi công', drawing: 'Bảng màu / File bản vẽ' },
    },
  },
  {
    key: 'construction', label: 'Xây dựng · công tác phần thô', count: 217, noun: 'công tác', imageOptional: true,
    nameLabel: 'Nội dung công việc', brandCol: { key: 'supplier', label: 'Nhà cung cấp' },
    defaults: { category: 'Biện pháp thi công hầm', discount: '0', quoteType: 'Khái toán chi tiết', calcMode: 'Khối lượng × đơn giá' },
    /* Sửa giá bán lẻ / %chiết khấu thì tính giá đại lý; sửa giá đại lý thì tính ngược %chiết khấu */
    derive(form, key) {
      const retail = toNumber(form.retail)
      if (key === 'retail' || key === 'discount') {
        return form.retail === '' ? {} : { dealer: String(Math.round(retail * (1 - Math.min(100, toNumber(form.discount)) / 100))) }
      }
      if (key === 'dealer' && retail > 0 && form.dealer !== '') {
        return { discount: String(Math.max(0, Math.round((1 - toNumber(form.dealer) / retail) * 10000) / 100)) }
      }
      return {}
    },
    stats: saved => [
      [217 + saved.length, 'Công tác trong CSDL'],
      [217 + saved.length, 'Chờ duyệt'],
      [24 + new Set(saved.map(it => it.form.category).filter(c => c && !CONSTRUCTION_CATEGORIES.includes(c))).size, 'Hạng mục'],
    ],
    sections: [
      {
        key: 'basic', title: 'Thông tin cơ bản', icon: 'tag',
        fields: [
          { key: 'name', label: 'Tên hạng mục', req: true, ph: 'VD: Giàn tải, máy ép cọc Pmax 90T' },
          { key: 'supplier', label: 'Nhà cung cấp (Nếu có)', type: 'combo', ph: 'VD: H77', options: ['H77', 'Decox', 'TTP', 'Unicons'] },
          { key: 'category', label: 'Hạng mục', req: true, type: 'combo', ph: 'VD: Biện pháp thi công hầm', options: CONSTRUCTION_CATEGORIES },
          {
            key: 'classify', label: 'Phân loại (đề mục bóc tách)', type: 'select', ph: '— Tự nhận theo tên hạng mục: chưa nhận ra —',
            options: [
              'Chỉ nằm ở 3.1 Phần thô', '3.2.1 · Thạch cao', '3.2.2 · Sơn nước', '3.2.3 · Xây tô', '3.2.4 · Ốp lát', '3.2.5 · Thiết bị vệ sinh',
              '3.2.6 · Thiết bị điện', '3.2.6.1 · Thiết bị đèn', '3.2.6.2 · Công tắc - ổ cắm', '3.2.7 · Điện lạnh', '3.2.8 · Cửa',
              '3.2.8.1 · Cửa ngoại thất', '3.2.8.2 · Cửa nội thất',
            ],
            hint: 'Công tác luôn có ở 3.1 Phần thô. Chọn thêm đề mục (VD 3.2.2 Sơn nước) để khi bóc tách đề mục đó cũng chọn được công tác này.',
          },
        ],
      },
      {
        key: 'price', title: 'Thông tin giá bán', icon: 'banknote', footer: 'rowPreview',
        note: 'Giá đại lý tự tính = Giá bán lẻ × (1 − %Chiết khấu). Nhập giá đại lý thì %Chiết khấu tự tính ngược lại.',
        fields: [
          { key: 'retail', label: 'Giá bán lẻ', req: true, type: 'money', ph: 'VD: 450.000', suffix: 'VND' },
          { key: 'discount', label: '%Chiết khấu', req: true, type: 'percent', ph: '0', suffix: '%' },
          { key: 'dealer', label: 'Giá đại lý', req: true, type: 'money', ph: 'Tự tính', suffix: 'VND' },
          { key: 'unit', label: 'Đơn vị tính', req: true, type: 'combo', ph: 'VD: gói · m · m2 · tim', options: ['m', 'm2', 'm3', 'md', 'tim', 'gói', 'cái', 'bộ', 'kg', 'tấn'] },
        ],
      },
      { key: 'specGroups', custom: 'specGroups' },
      {
        key: 'quote', title: 'Báo giá & cách tính', icon: 'sliders',
        fields: [
          { key: 'quoteType', label: 'Loại báo giá', req: true, type: 'select', options: ['Khái toán chi tiết', 'Khái toán sơ bộ', 'Dự toán · Nhân công', 'Dự toán · Vật tư'] },
          { key: 'calcMode', label: 'Cách tính', type: 'select', options: ['Khối lượng × đơn giá', 'Diện tích × hệ số', 'Chỉ tính khối lượng', 'Chỉ liệt kê'] },
          { key: 'defaultQty', label: 'Số lượng mặc định', type: 'money', ph: 'VD: 1' },
          { key: 'note', label: 'Ghi chú', type: 'textarea' },
        ],
      },
    ],
    variants: [],
  },
]

export const findIndustry = key => IMPORT_INDUSTRIES.find(x => x.key === key)
/* Trường đang hiện của một khối: khối byCategory lấy theo Hạng mục đã chọn trong form */
export const sectionFields = (section, form) => (section.byCategory ? section.byCategory[form.category] || [] : section.fields || [])
/* Mọi trường người dùng nhập (bỏ ô tự tính) của một ngành, gồm cả thông số của từng hạng mục — một key có thể lặp lại với nhãn khác */
const everyField = industry => industry.sections.flatMap(s => s.fields || Object.values(s.byCategory || {}).flat()).filter(f => f.type !== 'computed')
const uniqueByKey = fields => [...new Map(fields.map(f => [f.key, f])).values()]
/* Các trường người dùng nhập của một ngành. Có form: chỉ những trường đang hiện; không có: mọi trường (mỗi key một lần) */
export const industryFields = (industry, form) => (
  form ? industry.sections.flatMap(s => sectionFields(s, form)).filter(f => f.type !== 'computed') : uniqueByKey(everyField(industry))
)

export const IMPORT_DOC_KINDS = [
  { key: 'catalogue', label: 'Tài liệu kỹ thuật / Catalogue' },
  { key: 'spec', label: 'Thông số kỹ thuật' },
  { key: 'guide', label: 'Hướng dẫn cài đặt' },
  { key: 'drawing', label: 'File bản vẽ' },
]

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024

/* Form rỗng chứa trường của mọi ngành, nên đổi ngành hàng vẫn giữ được các giá trị dùng chung */
export const emptyImportForm = () => Object.fromEntries(IMPORT_INDUSTRIES.flatMap(everyField).map(f => [f.key, '']))
export const emptyDocs = () => Object.fromEntries(IMPORT_DOC_KINDS.map(k => [k.key, []]))
export const emptyVariants = () => Object.fromEntries(IMPORT_INDUSTRIES.flatMap(x => x.variants).map(v => [v.key, '']))

/* Các tổ hợp biến thể của một ngành: [{ cct, power, ... }] — không nhập ô nào thì trả về một tổ hợp rỗng */
export function variantCombos(industry, variants) {
  return industry.variants.reduce((combos, v) => {
    const values = [...new Set(variants[v.key].split(',').map(x => x.trim()).filter(Boolean))]
    return values.length ? combos.flatMap(c => values.map(value => ({ ...c, [v.key]: value }))) : combos
  }, [{}])
}

/* ---------- Nhập hàng loạt từ file CSV ---------- */
const csvCell = text => (/[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text)
/* File mẫu: một dòng tiêu đề theo đúng nhãn các trường của ngành (có BOM để Excel đọc đúng tiếng Việt) */
export const importTemplateCsv = industry => `﻿${industryFields(industry).map(f => csvCell(f.label)).join(',')}\n`

function parseCsv(text) {
  const rows = []
  let row = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1 } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = '' } else if (ch !== '\r') cell += ch
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

/* Đọc CSV thành danh sách form: dò cột theo tiêu đề các trường của ngành (không phân biệt hoa thường), bỏ dòng trống */
export function parseImportCsv(industry, text) {
  const [head, ...lines] = parseCsv(text.replace(/^﻿/, ''))
  if (!head) return []
  const fields = everyField(industry)
  const keys = head.map(h => {
    const label = h.trim().toLowerCase()
    const field = fields.find(f => f.label.toLowerCase() === label || f.key.toLowerCase() === label)
    return field ? field.key : null
  })
  return lines
    .filter(cells => cells.some(c => c.trim()))
    .map(cells => {
      const form = emptyImportForm()
      keys.forEach((key, i) => { if (key) form[key] = (cells[i] || '').trim() })
      return form
    })
}
