function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="mb-5">
      <label className="block mb-2 font-semibold">
        {label}
      </label>

      <input
        className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}

export default Input;