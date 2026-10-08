/* Hình minh hoạ thùng sơn (chưa có ảnh sản phẩm thật); tone: màu nhãn */
export default function PaintThumb({ tone = '#2E7CC4', size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M9 9c0-3.5 22-3.5 22 0" fill="none" stroke="#9AA4B2" strokeWidth="1.4" />
      <rect x="8" y="10" width="24" height="25" rx="3" fill="#F4F6F9" stroke="#C9D0DA" />
      <rect x="8" y="10" width="24" height="5" rx="2" fill="#DDE2EA" />
      <rect x="10" y="17" width="20" height="14" rx="1.5" fill={tone} />
      <rect x="13" y="20" width="14" height="3" rx="1" fill="#fff" opacity=".9" />
      <rect x="13" y="25" width="9" height="2" rx="1" fill="#fff" opacity=".6" />
    </svg>
  )
}
