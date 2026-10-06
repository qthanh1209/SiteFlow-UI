/* Dữ liệu trang Bàn làm việc — lấy nguyên từ ban-lam-viec.html */

/* Nhiệm vụ của tôi (tổng hợp từ các hạng mục khác, tích điểm) */
export const MISSIONS = [
  { title: 'Khảo sát địa chất & hiện trạng', meta: 'Quản lý dự án · Quy trình thi công Lô B12', points: '+20đ' },
  { title: 'Duyệt đơn mua hàng PO-003', meta: 'Mua hàng · Đã nhận hàng', points: '+15đ' },
  { title: 'Xác nhận chấm công tuần', meta: 'HR · Chấm công', points: '+10đ' },
]

/* Task hàng ngày ban đầu */
export const INITIAL_TASKS = [
  { id: 1, title: 'Hoàn thiện bóc tách vật tư GĐ2', meta: 'Chung cư Riverside GĐ2 · Hạn 24/09', prio: 'high', done: false },
  { id: 2, title: 'Duyệt đơn mua hàng PO-004', meta: 'Mua hàng · Hạn 25/09', prio: 'med', done: false },
  { id: 3, title: 'Review App tiến độ thi công', meta: 'Quản lý dự án · Hạn 23/09', prio: 'high', done: false },
  { id: 4, title: 'Gửi báo giá cho khách Lô B12', meta: 'Kinh doanh · Hoàn thành 21/09', prio: 'low', done: true },
  { id: 5, title: 'Chuẩn bị họp kinh doanh tổng', meta: 'Kinh doanh · Hạn 24/09', prio: 'med', done: false },
  { id: 6, title: 'Cập nhật Wiki quy trình thi công', meta: 'Wiki · Hạn 27/09', prio: 'low', done: false },
  { id: 7, title: 'Xác nhận nhân sự tăng ca cuối tuần', meta: 'HR · Hạn 26/09', prio: 'med', done: false },
]

export const PRIO_LABEL = { high: 'Cao', med: 'TB', low: 'Thấp' }

/* Danh sách "Liên quan tới" trong modal thêm việc */
export const TASK_PROJECTS = ['Cá nhân', 'Quản lý dự án', 'Kinh doanh', 'Mua hàng', 'HR', 'Tài chính', 'Wiki']

/* Cấu hình 3 loại đơn từ (icon được vẽ trong component theo key) */
export const DONTU_CONFIG = {
  xinphep: { title: 'Xin phép nghỉ', dateFromLabel: 'Từ ngày', showAmount: false, reasonLabel: 'Lý do xin nghỉ', color: 'attendance' },
  tamung: { title: 'Đề nghị tạm ứng', dateFromLabel: 'Ngày cần nhận', showAmount: true, amountLabel: 'Số tiền đề nghị tạm ứng (đ)', reasonLabel: 'Lý do tạm ứng', color: 'finance' },
  hoanung: { title: 'Hoàn ứng', dateFromLabel: 'Ngày hoàn ứng', showAmount: true, amountLabel: 'Số tiền hoàn (đ)', reasonLabel: 'Nội dung quyết toán', color: 'primary' },
}

/* Thẻ chọn loại đơn trong tab Đơn từ */
export const FORM_CARDS = [
  { type: 'xinphep', title: 'Xin phép nghỉ', desc: 'Nghỉ phép năm, nghỉ ốm, nghỉ không lương' },
  { type: 'tamung', title: 'Tạm ứng', desc: 'Đề nghị tạm ứng lương / công tác phí' },
  { type: 'hoanung', title: 'Hoàn ứng', desc: 'Quyết toán khoản đã tạm ứng trước đó' },
]

/* Lịch sử đơn từ ban đầu. segs: [nhãn, trạng thái] */
export const INITIAL_REQUESTS = [
  {
    id: 1, type: 'xinphep', title: 'Xin phép nghỉ ốm — 18/09 đến 19/09', sub: 'Gửi 17/09/2026 · Sốt siêu vi, có giấy khám bệnh',
    approveTitle: 'Quản lý đã duyệt · HR đã duyệt', segs: [['QL ✓', 'done'], ['HR ✓', 'done']],
  },
  {
    id: 2, type: 'tamung', title: 'Tạm ứng công tác phí — 3.000.000đ', sub: 'Gửi 20/09/2026 · Công tác khảo sát Lô B12',
    approveTitle: 'Quản lý đã duyệt · Đang chờ HR duyệt', segs: [['QL ✓', 'done'], ['HR ⏳', 'active']],
  },
]

