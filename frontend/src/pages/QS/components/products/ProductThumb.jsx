/* Ảnh minh hoạ của sản phẩm mẫu: một chiếc đèn trên nền sáng, tô theo màu tone */
export default function ProductThumb({ tone, size = 40 }) {
  return (
    <span className="qs-pl-thumb" style={{ width: size, height: size }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="8" rx="8" ry="3" fill={tone} />
        <path d="M4 8v4c0 1.7 3.6 3 8 3s8-1.3 8-3V8" fill={tone} opacity=".75" />
        <ellipse cx="12" cy="12.6" rx="4.6" ry="1.5" fill="#fff" opacity=".85" />
        <path d="M9 18h6M10 21h4" stroke={tone} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  )
}
