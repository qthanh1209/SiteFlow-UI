import { useState } from 'react'
import './Marketing.css'

// ---- Data ----
let CATALOG = [
  {id:'a1', group:'A', groupLabel:'Nhân sự (đã gồm BH & KPCĐ DN đóng)', name:'Head Marketing', unit:'người-tháng', price:21870000},
  {id:'a2', group:'A', groupLabel:'Nhân sự (đã gồm BH & KPCĐ DN đóng)', name:'Graphic Designer', unit:'người-tháng', price:18225000},
  {id:'a3', group:'A', groupLabel:'Nhân sự (đã gồm BH & KPCĐ DN đóng)', name:'Media (quay, dựng video)', unit:'người-tháng', price:19440000},
  {id:'a4', group:'A', groupLabel:'Nhân sự (đã gồm BH & KPCĐ DN đóng)', name:'Content Creator', unit:'người-tháng', price:17010000},
  {id:'a5', group:'A', groupLabel:'Nhân sự (đã gồm BH & KPCĐ DN đóng)', name:'Intern dựng video', unit:'người-tháng', price:3000000},
  {id:'a6', group:'A', groupLabel:'Nhân sự (đã gồm BH & KPCĐ DN đóng)', name:'Intern content', unit:'người-tháng', price:3500000},
  {id:'c1', group:'C', groupLabel:'Công cụ & phần mềm', name:'Adobe Creative Cloud', unit:'tháng', price:133333},
  {id:'c2', group:'C', groupLabel:'Công cụ & phần mềm', name:'CapCut Pro / phần mềm dựng khác', unit:'tháng', price:93333},
  {id:'c3', group:'C', groupLabel:'Công cụ & phần mềm', name:'Render video AI', unit:'tháng', price:780000},
  {id:'d1', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Máy quay / máy ảnh Sony a73', unit:'tháng', price:944444},
  {id:'d2', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Máy quay / máy ảnh Sony a7s3', unit:'tháng', price:2083333},
  {id:'d3', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Lens FE 1.8/50', unit:'tháng', price:166667},
  {id:'d4', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Lens Tamron 17-28mm F/2.8', unit:'tháng', price:444444},
  {id:'d5', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Tripod', unit:'tháng', price:83333},
  {id:'d6', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Đèn ZSYB 500GRB', unit:'tháng', price:72222},
  {id:'d7', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Đèn YZYB Y500S', unit:'tháng', price:111111},
  {id:'d8', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Softbox', unit:'tháng', price:83333},
  {id:'d9', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Mic DJI', unit:'tháng', price:47222},
  {id:'d10', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'MIC RODE', unit:'tháng', price:208333},
  {id:'d11', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Mic chân Podcast', unit:'tháng', price:194444},
  {id:'d12', group:'D', groupLabel:'Thiết bị quay, chụp, dựng (khấu hao)', name:'Ổ cứng HDD Synology 12TB', unit:'tháng', price:916667},
  {id:'f1', group:'F', groupLabel:'Quảng cáo fanpage', name:'Decox', unit:'tháng', price:55000000},
  {id:'f2', group:'F', groupLabel:'Quảng cáo fanpage', name:'Decox Design', unit:'tháng', price:15000000},
  {id:'f3', group:'F', groupLabel:'Quảng cáo fanpage', name:'Kiến Phong Legend (Studio network)', unit:'tháng', price:3000000},
  {id:'f4', group:'F', groupLabel:'Quảng cáo fanpage', name:'Mas Architect (Studio network)', unit:'tháng', price:3000000},
  {id:'f5', group:'F', groupLabel:'Quảng cáo fanpage', name:'Quảng cáo Web (Google Ads, SEO)', unit:'tháng', price:35000000},
  {id:'g1', group:'G', groupLabel:'Sản xuất nội dung', name:'Đi lại quay / chụp công trình', unit:'tháng', price:500000},
  {id:'g2', group:'G', groupLabel:'Sản xuất nội dung', name:'In ấn ấn phẩm (profile, brochure, catalogue)', unit:'lần', price:2400000},
  {id:'g3', group:'G', groupLabel:'Sản xuất nội dung', name:'Thuê ngoài / freelancer', unit:'tháng', price:5000000},
  {id:'h1', group:'H', groupLabel:'Tổ chức sự kiện', name:'Ngân sách sự kiện (mở bán, tri ân KH...)', unit:'sự kiện', price:15000000},
  {id:'i1', group:'I', groupLabel:'Chi phí khác', name:'Văn phòng phẩm, vật tư', unit:'tháng', price:300000},
  {id:'i2', group:'I', groupLabel:'Chi phí khác', name:'Dự phòng phát sinh', unit:'tháng', price:2000000},
]
const GROUP_ORDER = ['A','C','D','F','G','H','I']

const INITIAL_CAMPAIGNS = [
  {
    id:'camp1', name:'Ra mắt Riverside Giai đoạn 3', type:'Ra mắt dự án', client:'BQL Riverside', owner:'Trần Anh',
    start:'2026-09-01', end:'2026-10-31', status:'active', notes:'Mục tiêu 40 KHTN, chốt tối thiểu 3 căn trong GĐ3.',
    items:[{id:'f1', qty:1},{id:'f5', qty:1},{id:'a4', qty:2},{id:'g3', qty:1},{id:'h1', qty:1}]
  },
  {
    id:'camp2', name:'Truyền thông thương hiệu Quý 4', type:'Truyền thông thương hiệu', client:'— Không gắn dự án cụ thể —', owner:'Trần Anh',
    start:'2026-10-01', end:'2026-12-31', status:'draft', notes:'Tăng nhận diện thương hiệu trên các kênh mạng xã hội chính.',
    items:[{id:'a1', qty:1},{id:'a3', qty:1},{id:'c1', qty:1},{id:'d1', qty:1},{id:'f2', qty:1}]
  }
]

const STATUS_LABEL = {active:'Đang chạy', draft:'Bản nháp', done:'Đã hoàn tất'}
const STATUS_COLOR = {active:'var(--success)', draft:'var(--finance)', done:'var(--text-muted)'}
const STATUS_TINT  = {active:'var(--success-tint)', draft:'var(--finance-tint)', done:'var(--surface-alt)'}

const M_LEADERBOARD = [
  {name:'Đỗ Thảo Vy', team:'Head Marketing', color:'#C23B78', week:140, total:1580},
  {name:'Minh Quân', team:'Media', color:'#2F5DA8', week:110, total:1320},
  {name:'Ngọc Hà', team:'Thiết kế', color:'#B7791F', week:90, total:1150},
  {name:'Thuỳ Dương', team:'Content', color:'#1E8E5A', week:80, total:980},
  {name:'Nhật Minh', team:'Intern content', color:'#0E8A82', week:50, total:520},
  {name:'Gia Bảo', team:'Intern dựng video', color:'#7658C2', week:40, total:430},
]

const INITIAL_STEPS = [
  {title:'Lên kế hoạch & duyệt ngân sách', status:'done', subtasks:[
    {text:'Xác định mục tiêu & KPI chiến dịch', who:'Đỗ Thảo Vy', pts:20, done:true},
    {text:'Lập ngân sách & chọn hạng mục chi phí', who:'Đỗ Thảo Vy', pts:20, done:true},
    {text:'Trình duyệt ngân sách', who:'Trần Anh', pts:15, done:true},
  ]},
  {title:'Sản xuất nội dung', status:'done', subtasks:[
    {text:'Viết kịch bản & content', who:'Thuỳ Dương', pts:20, done:true},
    {text:'Quay, dựng video giới thiệu dự án', who:'Minh Quân', pts:30, done:true},
    {text:'Thiết kế hình ảnh & ấn phẩm quảng cáo', who:'Ngọc Hà', pts:25, done:true},
  ]},
  {title:'Setup quảng cáo', status:'current', subtasks:[
    {text:'Setup tài khoản quảng cáo Decox / Decox Design', who:'Đỗ Thảo Vy', pts:20, done:true},
    {text:'Setup landing page & form thu lead', who:'Minh Quân', pts:25, done:true},
    {text:'Chạy thử nghiệm A/B creative', who:'Thuỳ Dương', pts:20, done:false},
  ]},
  {title:'Chạy chiến dịch & tối ưu', status:'locked', subtasks:[
    {text:'Theo dõi ngân sách & hiệu suất hàng ngày', who:'Đỗ Thảo Vy', pts:20, done:false},
    {text:'Tối ưu targeting theo dữ liệu', who:'Minh Quân', pts:25, done:false},
    {text:'Trả lời tin nhắn / bình luận khách hàng tiềm năng', who:'Nhật Minh', pts:20, done:false},
  ]},
  {title:'Đo lường & báo cáo', status:'locked', subtasks:[
    {text:'Tổng hợp số liệu KHTN / lead theo kênh', who:'Gia Bảo', pts:20, done:false},
    {text:'Tính chi phí trên mỗi lead (CPL)', who:'Đỗ Thảo Vy', pts:20, done:false},
    {text:'Báo cáo tổng kết chiến dịch', who:'Đỗ Thảo Vy', pts:25, done:false},
  ]},
]

// ---- Utilities ----
function fmt(n) { return Math.round(n).toLocaleString('vi-VN') + ' đ' }
function monthsBetween(start, end) {
  if (!start || !end) return 1
  const s = new Date(start), e = new Date(end)
  const m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1
  return Math.max(1, m)
}
function lineTotal(item, qty, months) {
  const scales = item.unit === 'tháng' || item.unit === 'người-tháng'
  return qty * item.price * (scales ? months : 1)
}
function catalogItem(id) { return CATALOG.find(c => c.id === id) }
function campaignTotal(camp) {
  const months = monthsBetween(camp.start, camp.end)
  return camp.items.reduce((sum, li) => {
    const it = catalogItem(li.id)
    return it ? sum + lineTotal(it, li.qty, months) : sum
  }, 0)
}
function initials(name) {
  const p = name.trim().split(/\s+/)
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length-1][0]).toUpperCase()
}
function medalColor(rank) {
  if (rank === 1) return {bg:'var(--gold-tint)', color:'var(--gold)'}
  if (rank === 2) return {bg:'var(--silver-tint)', color:'var(--silver)'}
  if (rank === 3) return {bg:'var(--bronze-tint)', color:'var(--bronze)'}
  return {bg:'var(--surface-alt)', color:'var(--text-muted)'}
}
function todayStr() {
  const d = new Date()
  return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear()
}
function quoteNumber(camp) {
  const n = (camp.id.match(/\d+/) || ['0'])[0]
  return 'BG-' + n.padStart(3,'0') + '-' + new Date().getFullYear()
}

// ---- Icon SVGs ----
const IconMarketing = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
  </svg>
)
const IconPlus = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconCheck = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4,12 9,17 20,6"/>
  </svg>
)
const IconLock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>
  </svg>
)
const IconBack = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
// const IconEdit = () => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
//   </svg>
// )

// ---- Tab: Chiến dịch ----
function TabCampaigns({ campaigns, onOpenDetail, onCreateCampaign }) {
  const totalBudget = campaigns.reduce((s, c) => s + campaignTotal(c), 0)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16 }}>
        {[
          { label:'Tổng chiến dịch', value: campaigns.length, sub:'Đã khởi tạo trong hệ thống', color:'var(--text)' },
          { label:'Đang chạy', value: campaigns.filter(c=>c.status==='active').length, sub:'Trạng thái đã duyệt / đang triển khai', color:'var(--success)' },
          { label:'Bản nháp', value: campaigns.filter(c=>c.status==='draft').length, sub:'Chờ duyệt ngân sách', color:'var(--finance)' },
          { label:'Tổng ngân sách đã lập', value: fmt(totalBudget), sub:'Cộng dồn báo giá các chiến dịch', color:'var(--marketing)', mono:true },
        ].map(k => (
          <div key={k.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'17px 20px', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:11, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-muted)' }}>{k.label}</div>
            <div style={{ fontWeight:800, fontSize: k.mono ? 22 : 26, color: k.color, fontFamily: k.mono ? 'ui-monospace, monospace' : 'inherit' }}>{k.value}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Campaign grid */}
      {campaigns.length === 0 ? (
        <div style={{ background:'var(--surface)', border:'1px dashed var(--border)', borderRadius:14, padding:40, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
          Chưa có chiến dịch nào — bấm "Tạo chiến dịch" để khởi tạo và lập báo giá.
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
          {campaigns.map(c => {
            const total = campaignTotal(c)
            const months = monthsBetween(c.start, c.end)
            return (
              <div key={c.id} className="campaign-card" onClick={() => onOpenDetail(c.id)} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 18px', display:'flex', flexDirection:'column', gap:10, cursor:'pointer', transition:'border-color .12s, box-shadow .16s, transform .14s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--marketing)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                  <div style={{ fontWeight:700, fontSize:14, lineHeight:1.3 }}>{c.name}</div>
                  <span style={{ flex:'none', padding:'3px 9px', borderRadius:999, background:STATUS_TINT[c.status], color:STATUS_COLOR[c.status], fontSize:10.5, fontWeight:700, whiteSpace:'nowrap' }}>{STATUS_LABEL[c.status]}</span>
                </div>
                <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>{c.type} · {c.client}</div>
                <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>{c.start || '—'} → {c.end || '—'} ({months} tháng) · {c.owner}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>{c.items.filter(i=>i.qty>0).length} hạng mục</span>
                  <span style={{ fontFamily:'ui-monospace, monospace', fontSize:15, fontWeight:800, color:'var(--marketing)' }}>{fmt(total)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---- Campaign Detail ----
function CampaignDetail({ campaign, onBack, onViewQuote }) {
  const months = monthsBetween(campaign.start, campaign.end)
  const total = campaignTotal(campaign)
  const itemCount = campaign.items.filter(i => i.qty > 0).length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'none', color:'var(--text-muted)', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit', padding:0, width:'fit-content' }}>
        <IconBack /> Quay lại danh sách chiến dịch
      </button>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <h2 style={{ fontWeight:800, fontSize:21, margin:0 }}>{campaign.name}</h2>
            <span style={{ flex:'none', padding:'4px 11px', borderRadius:999, fontSize:11, fontWeight:700, background:STATUS_TINT[campaign.status], color:STATUS_COLOR[campaign.status] }}>{STATUS_LABEL[campaign.status]}</span>
          </div>
          <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>{campaign.type} · {campaign.client}</div>
        </div>
        <div style={{ display:'flex', gap:8, flex:'none' }}>
          <button style={{ border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', padding:'9px 16px', borderRadius:9, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Chỉnh sửa</button>
          <button onClick={onViewQuote} style={{ border:'none', background:'var(--marketing)', color:'#fff', padding:'9px 16px', borderRadius:9, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Xem báo giá</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16 }}>
        {[
          { label:'Thời gian triển khai', value:`${campaign.start || '—'} → ${campaign.end || '—'} (${months} tháng)` },
          { label:'Người phụ trách', value: campaign.owner },
          { label:'Hạng mục đã chọn', value: itemCount, big:true },
          { label:'Tổng chi phí dự kiến', value: fmt(total), mono:true, color:'var(--marketing)' },
        ].map(k => (
          <div key={k.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'17px 20px', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:11, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-muted)' }}>{k.label}</div>
            <div style={{ fontWeight: k.big ? 800 : 700, fontSize: k.big ? 26 : 16, color: k.color || 'var(--text)', fontFamily: k.mono ? 'ui-monospace, monospace' : 'inherit' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 20px' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.04em', color:'var(--text-muted)', marginBottom:8 }}>Ghi chú chiến dịch</div>
        <div style={{ fontSize:13, lineHeight:1.6 }}>{campaign.notes || 'Chưa có ghi chú cho chiến dịch này.'}</div>
      </div>

      <div>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Chi tiết hạng mục chi phí</div>
        <QuoteBlocks campaign={campaign} />
      </div>
    </div>
  )
}

// ---- Quote blocks (shared) ----
function QuoteBlocks({ campaign }) {
  const months = monthsBetween(campaign.start, campaign.end)
  const groupTotals = {}
  campaign.items.forEach(li => {
    const it = catalogItem(li.id)
    if (!it) return
    groupTotals[it.group] = (groupTotals[it.group] || 0) + lineTotal(it, li.qty, months)
  })
  const grandTotal = campaignTotal(campaign)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {GROUP_ORDER.map(g => {
        const lines = campaign.items.filter(li => li.qty > 0 && catalogItem(li.id)?.group === g)
        if (!lines.length) return null
        const items = lines.map(li => catalogItem(li.id))
        return (
          <div key={g} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', fontWeight:700, fontSize:13, background:'var(--surface-alt)' }}>
              <span>{g}. {items[0].groupLabel}</span>
              <span style={{ fontFamily:'ui-monospace, monospace', color:'var(--marketing)', fontWeight:700 }}>{fmt(groupTotals[g] || 0)}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'2.2fr 0.8fr 1fr 1fr 1.2fr', gap:10, padding:'8px 16px', fontSize:10.5, letterSpacing:'.05em', textTransform:'uppercase', color:'var(--text-muted)', borderBottom:'1px solid var(--border)' }}>
              <span>Hạng mục</span><span>SL</span><span>Đơn giá</span><span>Nhân tháng</span><span>Thành tiền</span>
            </div>
            {lines.map(li => {
              const it = catalogItem(li.id)
              const scales = it.unit === 'tháng' || it.unit === 'người-tháng'
              return (
                <div key={li.id} style={{ display:'grid', gridTemplateColumns:'2.2fr 0.8fr 1fr 1fr 1.2fr', gap:10, padding:'9px 16px', alignItems:'center', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:13 }}>{it.name}</span>
                  <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5 }}>{li.qty} {it.unit}</span>
                  <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5 }}>{fmt(it.price)}</span>
                  <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5, color:'var(--text-muted)' }}>{scales ? months + ' th' : '—'}</span>
                  <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5, fontWeight:600 }}>{fmt(lineTotal(it, li.qty, months))}</span>
                </div>
              )
            })}
          </div>
        )
      })}
      {campaign.items.filter(i=>i.qty>0).length === 0 && (
        <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>Chiến dịch chưa chọn hạng mục chi phí nào.</div>
      )}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 20px', display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
          <span style={{ color:'var(--text-muted)' }}>Tạm tính ({campaign.items.filter(i=>i.qty>0).length} hạng mục · {months} tháng)</span>
          <span style={{ fontFamily:'ui-monospace, monospace' }}>{fmt(grandTotal)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:800, borderTop:'1px solid var(--border)', paddingTop:8, marginTop:4 }}>
          <span>Tổng cộng</span>
          <span style={{ fontFamily:'ui-monospace, monospace', color:'var(--marketing)' }}>{fmt(grandTotal)}</span>
        </div>
      </div>
    </div>
  )
}

// ---- Tab: Danh mục ----
function TabCatalog() {
  const [cats, setCats]         = useState([...CATALOG])
  const [addingGroup, setAdding] = useState(null)
  const [form, setForm]         = useState({ name:'', unit:'tháng', price:'' })

  function openForm(g) {
    setAdding(g)
    setForm({ name:'', unit:'tháng', price:'' })
  }

  function submitAdd() {
    const name  = form.name.trim()
    const price = parseInt(form.price.replace(/[^\d]/g, ''), 10) || 0
    if (!name) return
    const groupLabel = CATALOG.find(c => c.group === addingGroup)?.groupLabel || addingGroup
    const newItem = { id:'new' + Date.now(), group: addingGroup, groupLabel, name, unit: form.unit || 'tháng', price }
    CATALOG.push(newItem)
    setCats([...CATALOG])
    setAdding(null)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>Danh mục hạng mục chi phí dùng để chọn vào gói khi tạo chiến dịch. Đơn giá nhân sự (nhóm A) đã bao gồm BH & KPCĐ doanh nghiệp đóng (BHXH 17.5% + BHYT 3% + BHTN 1% trên lương Gross).</div>
        <span style={{ padding:'5px 11px', borderRadius:999, background:'var(--marketing-tint)', color:'var(--marketing)', fontSize:11.5, fontWeight:600, whiteSpace:'nowrap' }}>{cats.length} hạng mục</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {GROUP_ORDER.map(g => {
          const items = cats.filter(c => c.group === g)
          if (!items.length) return null
          const isAdding = addingGroup === g
          return (
            <div key={g} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
              {/* Group header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', fontWeight:700, fontSize:13, background:'var(--surface-alt)' }}>
                <span>{g}. {items[0].groupLabel}</span>
                <span style={{ fontFamily:'ui-monospace, monospace', color:'var(--text-muted)', fontWeight:600 }}>{items.length} hạng mục</span>
              </div>
              {/* Column headers */}
              <div style={{ display:'grid', gridTemplateColumns:'2.4fr 1fr 1.2fr', gap:10, padding:'8px 16px', fontSize:10.5, letterSpacing:'.05em', textTransform:'uppercase', color:'var(--text-muted)', borderBottom:'1px solid var(--border)' }}>
                <span>Hạng mục</span><span>Đơn vị</span><span>Đơn giá</span>
              </div>
              {/* Rows */}
              {items.map((it, i) => (
                <div key={it.id} className="catalog-row" style={{ display:'grid', gridTemplateColumns:'2.4fr 1fr 1.2fr', gap:10, padding:'9px 16px', alignItems:'center', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:13 }}>{it.name}</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>{it.unit}</span>
                  <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5, fontWeight:600, color:'var(--marketing)' }}>{fmt(it.price)}</span>
                </div>
              ))}
              {/* Inline add form */}
              {isAdding && (
                <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', background:'var(--surface-alt)', display:'flex', gap:8, alignItems:'flex-end', flexWrap:'wrap' }}>
                  <div style={{ flex:2, minWidth:140 }}>
                    <div style={{ fontSize:10.5, color:'var(--text-muted)', marginBottom:4 }}>Tên hạng mục *</div>
                    <input autoFocus value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                      onKeyDown={e => { if(e.key==='Enter') submitAdd(); if(e.key==='Escape') setAdding(null) }}
                      placeholder="VD: Social Media Manager"
                      style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:12.5, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                  </div>
                  <div style={{ flex:1, minWidth:110 }}>
                    <div style={{ fontSize:10.5, color:'var(--text-muted)', marginBottom:4 }}>Đơn vị</div>
                    <select value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))}
                      style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:12.5, fontFamily:'inherit', outline:'none' }}>
                      <option>tháng</option>
                      <option>người-tháng</option>
                      <option>lần</option>
                      <option>sự kiện</option>
                      <option>bộ</option>
                      <option>video</option>
                    </select>
                  </div>
                  <div style={{ flex:1, minWidth:120 }}>
                    <div style={{ fontSize:10.5, color:'var(--text-muted)', marginBottom:4 }}>Đơn giá (đ)</div>
                    <input value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))}
                      onKeyDown={e => { if(e.key==='Enter') submitAdd(); if(e.key==='Escape') setAdding(null) }}
                      placeholder="VD: 5000000"
                      style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:12.5, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                  </div>
                  <div style={{ display:'flex', gap:6, flex:'none' }}>
                    <button onClick={submitAdd} style={{ border:'none', background:'var(--marketing)', color:'#fff', padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>Thêm</button>
                    <button onClick={() => setAdding(null)} style={{ border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-muted)', padding:'7px 10px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Huỷ</button>
                  </div>
                </div>
              )}
              {/* Add row button */}
              {!isAdding && (
                <div onClick={() => openForm(g)} className="catalog-add-row" style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', cursor:'pointer', color:'var(--text-muted)', fontSize:12, borderTop:'1px solid var(--border)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Thêm hạng mục
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>* Chi phí phúc lợi & chi phí nhân sự chung (nhóm B) không gắn theo từng chiến dịch nên không nằm trong danh mục lập báo giá — xem tại báo cáo phòng ban.</div>
    </div>
  )
}

// ---- Template default accents ----
const TEMPLATE_DEFAULT_ACCENT = { modern:'#C23B78', classic:'#1C1F26', minimal:'#C23B78', detailed:'#C23B78', elegant:'#B7791F', compact:'#1C1F26' }
const TEMPLATES_LIST = [
  {id:'modern',   label:'Hiện đại',   swatch:'linear-gradient(135deg,#C23B78,#7A2856)'},
  {id:'classic',  label:'Cổ điển',    swatch:'#1C1F26'},
  {id:'minimal',  label:'Tối giản',   swatch:'linear-gradient(135deg,#F3F4F7,#DADFE8)'},
  {id:'detailed', label:'Chi tiết',   swatch:'linear-gradient(135deg,#C23B78,#B7791F)'},
  {id:'elegant',  label:'Sang trọng', swatch:'linear-gradient(135deg,#1C1B18,#B7791F)'},
  {id:'compact',  label:'Gọn nhẹ',   swatch:'linear-gradient(135deg,#DADFE8,#8A8F9C)'},
]

// ---- Tab: Báo giá ----
function TabQuote({ campaigns, initialId }) {
  const [quoteId, setQuoteId]       = useState(initialId || campaigns[0]?.id || '')
  const [vatOn, setVatOn]           = useState(false)
  const [template, setTemplate]     = useState('modern')
  const [accentColor, setAccent]    = useState('')
  const [textColor, setTextColor]   = useState('')
  const [fontFamily, setFont]       = useState('')
  const [paperSize, setPaperSize]   = useState('A4')
  const [paperOrient, setOrient]    = useState('portrait')

  const camp = campaigns.find(c => c.id === quoteId) || campaigns[0]

  if (!campaigns.length) {
    return (
      <div style={{ background:'var(--surface)', border:'1px dashed var(--border)', borderRadius:14, padding:40, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
        Chưa có chiến dịch nào để lập báo giá — bấm "Tạo chiến dịch" ở góc trên bên phải.
      </div>
    )
  }

  const months     = monthsBetween(camp.start, camp.end)
  const grandTotal = campaignTotal(camp)
  const vat        = vatOn ? grandTotal * 0.08 : 0

  const defaultAccent = TEMPLATE_DEFAULT_ACCENT[template] || '#C23B78'
  const resolvedAccent = accentColor || defaultAccent

  function handleReset() {
    setAccent(''); setTextColor(''); setFont('')
  }

  function handlePrint() {
    const styleId = 'qPageStyle'
    let el = document.getElementById(styleId)
    if (!el) { el = document.createElement('style'); el.id = styleId; document.head.appendChild(el) }
    el.textContent = `@page{ size: ${paperSize} ${paperOrient}; margin: 12mm; } @media print { body > * { display:none !important; } #quotePrintArea { display:block !important; position:static !important; } }`
    const area = document.getElementById('quotePrintArea')
    if (area) area.style.display = 'block'
    window.print()
    setTimeout(() => { if (area) area.style.display = 'none' }, 500)
  }

  function ExportPill({ value, active, onClick, children }) {
    return (
      <button onClick={onClick} style={{ flex:1, border:`1px solid ${active?'var(--marketing)':'var(--border)'}`, background: active?'var(--marketing-tint)':'var(--surface)', color: active?'var(--marketing)':'var(--text-muted)', padding:'6px 0', borderRadius:8, fontSize:11.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
        {children}
      </button>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <span style={{ fontSize:12.5, fontWeight:600, color:'var(--text-muted)' }}>Xem báo giá chiến dịch:</span>
        <select value={quoteId} onChange={e => setQuoteId(e.target.value)} style={{ padding:'8px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:12.5, fontFamily:'inherit', minWidth:260 }}>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
        {/* ---- Sidebar ---- */}
        <div style={{ width:230, flex:'none', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Campaign info */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'11px 16px', fontWeight:700, fontSize:13, background:'var(--marketing-tint)', color:'var(--marketing)' }}>Thông tin chiến dịch</div>
            <div style={{ padding:'12px 16px 16px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
              <div><span style={{ color:'var(--text-muted)' }}>Tên:</span> <strong>{camp.name}</strong></div>
              <div><span style={{ color:'var(--text-muted)' }}>Loại:</span> {camp.type}</div>
              <div><span style={{ color:'var(--text-muted)' }}>Dự án/KH:</span> {camp.client}</div>
              <div><span style={{ color:'var(--text-muted)' }}>Phụ trách:</span> {camp.owner}</div>
              <div><span style={{ color:'var(--text-muted)' }}>Thời gian:</span> {camp.start||'—'} → {camp.end||'—'} ({months} tháng)</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'var(--text-muted)' }}>Trạng thái:</span>
                <span style={{ padding:'2px 8px', borderRadius:999, background:STATUS_TINT[camp.status], color:STATUS_COLOR[camp.status], fontSize:10.5, fontWeight:700 }}>{STATUS_LABEL[camp.status]}</span>
              </div>
            </div>
          </div>

          {/* VAT toggle */}
          <button onClick={() => setVatOn(v => !v)} style={{ border:`1px solid ${vatOn?'var(--marketing)':'var(--border)'}`, background: vatOn?'var(--marketing-tint)':'var(--surface)', color: vatOn?'var(--marketing)':'var(--text)', padding:'9px 10px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textAlign:'center' }}>
            {vatOn ? '✓ VAT 8% đã áp dụng' : '+ VAT 8%'}
          </button>

          {/* Template picker */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 14px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:8 }}>MẪU BÁO GIÁ</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {TEMPLATES_LIST.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)} style={{ border:`1.5px solid ${template===t.id?'var(--marketing)':'var(--border)'}`, background:'var(--surface)', color:'var(--text)', padding:'7px 9px', borderRadius:9, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, width:'100%', boxShadow: template===t.id?'0 0 0 3px var(--marketing-tint)':'none', transition:'box-shadow .12s' }}>
                  <span style={{ width:34, height:18, borderRadius:5, flex:'none', background:t.swatch, display:'inline-block' }}></span>
                  Mẫu {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tùy chỉnh giao diện */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TÙY CHỈNH GIAO DIỆN</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label style={{ fontSize:12, fontWeight:600 }}>Màu tiêu đề</label>
              <input type="color" value={accentColor || defaultAccent} onChange={e => setAccent(e.target.value)} style={{ width:38, height:24, border:'1px solid var(--border)', borderRadius:6, padding:2, cursor:'pointer', background:'none' }} />
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label style={{ fontSize:12, fontWeight:600 }}>Màu chữ</label>
              <input type="color" value={textColor || '#1C1F26'} onChange={e => setTextColor(e.target.value)} style={{ width:38, height:24, border:'1px solid var(--border)', borderRadius:6, padding:2, cursor:'pointer', background:'none' }} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:6 }}>Font chữ</label>
              <select value={fontFamily} onChange={e => setFont(e.target.value)} style={{ width:'100%', border:'1px solid var(--border)', borderRadius:8, padding:'7px 9px', fontSize:12, fontFamily:'inherit', background:'var(--surface)', color:'var(--text)', cursor:'pointer', outline:'none' }}>
                <option value="">Mặc định (Montserrat)</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Inter', sans-serif">Inter</option>
                <option value="Georgia, 'Times New Roman', serif">Georgia / Times</option>
                <option value="Arial, sans-serif">Arial</option>
              </select>
            </div>
            <button onClick={handleReset} style={{ width:'100%', border:'1px dashed var(--border)', background:'none', color:'var(--text-muted)', fontSize:11.5, fontWeight:600, padding:7, borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
              Khôi phục mặc định
            </button>
          </div>

          {/* Xuất báo giá */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>XUẤT BÁO GIÁ</div>
            <div>
              <div style={{ fontSize:10.5, color:'var(--text-muted)', marginBottom:6 }}>Khổ giấy</div>
              <div style={{ display:'flex', gap:6 }}>
                {['A4','A3','A2'].map(s => (
                  <ExportPill key={s} active={paperSize===s} onClick={() => setPaperSize(s)}>{s}</ExportPill>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:10.5, color:'var(--text-muted)', marginBottom:6 }}>Hướng giấy</div>
              <div style={{ display:'flex', gap:6 }}>
                <ExportPill active={paperOrient==='portrait'}  onClick={() => setOrient('portrait')}>Dọc</ExportPill>
                <ExportPill active={paperOrient==='landscape'} onClick={() => setOrient('landscape')}>Ngang</ExportPill>
              </div>
            </div>
            <button onClick={handlePrint} style={{ border:'none', background:'var(--marketing)', color:'#fff', padding:10, borderRadius:9, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Xuất báo giá
            </button>
          </div>
        </div>

        {/* Quote document */}
        <div style={{ flex:1, overflowY:'auto', minWidth:0 }}>
          <QuoteDoc camp={camp} vatOn={vatOn} template={template} vat={vat} months={months}
            accentColor={resolvedAccent} textColor={textColor} fontFamily={fontFamily} />
        </div>
      </div>
    </div>
  )
}

// ---- Quote document renderer (6 templates) ----
function QuoteDoc({ camp, vatOn, template, vat, months, accentColor, textColor, fontFamily }) {
  const accent = accentColor || '#C23B78'
  const txtColor = textColor || '#1C1F26'
  const font = fontFamily || "'Montserrat', ui-sans-serif, system-ui, sans-serif"
  const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

  const lines = camp.items.filter(li => li.qty > 0).map(li => {
    const it = catalogItem(li.id)
    if (!it) return null
    const scales = it.unit === 'tháng' || it.unit === 'người-tháng'
    return { ...it, qty: li.qty, scales, total: lineTotal(it, li.qty, months) }
  }).filter(Boolean)

  const groupTotals = {}
  lines.forEach(l => { groupTotals[l.group] = (groupTotals[l.group] || 0) + l.total })
  const subtotal = lines.reduce((s, l) => s + l.total, 0)
  const grand    = subtotal + vat
  const qNum     = quoteNumber(camp)
  const today    = todayStr()

  const paperBase = {
    background:'#FFFFFF', borderRadius:12,
    boxShadow:'0 12px 34px rgba(20,22,30,.16)', padding:'44px 50px',
    maxWidth:760, margin:'0 auto 24px',
    fontFamily: font, color: txtColor || '#1C1F26',
  }

  const noLines = <p style={{ fontSize:12.5, color:'#8A8F9C' }}>Chưa chọn hạng mục chi phí.</p>

  // ---- Modern ----
  if (template === 'modern') {
    const infoBlock = { background: accent + '18', borderRadius:10, padding:'16px 18px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px', marginBottom:22 }
    return (
      <div style={paperBase}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', paddingBottom:20, marginBottom:20, borderBottom:`3px solid ${accent}` }}>
          <div>
            <div style={{ width:38, height:38, borderRadius:10, background:accent, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
              <IconMarketing size={20} color="#fff" />
            </div>
            <div style={{ fontWeight:800, fontSize:17 }}>CÔNG TY TNHH KIẾN TRÚC XÂY DỰNG DECOX</div>
            <div style={{ fontSize:11.5, color:'#6B7280', marginTop:3, lineHeight:1.6 }}>123 Đường Nguyễn Văn Linh, Q.7, TP.HCM<br/>Hotline: 0909 123 456 · marketing@decox.vn</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontWeight:800, fontSize:22, color:accent, letterSpacing:'.02em' }}>BÁO GIÁ</div>
            <div style={{ fontFamily:mono, fontSize:12, color:'#6B7280', marginTop:4 }}>{qNum}</div>
            <div style={{ fontFamily:mono, fontSize:12, color:'#6B7280' }}>Ngày: {today}</div>
          </div>
        </div>
        <div style={infoBlock}>
          {[['Chiến dịch', camp.name], ['Dự án / khách hàng', camp.client], ['Thời gian triển khai', `${camp.start||'—'} → ${camp.end||'—'} (${months} tháng)`], ['Người phụ trách', camp.owner]].map(([k,v]) => (
            <div key={k}><div style={{ fontSize:10.5, color:'#8A8F9C', textTransform:'uppercase', letterSpacing:'.04em' }}>{k}</div><div style={{ fontSize:13, fontWeight:700, marginTop:2 }}>{v}</div></div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 0.5fr 1fr', gap:8, padding:'9px 0', fontSize:10, letterSpacing:'.06em', textTransform:'uppercase', color:'#8A8F9C', borderBottom:'2px solid #1C1F26', fontWeight:700, marginBottom:4 }}>
          <span>Hạng mục</span><span style={{ textAlign:'right' }}>Đơn giá</span><span style={{ textAlign:'center' }}>SL</span><span style={{ textAlign:'right' }}>Thành tiền</span>
        </div>
        {lines.length ? GROUP_ORDER.filter(g=>groupTotals[g]).map(g => {
          const gl = lines.filter(l=>l.group===g)
          return (
            <div key={g}>
              <div style={{ paddingTop:16, paddingBottom:4 }}><span style={{ fontSize:11, fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', color:accent }}>{g}. {gl[0].groupLabel}</span></div>
              {gl.map((l,i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 0.5fr 1fr', gap:8, padding:'10px 0', borderBottom:'1px solid #E8E9EE' }}>
                  <div><div>{l.name}</div><div style={{ fontSize:10.5, color:'#8A8F9C', marginTop:2 }}>{l.qty} {l.unit}{l.scales?' × '+months+' tháng':''}</div></div>
                  <div style={{ fontFamily:mono, textAlign:'right', fontSize:12.5 }}>{fmt(l.price)}</div>
                  <div style={{ fontFamily:mono, textAlign:'center', fontSize:12.5, color:'#8A8F9C' }}>{l.scales?months:1}</div>
                  <div style={{ fontFamily:mono, textAlign:'right', fontWeight:700, fontSize:12.5 }}>{fmt(l.total)}</div>
                </div>
              ))}
            </div>
          )
        }) : noLines}
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:18 }}>
          <div style={{ width:280, display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5 }}><span style={{ color:'#6B7280' }}>Tạm tính</span><span style={{ fontFamily:mono }}>{fmt(subtotal)}</span></div>
            {vatOn && <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5 }}><span style={{ color:'#6B7280' }}>VAT (8%)</span><span style={{ fontFamily:mono }}>{fmt(vat)}</span></div>}
            <div style={{ background:accent, color:'#fff', borderRadius:10, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
              <span style={{ fontSize:13, fontWeight:700 }}>Tổng cộng</span>
              <span style={{ fontFamily:mono, fontSize:17, fontWeight:800 }}>{fmt(grand)}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop:28, paddingTop:18, borderTop:'1px solid #E8E9EE', fontSize:11, color:'#8A8F9C', lineHeight:1.7 }}>Báo giá có hiệu lực 15 ngày kể từ ngày phát hành. Chưa bao gồm chi phí phát sinh ngoài phạm vi hạng mục nêu trên.</div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:30 }}>
          <div style={{ textAlign:'center', width:'45%' }}><div style={{ fontSize:12, fontWeight:700 }}>Người lập báo giá</div><div style={{ height:56 }}></div><div style={{ fontSize:11, color:'#8A8F9C' }}>{camp.owner}</div></div>
          <div style={{ textAlign:'center', width:'45%' }}><div style={{ fontSize:12, fontWeight:700 }}>Khách hàng xác nhận</div><div style={{ height:56 }}></div><div style={{ fontSize:11, color:'#8A8F9C' }}>(Ký, ghi rõ họ tên)</div></div>
        </div>
      </div>
    )
  }

  // ---- Classic ----
  if (template === 'classic') {
    return (
      <div style={paperBase}>
        <div style={{ textAlign:'center', paddingBottom:14, borderBottom:'3px double #1C1F26', marginBottom:18 }}>
          <div style={{ fontWeight:800, fontSize:15, letterSpacing:'.03em' }}>CÔNG TY TNHH KIẾN TRÚC XÂY DỰNG DECOX</div>
          <div style={{ fontSize:11, color:'#6B7280', marginTop:4 }}>123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh — ĐT: 0909 123 456</div>
        </div>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:20, letterSpacing:'.08em', color:accent }}>BÁO GIÁ</div>
          <div style={{ fontSize:11, color:'#6B7280', marginTop:4 }}>CHI PHÍ TRIỂN KHAI CHIẾN DỊCH MARKETING</div>
          <div style={{ fontFamily:mono, fontSize:11.5, marginTop:6 }}>Số: {qNum} · Ngày {today}</div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:16, gap:20 }}>
          <div><div>Kính gửi: <strong>{camp.client}</strong></div><div>Về việc: <strong>{camp.name}</strong></div></div>
          <div style={{ textAlign:'right' }}><div>Người phụ trách: <strong>{camp.owner}</strong></div><div>Thời gian: <strong>{camp.start||'—'} → {camp.end||'—'}</strong></div></div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
          <thead>
            <tr>
              {['STT','Hạng mục','ĐVT','SL','Đơn giá','Thành tiền'].map(h => (
                <th key={h} style={{ padding:'9px 6px', border:`1px solid ${accent}`, color:accent, fontSize:10, letterSpacing:'.04em', textTransform:'uppercase', fontWeight:700, textAlign: ['Đơn giá','Thành tiền'].includes(h)?'right':['STT','SL'].includes(h)?'center':'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.length ? lines.map((l,i) => (
              <tr key={i}>
                <td style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'center', fontFamily:mono }}>{i+1}</td>
                <td style={{ padding:'10px 6px', border:'1px solid #ddd' }}>{l.name}</td>
                <td style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'center' }}>{l.unit}</td>
                <td style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'center', fontFamily:mono }}>{l.qty}{l.scales?' × '+months:''}</td>
                <td style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'right', fontFamily:mono }}>{fmt(l.price)}</td>
                <td style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'right', fontFamily:mono, fontWeight:700 }}>{fmt(l.total)}</td>
              </tr>
            )) : <tr><td colSpan={6} style={{ padding:14, textAlign:'center', border:'1px solid #ddd', color:'#8A8F9C' }}>Chưa chọn hạng mục chi phí</td></tr>}
            <tr><td colSpan={5} style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'right', fontWeight:700 }}>Tạm tính</td><td style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'right', fontFamily:mono, fontWeight:700 }}>{fmt(subtotal)}</td></tr>
            {vatOn && <tr><td colSpan={5} style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'right' }}>Thuế GTGT (8%)</td><td style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'right', fontFamily:mono }}>{fmt(vat)}</td></tr>}
            <tr><td colSpan={5} style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'right', fontWeight:800, fontSize:13.5, color:accent }}>TỔNG CỘNG</td><td style={{ padding:'10px 6px', border:'1px solid #ddd', textAlign:'right', fontFamily:mono, fontWeight:800, fontSize:13.5, color:accent }}>{fmt(grand)}</td></tr>
          </tbody>
        </table>
        <div style={{ fontSize:11, color:'#6B7280', marginTop:14, fontStyle:'italic' }}>* Báo giá chưa bao gồm các chi phí phát sinh ngoài phạm vi hạng mục nêu trên và có hiệu lực trong 15 ngày kể từ ngày ký.</div>
        <div style={{ display:'flex', justifyContent:'space-around', marginTop:38, textAlign:'center' }}>
          <div><div style={{ fontWeight:700, fontSize:12.5 }}>NGƯỜI LẬP BÁO GIÁ</div><div style={{ fontSize:10.5, color:'#6B7280', marginTop:2 }}>(Ký, ghi rõ họ tên)</div><div style={{ height:60 }}></div><div style={{ fontWeight:600, fontSize:12 }}>{camp.owner}</div></div>
          <div><div style={{ fontWeight:700, fontSize:12.5 }}>KHÁCH HÀNG XÁC NHẬN</div><div style={{ fontSize:10.5, color:'#6B7280', marginTop:2 }}>(Ký, ghi rõ họ tên)</div><div style={{ height:60 }}></div></div>
        </div>
      </div>
    )
  }

  // ---- Minimal ----
  if (template === 'minimal') {
    return (
      <div style={paperBase}>
        <div style={{ fontSize:10.5, letterSpacing:'.14em', textTransform:'uppercase', color:'#B8BEC9', fontWeight:700 }}>Báo giá · {qNum}</div>
        <div style={{ fontWeight:800, fontSize:26, marginTop:8, lineHeight:1.25 }}>{camp.name}</div>
        <div style={{ fontSize:12, color:'#8A8F9C', marginTop:8 }}>{camp.client} · {today} · {months} tháng triển khai</div>
        {lines.length ? GROUP_ORDER.filter(g=>groupTotals[g]).map(g => {
          const gl = lines.filter(l=>l.group===g)
          return (
            <div key={g} style={{ marginTop:22 }}>
              <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#B8BEC9', marginBottom:8 }}>{gl[0].groupLabel}</div>
              {gl.map((l,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'9px 0', borderBottom:'1px solid #F0F1F4' }}>
                  <div><div style={{ fontSize:13.5 }}>{l.name}</div><div style={{ fontSize:10.5, color:'#B8BEC9', marginTop:2 }}>{l.qty} {l.unit}{l.scales?' × '+months+' tháng':''} · {fmt(l.price)}</div></div>
                  <div style={{ fontFamily:mono, fontSize:13 }}>{fmt(l.total)}</div>
                </div>
              ))}
            </div>
          )
        }) : noLines}
        <div style={{ marginTop:30, paddingTop:18, borderTop:`1px solid ${accent}`, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
          <span style={{ fontSize:12.5, color:'#8A8F9C' }}>Tạm tính{vatOn?' + VAT 8%':''}</span>
          <span style={{ fontFamily:mono, fontSize:26, fontWeight:800, color:accent }}>{fmt(grand)}</span>
        </div>
        <div style={{ marginTop:24, fontSize:11, color:'#B8BEC9' }}>Người lập: {camp.owner} · SiteFlow Marketing · Hiệu lực 15 ngày</div>
      </div>
    )
  }

  // ---- Detailed ----
  if (template === 'detailed') {
    return (
      <div style={paperBase}>
        <div style={{ border:`1.5px solid ${accent}`, borderRadius:8, padding:'16px 20px', marginBottom:20, display:'flex', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontWeight:800, fontSize:14.5 }}>CÔNG TY TNHH KIẾN TRÚC XÂY DỰNG DECOX</div>
            <div style={{ fontSize:10.5, color:'#6B7280', marginTop:4, lineHeight:1.7 }}>123 Nguyễn Văn Linh, Q.7, TP.HCM · MST: 0312xxxxxx<br/>STK: 0071xxxxxxx — Vietcombank CN TP.HCM</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontWeight:800, fontSize:13, color:accent }}>BÁO GIÁ CHI TIẾT</div>
            <div style={{ fontFamily:mono, fontSize:11, color:'#6B7280', marginTop:4 }}>{qNum}<br/>{today}</div>
          </div>
        </div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase', color:'#8A8F9C', marginBottom:8 }}>Thông tin chiến dịch</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 24px', fontSize:12.5, marginBottom:20 }}>
          {[['Chiến dịch', camp.name],['Loại', camp.type],['Dự án / khách hàng', camp.client],['Thời gian', `${camp.start||'—'} → ${camp.end||'—'} (${months} tháng)`],['Người phụ trách', camp.owner],['Trạng thái', STATUS_LABEL[camp.status]]].map(([k,v]) => (
            <div key={k}><span style={{ color:'#8A8F9C' }}>{k}:</span> <strong>{v}</strong></div>
          ))}
        </div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase', color:'#8A8F9C', marginBottom:10 }}>Chi tiết hạng mục chi phí</div>
        {lines.length ? GROUP_ORDER.filter(g=>groupTotals[g]).map(g => {
          const gl = lines.filter(l=>l.group===g)
          return (
            <div key={g} style={{ marginBottom:14, border:'1px solid #E8E9EE', borderRadius:8, overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'9px 14px', background:'#F7F3F5', fontWeight:700, fontSize:12 }}>
                <span>{g}. {gl[0].groupLabel}</span><span style={{ fontFamily:mono }}>{fmt(groupTotals[g])}</span>
              </div>
              {gl.map((l,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 14px', fontSize:12, borderTop:'1px solid #F0F1F4' }}>
                  <span>{l.name} <span style={{ color:'#8A8F9C' }}>— {l.qty} {l.unit}{l.scales?' × '+months+' tháng':''}</span></span>
                  <span style={{ fontFamily:mono }}>{fmt(l.total)}</span>
                </div>
              ))}
            </div>
          )
        }) : noLines}
        <div style={{ background:'#F7F3F5', borderRadius:8, padding:'14px 18px', display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5 }}><span style={{ color:'#6B7280' }}>Tạm tính</span><span style={{ fontFamily:mono }}>{fmt(subtotal)}</span></div>
          {vatOn && <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5 }}><span style={{ color:'#6B7280' }}>VAT (8%)</span><span style={{ fontFamily:mono }}>{fmt(vat)}</span></div>}
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:800, borderTop:'1px solid #E0C4D2', paddingTop:8, marginTop:2 }}><span>Tổng cộng</span><span style={{ fontFamily:mono, color:accent }}>{fmt(grand)}</span></div>
        </div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase', color:'#8A8F9C', margin:'20px 0 8px' }}>Điều khoản & điều kiện</div>
        <ul style={{ margin:0, paddingLeft:18, fontSize:11.5, color:'#4B5160', lineHeight:1.9 }}>
          <li>Báo giá có hiệu lực trong vòng 15 ngày kể từ ngày phát hành.</li>
          <li>Thanh toán: tạm ứng 50% khi ký xác nhận, 50% còn lại khi hoàn tất chiến dịch.</li>
          <li>Chi phí trên chưa bao gồm phát sinh ngoài phạm vi hạng mục đã liệt kê.</li>
          <li>Số liệu quảng cáo (KHTN/lead) là ước tính tham khảo, không cam kết tuyệt đối.</li>
        </ul>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:32 }}>
          <div style={{ textAlign:'center', width:'45%' }}><div style={{ fontSize:12, fontWeight:700 }}>Người lập báo giá</div><div style={{ height:56 }}></div><div style={{ fontSize:11, color:'#8A8F9C' }}>{camp.owner}</div></div>
          <div style={{ textAlign:'center', width:'45%' }}><div style={{ fontSize:12, fontWeight:700 }}>Khách hàng xác nhận</div><div style={{ height:56 }}></div><div style={{ fontSize:11, color:'#8A8F9C' }}>(Ký, ghi rõ họ tên)</div></div>
        </div>
      </div>
    )
  }

  // ---- Elegant ----
  if (template === 'elegant') {
    const darkBg = '#1C1B18'
    const goldAccent = accent
    return (
      <div style={{ ...paperBase, background:'#FFFFFF', color:'#F3F0E8', overflow:'hidden' }}>
        <div style={{ background:darkBg, margin:'-44px -50px 24px', padding:'40px 50px 28px', textAlign:'center', borderBottom:`2px solid ${goldAccent}` }}>
          <div style={{ fontSize:10, letterSpacing:'.28em', textTransform:'uppercase', color:goldAccent }}>Decox Marketing</div>
          <div style={{ fontWeight:800, fontSize:24, marginTop:10, letterSpacing:'.05em', color:'#F3F0E8' }}>BÁO GIÁ</div>
          <div style={{ fontFamily:mono, fontSize:11, color:'#8A8578', marginTop:8 }}>{qNum} · {today}</div>
        </div>
        <div style={{ background:darkBg, margin:'0 -50px', padding:'0 50px 28px', color:'#F3F0E8' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:8 }}>
            <div><div style={{ color:'#8A8578' }}>Kính gửi</div><strong>{camp.client}</strong></div>
            <div style={{ textAlign:'right' }}><div style={{ color:'#8A8578' }}>Người phụ trách</div><strong>{camp.owner}</strong></div>
          </div>
          <div style={{ fontSize:12, color:'#8A8578' }}>{camp.name} · {camp.start||'—'} → {camp.end||'—'} ({months} tháng)</div>
          {lines.length ? GROUP_ORDER.filter(g=>groupTotals[g]).map(g => {
            const gl = lines.filter(l=>l.group===g)
            return (
              <div key={g} style={{ marginTop:18 }}>
                <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:goldAccent, marginBottom:8 }}>{gl[0].groupLabel}</div>
                {gl.map((l,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #2A2A2A' }}>
                    <div><div style={{ fontSize:13, color:'#F3F0E8' }}>{l.name}</div><div style={{ fontSize:10.5, color:'#8A8578', marginTop:2 }}>{l.qty} {l.unit}{l.scales?' × '+months+' tháng':''} · {fmt(l.price)}</div></div>
                    <div style={{ fontFamily:mono, fontSize:13, color:'#F3F0E8' }}>{fmt(l.total)}</div>
                  </div>
                ))}
              </div>
            )
          }) : <div style={{ marginTop:20, fontSize:12.5, color:'#8A8578' }}>Chưa chọn hạng mục chi phí.</div>}
          <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${goldAccent}`, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span style={{ fontSize:12, color:'#8A8578' }}>Tổng cộng{vatOn?' (đã gồm VAT 8%)':''}</span>
            <span style={{ fontFamily:mono, fontSize:24, fontWeight:800, color:goldAccent }}>{fmt(grand)}</span>
          </div>
        </div>
        <div style={{ fontSize:11, color:'#8A8F9C', marginTop:24, fontStyle:'italic', textAlign:'center' }}>Báo giá có hiệu lực trong 15 ngày kể từ ngày phát hành · {camp.owner}</div>
      </div>
    )
  }

  // ---- Compact ----
  return (
    <div style={paperBase}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', paddingBottom:10, borderBottom:'2px solid #1C1F26', marginBottom:12 }}>
        <div style={{ fontWeight:800, fontSize:15 }}>BÁO GIÁ — {camp.name}</div>
        <div style={{ fontFamily:mono, fontSize:10.5, color:'#8A8F9C' }}>{qNum} · {today}</div>
      </div>
      <div style={{ fontSize:11.5, color:'#6B7280', marginBottom:10 }}>{camp.client} · {camp.owner} · {camp.start||'—'} → {camp.end||'—'}</div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead>
          <tr>
            {['Hạng mục','SL','Thành tiền'].map((h,i) => (
              <th key={h} style={{ textAlign: i===0?'left':i===1?'center':'right', padding:'5px 8px', borderBottom:'1.5px solid #1C1F26', fontSize:10.5, textTransform:'uppercase', color:'#8A8F9C' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.length ? lines.map((l,i) => (
            <tr key={i}>
              <td style={{ padding:'5px 8px', borderBottom:'1px solid #EEE' }}>{l.name}</td>
              <td style={{ padding:'5px 8px', borderBottom:'1px solid #EEE', textAlign:'center', fontFamily:mono, color:'#8A8F9C' }}>{l.scales?months:1} {l.unit}</td>
              <td style={{ padding:'5px 8px', borderBottom:'1px solid #EEE', textAlign:'right', fontFamily:mono }}>{fmt(l.total)}</td>
            </tr>
          )) : <tr><td colSpan={3} style={{ padding:'14px 8px', textAlign:'center', color:'#8A8F9C' }}>Chưa chọn hạng mục chi phí</td></tr>}
        </tbody>
      </table>
      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:10 }}>
        <div style={{ width:220, display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:'#6B7280' }}>Tạm tính</span><span style={{ fontFamily:mono }}>{fmt(subtotal)}</span></div>
          {vatOn && <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:'#6B7280' }}>VAT 8%</span><span style={{ fontFamily:mono }}>{fmt(vat)}</span></div>}
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13.5, fontWeight:800, borderTop:'1px solid #1C1F26', paddingTop:4, color:accent }}><span>Tổng</span><span style={{ fontFamily:mono }}>{fmt(grand)}</span></div>
        </div>
      </div>
      <div style={{ fontSize:10, color:'#8A8F9C', marginTop:16 }}>* Hiệu lực 15 ngày kể từ ngày phát hành. Người lập: {camp.owner}.</div>
    </div>
  )
}

// ---- Tab: Nhiệm vụ ----
function TabTasks() {
  const [subTab, setSubTab] = useState('overview')
  const [steps, setSteps] = useState(INITIAL_STEPS)
  const [wallet, setWallet] = useState(860)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [newTask, setNewTask] = useState({ name:'', step:'2', assignee:'', pts:'20' })

  const totalMax = steps.reduce((s, st) => s + st.subtasks.reduce((a,x)=>a+x.pts,0), 0)
  const totalEarned = steps.reduce((s, st) => s + st.subtasks.reduce((a,x)=>a+(x.done?x.pts:0),0), 0)
  const doneSteps = steps.filter(s=>s.status==='done').length

  function toggleSubtask(stepIdx, subIdx) {
    setSteps(prev => {
      const next = prev.map((st, si) => si !== stepIdx ? st : {
        ...st,
        subtasks: st.subtasks.map((s, xi) => xi !== subIdx ? s : {...s, done:true})
      })
      const step = next[stepIdx]
      if (step.subtasks.every(s => s.done)) {
        next[stepIdx] = {...next[stepIdx], status:'done'}
        if (next[stepIdx+1]?.status === 'locked') {
          next[stepIdx+1] = {...next[stepIdx+1], status:'current'}
        }
      }
      return next
    })
  }

  function addTask() {
    if (!newTask.name.trim()) return
    const si = Number(newTask.step)
    setSteps(prev => {
      const next = [...prev]
      next[si] = { ...next[si], subtasks: [...next[si].subtasks, { text: newTask.name, who: newTask.assignee || 'Chưa gán', pts: Number(newTask.pts)||0, done:false }]}
      if (next[si].status === 'done') next[si] = {...next[si], status:'current'}
      return next
    })
    setShowCreateTask(false)
    setNewTask({ name:'', step:'2', assignee:'', pts:'20' })
  }

  const TASK_TABS = [
    {id:'overview', label:'Tổng quan'},
    {id:'mission', label:'Nhiệm vụ'},
    {id:'rewards', label:'Đổi quà'},
    {id:'leaderboard', label:'Bảng xếp hạng'},
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Sub tab bar */}
      <div className="tab-bar" style={{ display:'flex', alignItems:'center', gap:4 }}>
        {TASK_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ border:'none', cursor:'pointer', padding:'7px 14px', borderRadius:8, background: subTab===t.id?'var(--marketing-tint)':'none', color: subTab===t.id?'var(--marketing)':'var(--text-muted)', fontSize:12.5, fontWeight: subTab===t.id?700:600, fontFamily:'inherit' }}>{t.label}</button>
        ))}
      </div>

      {/* Overview */}
      {subTab === 'overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16 }}>
            {[
              { label:'Nhân sự tham gia', value:'6', sub:'Toàn bộ phòng Marketing', color:'var(--text)' },
              { label:'Tổng điểm đã phát', value:'6.190', sub:'Từ đầu chiến dịch đến nay', color:'var(--gold)', mono:true },
              { label:'Nhiệm vụ hoàn thành tuần này', value:'5', sub:'+2 so với tuần trước', color:'var(--success)' },
              { label:'Quà đã đổi', value:'3', sub:'Xem lịch sử tại tab Đổi quà', color:'var(--marketing)' },
            ].map(k => (
              <div key={k.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'17px 20px', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ fontSize:11, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-muted)' }}>{k.label}</div>
                <div style={{ fontWeight:800, fontSize:26, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:16 }}>
            {/* Quy trình */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <h3 style={{ fontSize:14.5, fontWeight:700, margin:0 }}>Quy trình đang "chơi"</h3>
              <div style={{ background:'var(--surface)', border:'1px solid var(--marketing)', borderRadius:14, padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:'var(--marketing-tint)', color:'var(--marketing)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <IconMarketing size={19} />
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>Quy trình chiến dịch — Ra mắt Riverside Giai đoạn 3</div>
                      <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>5 bước · Phòng Marketing</div>
                    </div>
                  </div>
                  <span onClick={() => setSubTab('mission')} style={{ padding:'6px 12px', borderRadius:8, background:'var(--marketing)', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>Chơi tiếp</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1, height:8, borderRadius:4, background:'var(--surface-alt)' }}>
                    <div style={{ width:`${Math.round(doneSteps/steps.length*100)}%`, height:'100%', borderRadius:4, background:'var(--marketing)' }}></div>
                  </div>
                  <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{doneSteps}/{steps.length} bước</span>
                </div>
              </div>
              <div style={{ background:'var(--surface)', border:'1px dashed var(--border)', borderRadius:14, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, opacity:.7 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'var(--surface-alt)', color:'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>Quy trình Truyền thông thương hiệu Quý 4</div>
                  <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>Sắp ra mắt — đang thiết kế nhiệm vụ & mốc điểm</div>
                </div>
              </div>
            </div>
            {/* Mini leaderboard */}
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h3 style={{ fontSize:14.5, fontWeight:700, margin:0 }}>Bảng xếp hạng tuần này</h3>
                <span onClick={() => setSubTab('leaderboard')} style={{ fontSize:12, color:'var(--marketing)', fontWeight:600, cursor:'pointer' }}>Xem tất cả ›</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {M_LEADERBOARD.slice(0,5).map((p, i) => {
                  const m = medalColor(i+1)
                  return (
                    <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                      <span style={{ width:24, height:24, borderRadius:'50%', background:m.bg, color:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flex:'none' }}>{i+1}</span>
                      <span style={{ width:26, height:26, borderRadius:'50%', background:p.color+'22', color:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flex:'none' }}>{initials(p.name)}</span>
                      <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{p.name}</span>
                      <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5, color:'var(--gold)', fontWeight:700 }}>{p.week}đ</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission */}
      {subTab === 'mission' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 22px', display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'var(--marketing-tint)', color:'var(--marketing)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}>
              <IconMarketing size={26} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:17 }}>Quy trình chiến dịch — Ra mắt Riverside Giai đoạn 3</div>
              <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>5 bước chính · Phòng Marketing · Mỗi bước gồm các nhiệm vụ nhỏ, hoàn thành để nhận điểm</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'ui-monospace, monospace', fontWeight:800, fontSize:22, color:'var(--gold)' }}>
                {totalEarned} <span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>/ {totalMax} điểm</span>
              </div>
              <div style={{ width:200, height:7, borderRadius:4, background:'var(--surface-alt)', marginTop:6 }}>
                <div style={{ width:`${Math.round(totalEarned/totalMax*100)}%`, height:'100%', borderRadius:4, background:'var(--marketing)' }}></div>
              </div>
            </div>
            <button onClick={() => setShowCreateTask(true)} style={{ border:'none', background:'var(--marketing)', color:'#fff', padding:'9px 16px', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, flex:'none', fontFamily:'inherit' }}>
              <IconPlus size={15} /> Tạo nhiệm vụ
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {steps.map((step, idx) => {
              const isOpen = step.status !== 'locked'
              const stepEarned = step.subtasks.reduce((s,x)=>s+(x.done?x.pts:0),0)
              const stepMax = step.subtasks.reduce((s,x)=>s+x.pts,0)
              return (
                <div key={idx} style={{ display:'flex', gap:14, position:'relative' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                    <div style={{
                      width:36, height:36, borderRadius:'50%', flex:'none', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, zIndex:1,
                      background: step.status==='done'?'var(--success)':step.status==='current'?'var(--marketing)':'var(--surface-alt)',
                      color: step.status==='locked'?'var(--text-muted)':'#fff',
                      border: step.status==='locked'?'1.5px dashed var(--border)':'none',
                      boxShadow: step.status==='current'?'0 0 0 4px var(--marketing-tint)':'none',
                    }}>
                      {step.status==='done' ? <IconCheck size={16} /> : step.status==='locked' ? <IconLock size={14} /> : idx+1}
                    </div>
                    {idx < steps.length-1 && <div style={{ position:'absolute', left:17, top:38, bottom:-14, width:2, background:'var(--border)' }}></div>}
                  </div>
                  <div style={{ flex:1, background:'var(--surface)', border:`1px solid ${step.status==='current'?'var(--marketing)':'var(--border)'}`, borderRadius:12, padding:'14px 16px', marginBottom:14, opacity: step.status==='locked'?.55:1 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13.5 }}>{step.title}</div>
                        <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:2 }}>
                          {step.subtasks.length} nhiệm vụ nhỏ {step.status==='locked'?' · Hoàn thành bước trước để mở khoá':''}
                        </div>
                      </div>
                      <span style={{ fontFamily:'ui-monospace, monospace', fontSize:13, fontWeight:800, color: step.status==='locked'?'var(--text-muted)':'var(--gold)' }}>
                        {stepEarned}/{stepMax}đ
                      </span>
                    </div>
                    {isOpen && step.subtasks.map((s, si) => (
                      <div key={si} className="step-row" style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderTop:'1px solid var(--border)' }}>
                        <div
                          onClick={() => !s.done && step.status!=='locked' && toggleSubtask(idx, si)}
                          style={{ width:19, height:19, borderRadius:6, border:`1.5px solid ${s.done?'var(--success)':'var(--border)'}`, flex:'none', cursor: s.done?'default':'pointer', display:'flex', alignItems:'center', justifyContent:'center', background: s.done?'var(--success)':'var(--surface)', color:'#fff' }}
                        >
                          {s.done && <IconCheck />}
                        </div>
                        <span style={{ flex:1, fontSize:13, color: s.done?'var(--text-muted)':'var(--text)', textDecoration: s.done?'line-through':'none' }}>{s.text}</span>
                        <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>{s.who}</span>
                        <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12, fontWeight:700, color:'var(--gold)', width:44, textAlign:'right' }}>+{s.pts}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rewards */}
      {subTab === 'rewards' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 22px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:46, height:46, borderRadius:'50%', background:'#C23B7822', color:'var(--marketing)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, flex:'none' }}>TV</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14.5 }}>Đỗ Thảo Vy — Head Marketing</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>Điểm khả dụng để đổi quà</div>
            </div>
            <div style={{ fontFamily:'ui-monospace, monospace', fontWeight:800, fontSize:24, color:'var(--gold)' }}>{wallet.toLocaleString('vi-VN')} điểm</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
            {[
              { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>, iconBg:'var(--finance-tint)', iconColor:'var(--finance)', label:'Phiếu cà phê / trà sữa (1 tuần)', cost:250 },
              { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18h12v4H6z"/><path d="M6 14h12"/><rect x="4" y="9" width="16" height="9" rx="2"/></svg>, iconBg:'var(--attendance-tint)', iconColor:'var(--attendance)', label:'Ngày làm việc từ xa (1 ngày)', cost:400 },
              { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.4 14.5 16 10 4 20"/><path d="M6 20 20.4 5.5"/></svg>, iconBg:'var(--primary-tint)', iconColor:'var(--primary)', label:'Voucher mua sắm 200.000đ', cost:500 },
              { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>, iconBg:'var(--success-tint)', iconColor:'var(--success)', label:'Khoá học thiết kế / dựng video nâng cao', cost:800 },
              { icon:<IconMarketing />, iconBg:'var(--surface-alt)', iconColor:'var(--text-muted)', label:'Bộ phụ kiện quay dựng cá nhân', cost:1500, locked:true },
              { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V5a3 3 0 0 1 6 0v3"/></svg>, iconBg:'var(--surface-alt)', iconColor:'var(--text-muted)', label:'Thưởng tiền mặt 500.000đ', cost:2000, locked:true },
            ].map((r, i) => (
              <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:16, display:'flex', flexDirection:'column', gap:10, opacity: r.locked?.55:1 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:r.iconBg, color:r.iconColor, display:'flex', alignItems:'center', justifyContent:'center' }}>{r.icon}</div>
                <div style={{ fontWeight:700, fontSize:13.5 }}>{r.label}</div>
                <div style={{ fontFamily:'ui-monospace, monospace', fontSize:13, color: r.locked?'var(--text-muted)':'var(--gold)', fontWeight:700 }}>{r.cost.toLocaleString('vi-VN')} điểm</div>
                <button
                  disabled={r.locked || r.cost > wallet}
                  onClick={() => setWallet(w => w - r.cost)}
                  style={{ border:'none', background: (r.locked||r.cost>wallet)?'var(--surface-alt)':'var(--marketing)', color:(r.locked||r.cost>wallet)?'var(--text-muted)':'#fff', padding:8, borderRadius:8, fontSize:12.5, fontWeight:600, cursor:(r.locked||r.cost>wallet)?'not-allowed':'pointer', fontFamily:'inherit' }}
                >
                  {r.locked || r.cost > wallet ? 'Không đủ điểm' : 'Đổi ngay'}
                </button>
              </div>
            ))}
          </div>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 20px' }}>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:10, margin:'0 0 10px' }}>Lịch sử đổi quà gần đây</h3>
            {[
              { who:'Minh Quân — Ngày làm việc từ xa', pts:'-400 điểm', date:'19/09' },
              { who:'Ngọc Hà — Phiếu cà phê / trà sữa', pts:'-250 điểm', date:'12/09' },
            ].map((h, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom: i<1?'1px solid var(--border)':'none', fontSize:13 }}>
                <span style={{ flex:1 }}>{h.who}</span>
                <span style={{ fontFamily:'ui-monospace, monospace', color:'var(--gold)' }}>{h.pts}</span>
                <span style={{ color:'var(--text-muted)' }}>{h.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {subTab === 'leaderboard' && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'6px 20px 14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'0.6fr 2fr 1.4fr 1fr 1fr', gap:10, padding:'12px 4px', fontSize:10.5, letterSpacing:'.05em', textTransform:'uppercase', color:'var(--text-muted)', borderBottom:'1px solid var(--border)' }}>
            <span>Hạng</span><span>Nhân sự</span><span>Vai trò</span><span>Điểm tuần này</span><span>Tổng điểm</span>
          </div>
          {M_LEADERBOARD.map((p, i) => {
            const m = medalColor(i+1)
            return (
              <div key={p.name} className="lb-row" style={{ display:'grid', gridTemplateColumns:'0.6fr 2fr 1.4fr 1fr 1fr', gap:10, alignItems:'center', padding:'10px 4px', borderBottom:'1px solid var(--border)' }}>
                <span style={{ width:26, height:26, borderRadius:'50%', background:m.bg, color:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800 }}>{i+1}</span>
                <span style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600 }}>
                  <span style={{ width:26, height:26, borderRadius:'50%', background:p.color+'22', color:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>{initials(p.name)}</span>
                  {p.name}
                </span>
                <span style={{ fontSize:12.5, color:'var(--text-muted)' }}>{p.team}</span>
                <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5, fontWeight:600 }}>{p.week} đ</span>
                <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5, fontWeight:700, color:'var(--gold)' }}>{p.total.toLocaleString('vi-VN')} đ</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div onClick={e => e.target===e.currentTarget && setShowCreateTask(false)} style={{ position:'fixed', inset:0, background:'rgba(15,20,30,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ width:420, maxWidth:'calc(100vw - 40px)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'22px 24px', boxShadow:'0 24px 60px rgba(0,0,0,.28)' }}>
            <h3 style={{ fontSize:15.5, fontWeight:700, marginBottom:4, margin:'0 0 4px' }}>Tạo nhiệm vụ mới</h3>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>Dành cho trưởng phòng Marketing — tạo nhiệm vụ và chỉ định nhân sự tham gia.</div>
            {[
              { label:'Tên nhiệm vụ *', key:'name', placeholder:'VD: Thiết kế thêm 3 mẫu ảnh quảng cáo', type:'text' },
              { label:'Nhân sự tham gia', key:'assignee', placeholder:'VD: Ngọc Hà, Minh Quân', type:'text' },
              { label:'Điểm thưởng', key:'pts', placeholder:'VD: 20', type:'text' },
            ].map(f => (
              <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>{f.label}</label>
                <input type={f.type} value={newTask[f.key]} onChange={e => setNewTask(t => ({...t, [f.key]:e.target.value}))} placeholder={f.placeholder} style={{ padding:'9px 11px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-alt)', color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none' }} />
              </div>
            ))}
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>Thuộc bước chiến dịch</label>
              <select value={newTask.step} onChange={e => setNewTask(t=>({...t, step:e.target.value}))} style={{ padding:'9px 11px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-alt)', color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none' }}>
                {steps.map((s, i) => <option key={i} value={i}>{i+1}. {s.title}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:18 }}>
              <button onClick={() => setShowCreateTask(false)} style={{ padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', border:'1px solid var(--border)', background:'var(--surface-alt)', color:'var(--text)', fontFamily:'inherit' }}>Huỷ</button>
              <button onClick={addTask} style={{ padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', border:'none', background:'var(--marketing)', color:'#fff', fontFamily:'inherit' }}>Tạo nhiệm vụ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Create Campaign Modal ----
function CreateCampaignModal({ onClose, onSave }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name:'', type:'Ra mắt dự án', client:'— Không gắn dự án cụ thể —', owner:'Trần Anh', start:'', end:'', notes:'' })
  const [draftItems, setDraftItems] = useState({})

  function setField(k, v) { setForm(f => ({...f, [k]:v})) }
  function setQty(id, qty) { setDraftItems(d => ({...d, [id]: Number(qty) || 0})) }

  const months = monthsBetween(form.start, form.end)
  const draftTotal = Object.keys(draftItems).reduce((sum, id) => {
    const qty = draftItems[id]
    const it = catalogItem(id)
    return (qty > 0 && it) ? sum + lineTotal(it, qty, months) : sum
  }, 0)

  const STEPS_INFO = ['Thông tin chiến dịch','Chọn hạng mục chi phí','Báo giá & xác nhận']

  function handleSave() {
    if (!form.name.trim()) return
    const items = Object.keys(draftItems).filter(id => draftItems[id] > 0).map(id => ({id, qty: draftItems[id]}))
    onSave({ ...form, items, status:'draft' })
    onClose()
  }

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()} style={{ display:'flex', position:'fixed', inset:0, background:'rgba(15,18,25,.5)', zIndex:100, alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'var(--surface)', width:820, maxWidth:'94vw', maxHeight:'90vh', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 30px 80px rgba(0,0,0,.35)' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17 }}>Tạo chiến dịch Marketing</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Khởi tạo → chọn hạng mục chi phí vào gói → xác nhận báo giá.</div>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--text-muted)', padding:4, flex:'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {/* Step tabs */}
        <div style={{ display:'flex', alignItems:'center', gap:4, padding:'12px 24px 0', borderBottom:'1px solid var(--border)' }}>
          {STEPS_INFO.map((s, i) => (
            <button key={i} onClick={() => step > i && setStep(i)} style={{ border:'none', cursor: step>i?'pointer':'default', padding:'8px 14px', borderRadius:'8px 8px 0 0', background: step===i?'var(--marketing-tint)':'none', color: step===i?'var(--marketing)':'var(--text-muted)', fontWeight: step===i?700:600, fontSize:12.5, fontFamily:'inherit' }}>
              {i+1}. {s}
            </button>
          ))}
        </div>
        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'22px 24px' }}>
          {step === 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>Tên chiến dịch *</label>
                <input value={form.name} onChange={e=>setField('name',e.target.value)} placeholder="VD: Ra mắt Riverside Giai đoạn 3" style={{ padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-alt)', color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { label:'Loại chiến dịch', key:'type', opts:['Ra mắt dự án','Truyền thông thương hiệu','Tuyển khách hàng tiềm năng (Lead gen)','Sự kiện','Khác'] },
                  { label:'Dự án / khách hàng liên quan', key:'client', opts:['— Không gắn dự án cụ thể —','BQL Riverside','Chị Hải Yến — Biệt thự Nhà Bè','Chị Minh Thư — Biệt thự Thảo Điền','Cty Đông Dương','Khác'] },
                ].map(f => (
                  <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>{f.label}</label>
                    <select value={form[f.key]} onChange={e=>setField(f.key,e.target.value)} style={{ padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-alt)', color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none' }}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                {[
                  { label:'Người phụ trách', key:'owner', type:'text', placeholder:'' },
                  { label:'Bắt đầu', key:'start', type:'date', placeholder:'' },
                  { label:'Kết thúc', key:'end', type:'date', placeholder:'' },
                ].map(f => (
                  <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e=>setField(f.key,e.target.value)} style={{ padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-alt)', color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none' }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>Ghi chú</label>
                <textarea value={form.notes} onChange={e=>setField('notes',e.target.value)} rows={3} placeholder="Mục tiêu chiến dịch, KPI kỳ vọng..." style={{ padding:'9px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-alt)', color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical' }} />
              </div>
            </div>
          )}
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>Nhập số lượng cho hạng mục muốn đưa vào gói (0 = không chọn). Hạng mục theo "tháng"/"người-tháng" sẽ tự nhân theo số tháng chiến dịch chạy.</div>
              {GROUP_ORDER.map(g => {
                const items = CATALOG.filter(c => c.group === g)
                return (
                  <div key={g} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                    <div style={{ padding:'11px 16px', fontWeight:700, fontSize:13, background:'var(--surface-alt)' }}>{g}. {items[0].groupLabel}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'2.4fr 0.9fr 1fr 0.8fr 1.2fr', gap:10, padding:'8px 16px', fontSize:10.5, letterSpacing:'.05em', textTransform:'uppercase', color:'var(--text-muted)', borderBottom:'1px solid var(--border)' }}>
                      <span>Hạng mục</span><span>Đơn vị</span><span>Đơn giá</span><span>SL</span><span>Thành tiền</span>
                    </div>
                    {items.map(it => {
                      const qty = draftItems[it.id] || 0
                      const scales = it.unit === 'tháng' || it.unit === 'người-tháng'
                      const total = qty * it.price * (scales ? months : 1)
                      return (
                        <div key={it.id} style={{ display:'grid', gridTemplateColumns:'2.4fr 0.9fr 1fr 0.8fr 1.2fr', gap:10, padding:'8px 16px', alignItems:'center', borderBottom:'1px solid var(--border)' }}>
                          <span style={{ fontSize:13 }}>{it.name}</span>
                          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{it.unit}</span>
                          <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5 }}>{fmt(it.price)}</span>
                          <input type="number" min="0" value={qty||''} onChange={e=>setQty(it.id, e.target.value)} placeholder="0" style={{ width:64, padding:'6px 8px', borderRadius:7, border:'1px solid var(--border)', background:'var(--surface-alt)', color:'var(--text)', fontSize:12.5, fontFamily:'ui-monospace, monospace', textAlign:'center', outline:'none' }} />
                          <span style={{ fontFamily:'ui-monospace, monospace', fontSize:12.5, fontWeight:600, color: qty>0?'var(--marketing)':'var(--text-muted)' }}>{qty>0 ? fmt(total) : '—'}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:'var(--marketing-tint)', borderRadius:10, padding:'14px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 24px', fontSize:12.5 }}>
                <div><span style={{ color:'var(--text-muted)' }}>Tên:</span> <strong>{form.name || '—'}</strong></div>
                <div><span style={{ color:'var(--text-muted)' }}>Loại:</span> {form.type}</div>
                <div><span style={{ color:'var(--text-muted)' }}>Dự án/KH:</span> {form.client}</div>
                <div><span style={{ color:'var(--text-muted)' }}>Phụ trách:</span> {form.owner}</div>
                <div><span style={{ color:'var(--text-muted)' }}>Thời gian:</span> {form.start||'—'} → {form.end||'—'} ({months} tháng)</div>
              </div>
              {GROUP_ORDER.map(g => {
                const lines = Object.keys(draftItems).filter(id => draftItems[id]>0 && catalogItem(id)?.group===g)
                if (!lines.length) return null
                const gTotal = lines.reduce((s,id)=>{
                  const it=catalogItem(id), qty=draftItems[id]
                  return s + lineTotal(it, qty, months)
                }, 0)
                return (
                  <div key={g} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'11px 16px', fontWeight:700, fontSize:13, background:'var(--surface-alt)' }}>
                      <span>{g}. {catalogItem(lines[0]).groupLabel}</span>
                      <span style={{ fontFamily:'ui-monospace, monospace', color:'var(--marketing)' }}>{fmt(gTotal)}</span>
                    </div>
                    {lines.map(id => {
                      const it=catalogItem(id), qty=draftItems[id]
                      const scales=it.unit==='tháng'||it.unit==='người-tháng'
                      return (
                        <div key={id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:10, padding:'9px 16px', alignItems:'center', borderBottom:'1px solid var(--border)', fontSize:12.5 }}>
                          <span>{it.name}</span>
                          <span style={{ fontFamily:'ui-monospace, monospace' }}>{qty} {it.unit}</span>
                          <span style={{ fontFamily:'ui-monospace, monospace', color:'var(--text-muted)' }}>{scales?months+' th':'—'}</span>
                          <span style={{ fontFamily:'ui-monospace, monospace', fontWeight:600 }}>{fmt(lineTotal(it,qty,months))}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 20px', display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:800 }}>
                <span>Tổng dự kiến</span>
                <span style={{ fontFamily:'ui-monospace, monospace', color:'var(--marketing)' }}>{fmt(draftTotal)}</span>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderTop:'1px solid var(--border)', gap:14 }}>
          <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>Bước {step+1}/3 — {STEPS_INFO[step]}</div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            {step === 1 && <div style={{ fontSize:12.5, color:'var(--text-muted)', fontFamily:'ui-monospace, monospace' }}>Tạm tính: {fmt(draftTotal)}</div>}
            <div style={{ display:'flex', gap:8 }}>
              {step > 0 && <button onClick={() => setStep(s=>s-1)} style={{ border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', padding:'9px 16px', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Quay lại</button>}
              {step < 2 && <button onClick={() => { if(!form.name.trim() && step===0) return; setStep(s=>s+1) }} style={{ border:'none', background:'var(--marketing)', color:'#fff', padding:'9px 18px', borderRadius:8, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Tiếp theo</button>}
              {step === 2 && <button onClick={handleSave} style={{ border:'none', background:'var(--marketing)', color:'#fff', padding:'9px 18px', borderRadius:8, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Lưu chiến dịch & xuất báo giá</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Main Page ----
export default function Marketing() {
  const [tab, setTab] = useState('campaigns')
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS)
  const [detailId, setDetailId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [quoteTabId, setQuoteTabId] = useState(null)

  const MAIN_TABS = [
    { id:'campaigns', label:'Chiến dịch' },
    { id:'catalog', label:'Danh mục' },
    { id:'quote', label:'Báo giá' },
    { id:'tasks', label:'Nhiệm vụ' },
  ]

  function handleOpenDetail(id) {
    setDetailId(id)
    setTab('campaigns')
  }
  function handleBack() { setDetailId(null) }
  function handleViewQuote(id) {
    setQuoteTabId(id || detailId)
    setDetailId(null)
    setTab('quote')
  }
  function handleSaveCampaign(data) {
    const id = 'camp' + (campaigns.length + 1)
    const newCamp = { id, ...data }
    setCampaigns(prev => [...prev, newCamp])
    setQuoteTabId(id)
    setTab('quote')
  }

  const detail = campaigns.find(c => c.id === detailId)

  return (
    <div className="marketing-page" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>
      {/* Header bar */}
      <div style={{ height:64, flex:'none', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 28px', boxSizing:'border-box', background:'var(--surface)', gap:12 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:'var(--marketing-tint)', color:'var(--marketing)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none' }}>
          <IconMarketing size={16} />
        </div>
        <span style={{ fontSize:14.5, fontWeight:700 }}>Marketing</span>
        <span style={{ fontSize:12, color:'var(--text-muted)' }}>Khởi tạo chiến dịch → chọn hạng mục chi phí vào gói → ra báo giá</span>
        <span style={{ flex:1 }}></span>
        <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:6, border:'none', cursor:'pointer', background:'var(--marketing)', color:'#fff', padding:'8px 14px', borderRadius:9, fontSize:12.5, fontWeight:600, fontFamily:'inherit' }}>
          <IconPlus size={14} />
          Tạo chiến dịch
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ height:52, flex:'none', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 28px', boxSizing:'border-box', background:'var(--surface)', gap:4 }}>
        <div className="tab-bar" style={{ display:'flex', alignItems:'center', gap:4, flex:1 }}>
          {MAIN_TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if(t.id!=='campaigns') setDetailId(null) }} style={{ position:'relative', border:'none', cursor:'pointer', whiteSpace:'nowrap', padding:'7px 14px', borderRadius:8, background: tab===t.id&&!(t.id==='campaigns'&&detailId)?'var(--marketing-tint)':'none', color: tab===t.id?'var(--marketing)':'var(--text-muted)', fontSize:13, fontFamily:'inherit', fontWeight: tab===t.id?600:400 }}>{t.label}</button>
          ))}
        </div>
        {/* <button style={{ border:'1px solid var(--border)', background:'var(--surface-alt)', color:'var(--text-muted)', padding:'7px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit', whiteSpace:'nowrap' }}>
          <IconEdit /> Chỉnh sửa menu
        </button> */}
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:'22px 28px', boxSizing:'border-box', overflowY:'auto', overflowX:'hidden' }}>
        {tab === 'campaigns' && !detailId && (
          <TabCampaigns campaigns={campaigns} onOpenDetail={handleOpenDetail} onCreateCampaign={() => setShowModal(true)} />
        )}
        {tab === 'campaigns' && detailId && detail && (
          <CampaignDetail campaign={detail} onBack={handleBack} onViewQuote={() => handleViewQuote(detailId)} />
        )}
        {tab === 'catalog' && <TabCatalog />}
        {tab === 'quote' && <TabQuote campaigns={campaigns} initialId={quoteTabId} />}
        {tab === 'tasks' && <TabTasks />}
      </div>

      {/* Create Campaign Modal */}
      {showModal && <CreateCampaignModal onClose={() => setShowModal(false)} onSave={handleSaveCampaign} />}
    </div>
  )
}