export const APPROVER_SUGGESTIONS = [
  'Nguyễn Đức Anh', 'Cao Hưng (CEO)', 'Đỗ Thành Long', 'Phan Bảo Ngọc',
  'Ngọc Hà', 'Lê Trung Kiên', 'Nguyễn Trung Thành', 'Ngô Mỹ Duyên',
]

/* "2026-09-26" -> "26/09" (giống split('-').reverse().slice(0,2).join('/')) */
export const shortDate = v => (v ? v.split('-').reverse().slice(0, 2).join('/') : '')

/* ---------- Dezbot ---------- */
export const AI_KB = {
  tiendo: 'Dự án "Chung cư Riverside GĐ2" đang hoàn thành 62% khối lượng — đúng tiến độ tổng thể. Hạng mục "Hoàn thiện" có 2 đầu việc đang trễ hạn, cần ưu tiên xử lý trong tuần này.',
  chamcong: 'Bạn có 18/20 ngày công đủ giờ tháng này, 1 lần đi trễ, còn 8/12 ngày phép năm. Đơn xin nghỉ ốm gần nhất đã được duyệt.',
  dongtien: 'Dòng tiền tháng này: Thu về 1.85 tỷ, Chi ra 1.42 tỷ — dương 430 triệu. Có 3 hoá đơn nhà cung cấp sắp đến hạn thanh toán trong 7 ngày tới.',
  khachhang: 'Hiện có 12 khách hàng đang trong giai đoạn đàm phán, 4 khách vừa ký hợp đồng trong tuần này. Cơ hội "Nhà phố Lô B12" có giá trị lớn nhất, đang chờ chốt hợp đồng.',
  tinnhan: 'Bạn có 6 tin nhắn chưa đọc trong Chat, tập trung ở nhóm "Dự án Riverside" và "Ban giám đốc". Muốn mình tóm tắt nội dung chính không?',
  boctach: 'Bóc tách khối lượng mới nhất từ QS ghi nhận tổng giá trị vật tư khoảng 11.93 triệu trên 5 đơn mua hàng, trong đó 2 đơn chưa đặt hàng.',
  quytrinh: 'Quy trình thi công hiện tại gồm 5 bước: Khảo sát → Thiết kế → Xin phép → Thi công → Nghiệm thu. Bước "Thi công" đang được nhiều dự án thực hiện nhất.',
  nhiemvu: 'Bạn đang có 7 nhiệm vụ, 2 việc sắp đến hạn: "Hoàn thiện bóc tách vật tư GĐ2" (24/09) và "Chuẩn bị họp kinh doanh tổng" (24/09). Tuần này đã hoàn thành 12 việc.',
  dontu: 'Bạn có 1 đơn tạm ứng công tác phí 3.000.000đ đang chờ duyệt (gửi 20/09), và 1 đơn xin nghỉ ốm đã được duyệt.',
  default: 'Mình đã tra trong dữ liệu workspace nhưng chưa tìm thấy câu trả lời chính xác cho câu hỏi này — bạn thử hỏi cụ thể hơn về nhiệm vụ, chấm công, đơn từ, dòng tiền, khách hàng, bóc tách hoặc quy trình nhé.',
}

export function matchTopic(text) {
  const t = text.toLowerCase()
  const has = s => t.indexOf(s) > -1
  if (has('đơn từ') || has('tạm ứng') || has('hoàn ứng') || has('chờ duyệt')) return 'dontu'
  if (has('nhiệm vụ') || has('task')) return 'nhiemvu'
  if (has('tiến độ') || has('tien do') || has('dự án')) return 'tiendo'
  if (has('chấm công') || has('nhân công') || has('nhân sự') || has('nghỉ phép') || has('ngày phép')) return 'chamcong'
  if (has('dòng tiền') || has('hoá đơn') || has('hóa đơn') || has('thu') || has('chi')) return 'dongtien'
  if (has('khách hàng') || has('hợp đồng')) return 'khachhang'
  if (has('tin nhắn') || has('chat')) return 'tinnhan'
  if (has('bóc tách') || has('mua hàng') || has('vật tư')) return 'boctach'
  if (has('quy trình')) return 'quytrinh'
  return 'default'
}

/* Câu hỏi gửi đi khi bấm chip chủ đề */
export const AI_TOPIC_LABELS = {
  tiendo: 'Tiến độ dự án đang thế nào?',
  chamcong: 'Tình hình chấm công hôm nay?',
  dongtien: 'Dòng tiền tháng này ra sao?',
  khachhang: 'Khách hàng nào đang tiềm năng?',
  tinnhan: 'Tôi có tin nhắn nào chưa đọc?',
}

export const AI_SUGGESTIONS = [
  'Tôi còn bao nhiêu ngày phép?',
  'Đơn từ nào đang chờ duyệt?',
  'Tóm tắt nhiệm vụ của tôi tuần này',
]
