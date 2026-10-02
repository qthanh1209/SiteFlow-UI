export const stages = [
  ['tiep-can', 'Tiếp cận'], ['tu-van', 'Tư vấn (Concept)'],
  ['bao-gia', 'Báo giá (Thiết kế - Khái toán)'], ['dam-phan', 'Đàm phán'],
  ['chot-hd', 'Chốt hợp đồng'], ['bao-gia-thi-cong', 'Báo giá (Thi công)'],
  ['thiet-ke', 'Dự án (Thiết kế)'], ['thi-cong', 'Dự án (Thi công)'],
  ['truot-thau', 'Đã trượt thầu'],
]
export const stageLabels = Object.fromEntries(stages)
export const departments = { 'du-an': 'Phòng KD Dự Án', 'dan-dung': 'Phòng KD Dân dụng' }
export const deptShort = { 'du-an': 'Dự án', 'dan-dung': 'Dân dụng' }
export const deptColors = { 'du-an': 'var(--primary)', 'dan-dung': 'var(--attendance)' }
export const deptTints = { 'du-an': 'var(--primary-tint)', 'dan-dung': 'var(--attendance-tint)' }
export const designStages = [
  ['intake', 'Chờ tiếp nhận', 'var(--text-muted)'], ['concept', 'Lên concept', 'var(--primary)'],
  ['drafting', 'Triển khai bản vẽ', 'var(--finance)'], ['review', 'Chờ khách duyệt', 'var(--gold)'],
  ['approved', 'Đã duyệt', 'var(--success)'],
]
export const constructionStages = [
  ['prep', 'Chuẩn bị mặt bằng', 'var(--text-muted)'], ['structure', 'Thi công phần thô', 'var(--primary)'],
  ['finishing', 'Hoàn thiện', 'var(--finance)'], ['acceptance', 'Nghiệm thu', 'var(--gold)'],
  ['handover', 'Đã bàn giao', 'var(--success)'],
]
export const initialLeads = [
  { id: 'l1', name: 'Anh Minh Khang', type: 'Nhà phố', value: 1.8, stage: 'tiep-can', dept: 'dan-dung', createdAt: '2026-09-27' },
  { id: 'l2', name: 'Chị Lan Anh', type: 'Biệt thự', value: 5.2, stage: 'tiep-can', dept: 'dan-dung', createdAt: '2026-09-25' },
  { id: 'l3', name: 'Cty XYZ Group', type: 'Văn phòng', value: 3.5, stage: 'tiep-can', dept: 'du-an', createdAt: '2026-09-20' },
  { id: 'l4', name: 'Anh Đức Thịnh', type: 'Nhà phố', value: 2, stage: 'tiep-can', dept: 'dan-dung', createdAt: '2026-09-10' },
  { id: 'l5', name: 'Chị Thu Hằng', type: 'Chung cư mini', value: 4.1, stage: 'tiep-can', dept: 'dan-dung', createdAt: '2026-08-15' },
  { id: 'l6', name: 'Chị Bích Ngọc', type: 'Biệt thự', value: 6, stage: 'tu-van', dept: 'dan-dung', createdAt: '2026-09-22' },
  { id: 'l7', name: 'Anh Hoàng Long', type: 'Nhà phố', value: 2.3, stage: 'tu-van', dept: 'dan-dung', createdAt: '2026-09-05' },
  { id: 'l8', name: 'Cty Minh Phát', type: 'Văn phòng', value: 4.8, stage: 'tu-van', dept: 'du-an', createdAt: '2026-08-28' },
  { id: 'l9', name: 'Anh Tuấn Kiệt', type: 'Nhà phố', value: 1.9, stage: 'tu-van', dept: 'dan-dung', createdAt: '2026-07-30' },
  { id: 'l10', name: 'Chị Minh Thư', type: 'Biệt thự Song lập — Thảo Điền', value: 6.8, stage: 'bao-gia', dept: 'dan-dung', createdAt: '2026-09-18' },
  { id: 'l11', name: 'Anh Văn Sơn', type: 'Nhà phố', value: 2.2, stage: 'bao-gia', dept: 'dan-dung', createdAt: '2026-08-22' },
  { id: 'l12', name: 'Cty Đông Dương', type: 'Văn phòng', value: 5.5, stage: 'bao-gia', dept: 'du-an', createdAt: '2026-06-15' },
  { id: 'l13', name: 'BQL Riverside', type: 'Mở rộng Giai đoạn 3', value: 15, stage: 'dam-phan', dept: 'du-an', createdAt: '2026-09-23' },
  { id: 'l14', name: 'Chị Hải Yến', type: 'Biệt thự Nhà Bè', value: 7.2, stage: 'dam-phan', dept: 'dan-dung', createdAt: '2026-07-12' },
  { id: 'l17', name: 'Anh Phúc Nguyên', type: 'Nhà phố', value: 2.4, stage: 'chot-hd', dept: 'dan-dung', createdAt: '2026-09-01' },
  { id: 'l18', name: 'Chị Ngọc Diễm', type: 'Nhà phố', value: 2.6, stage: 'thiet-ke', sub: 'concept', dept: 'dan-dung', createdAt: '2026-05-20' },
  { id: 'l19', name: 'Anh Bảo Long', type: 'Biệt thự', value: 5.4, stage: 'thiet-ke', sub: 'review', dept: 'dan-dung', partner: true, createdAt: '2026-04-10' },
  { id: 'l15', name: 'Anh Quang Huy', type: 'Nhà phố Lô B12 — KDC Bình Chánh', value: 2.1, stage: 'thi-cong', sub: 'structure', dept: 'dan-dung', createdAt: '2026-03-15' },
  { id: 'l16', name: 'Cty TNHH ABC Logistics', type: 'Văn phòng cho thuê — Q3', value: 4.2, stage: 'thi-cong', sub: 'handover', dept: 'du-an', partner: true, createdAt: '2026-02-01' },
  { id: 'l20', name: 'Anh Trọng Tấn', type: 'Nhà phố', value: 2.7, stage: 'truot-thau', dept: 'dan-dung', createdAt: '2026-09-15' },
]
export const categories = [
  'Thiết kế kiến trúc', 'Thiết kế nội thất', 'Thiết kế cảnh quan', 'Thi công phần thô',
  'Thi công phần hoàn thiện cơ bản', 'Thi công nội thất', 'Cung cấp đồ rời',
  'Thi công trọn gói (chìa khóa trao tay)',
]
export const leaderboard = [
  { name: 'Trần Anh', team: 'Trưởng phòng KD', color: '#C2621A', week: 150, total: 1780 },
  { name: 'Đặng Quốc Cường', team: 'Phòng KD Dự Án', color: '#2F5DA8', week: 120, total: 1420 },
  { name: 'Hoàng Yến Nhi', team: 'Phòng KD Dân dụng', color: '#0E8A82', week: 110, total: 1320 },
  { name: 'Vũ Đình Khoa', team: 'Phòng KD Dự Án', color: '#B7791F', week: 80, total: 960 },
  { name: 'Lâm Bảo Ngọc', team: 'Phòng KD Dân dụng', color: '#7658C2', week: 60, total: 760 },
]
export function makeTasks() {
  return [
    { title: 'Tiếp cận & xác minh khách hàng tiềm năng', status: 'done', subtasks: [
      { text: 'Gọi điện xác minh nhu cầu', who: 'Đặng Quốc Cường', pts: 20, done: true },
      { text: 'Ghi nhận thông tin vào hệ thống', who: 'Đặng Quốc Cường', pts: 15, done: true },
      { text: 'Phân loại theo phòng ban phụ trách', who: 'Trần Anh', pts: 15, done: true },
    ] },
    { title: 'Tư vấn & khảo sát nhu cầu', status: 'done', subtasks: [
      { text: 'Hẹn gặp tư vấn trực tiếp', who: 'Đặng Quốc Cường', pts: 20, done: true },
      { text: 'Khảo sát hiện trạng / mặt bằng', who: 'Vũ Đình Khoa', pts: 25, done: true },
      { text: 'Ghi nhận yêu cầu thiết kế', who: 'Đặng Quốc Cường', pts: 20, done: true },
    ] },
    { title: 'Lập báo giá', status: 'current', subtasks: [
      { text: 'Bóc tách sơ bộ chi phí', who: 'Vũ Đình Khoa', pts: 25, done: true },
      { text: 'Soạn báo giá & trình duyệt', who: 'Trần Anh', pts: 20, done: true },
      { text: 'Gửi báo giá cho khách hàng', who: 'Đặng Quốc Cường', pts: 15, done: false },
    ] },
    { title: 'Đàm phán hợp đồng', status: 'locked', subtasks: [
      { text: 'Trao đổi điều khoản thanh toán', who: 'Trần Anh', pts: 20, done: false },
      { text: 'Điều chỉnh phạm vi công việc', who: 'Vũ Đình Khoa', pts: 20, done: false },
      { text: 'Thống nhất tiến độ bàn giao', who: 'Đặng Quốc Cường', pts: 20, done: false },
    ] },
    { title: 'Chốt hợp đồng & bàn giao hồ sơ', status: 'locked', subtasks: [
      { text: 'Ký kết hợp đồng', who: 'Trần Anh', pts: 25, done: false },
      { text: 'Thu tạm ứng đợt 1', who: 'Trần Anh', pts: 20, done: false },
      { text: 'Bàn giao hồ sơ sang phòng Dự án / Thi công', who: 'Đặng Quốc Cường', pts: 20, done: false },
    ] },
  ]
}
export const rewards = [
  ['Phiếu ăn trưa miễn phí (1 tuần)', 300, 'var(--finance)', '☕'],
  ['Voucher nhà hàng 500.000đ', 500, 'var(--primary)', '◇'],
  ['Khoá học kỹ năng đàm phán', 700, 'var(--attendance)', '▤'],
  ['Ngày nghỉ phép thêm (1 ngày)', 1000, 'var(--success)', '▣'],
  ['Chuyến du lịch team quý (2 ngày 1 đêm)', 2500, 'var(--text-muted)', '✦'],
  ['Thưởng tiền mặt 1.000.000đ', 3000, 'var(--text-muted)', '▣'],
]
export const handoffSettings = {
  'bao-gia': { dept: 'QS', title: 'Phiếu yêu cầu báo giá', subtitle: 'Chuyển dự án sang Phòng QS để lập báo giá chi tiết', role: 'QS - Điều phối báo giá', self: true, status: 'pending-qs' },
  'bao-gia-thi-cong': { dept: 'QS', title: 'Phiếu yêu cầu báo giá thi công', subtitle: 'Chuyển dự án sang Phòng QS để lập báo giá thi công chi tiết', role: 'QS - Điều phối báo giá thi công', self: true, status: 'pending-qs' },
  'thiet-ke': { dept: 'Thiết kế', title: 'Phiếu bàn giao dự án', subtitle: 'Chuyển dự án sang Phòng Thiết kế để triển khai', role: 'Thiết kế - Tiếp nhận dự án', self: false, status: 'pending-handoff' },
  'thi-cong': { dept: 'Thi công', title: 'Phiếu bàn giao dự án', subtitle: 'Chuyển dự án sang Phòng Thi công để triển khai', role: 'Thi công - Tiếp nhận dự án', self: false, status: 'pending-handoff' },
}
export const blankLead = { name: '', phone: '', email: '', source: 'Giới thiệu', address: '', dept: 'dan-dung', projectType: 'Nhà phố', scale: '', categories: [], value: '', stage: 'tiep-can', concept: '', notes: '', partner: false, assignees: [], boqFile: '' }
