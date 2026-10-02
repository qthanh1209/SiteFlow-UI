export default function Field({ label, children, style }) {
  return <label className="kd-field" style={style}><span>{label}</span>{children}</label>
}
