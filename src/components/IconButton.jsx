export default function IconButton({ Icon, onClick, active, color }) {
  return (
    <button
      onClick={onClick}
      className={`icon-btn ${active ? "active" : ""}`}
      style={color ? { color } : {}}
    >
      <Icon size={18} strokeWidth={2.4} />
    </button>
  );
}