export default function Input({ type="text", placeholder, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      className="input"
    />
  );
}