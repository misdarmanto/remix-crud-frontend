import { FormInterfaces } from "./FormInterfaces";

interface TextAreaTypes extends FormInterfaces {}

export default function TextAreaStyles({
  title,
  placeholder,
  name,
  onInvalidMessage = "require",
  onChange = () => null,
  required = false,
  defaultValue = "",
  value,
}: TextAreaTypes) {
  return (
    <>
      <label className="mt-2 block text-sm font-medium text-gray-700">{title}</label>
      <div className="mt-2">
        <textarea
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
          name={name}
          value={value}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          onChange={onChange}
          rows={4}
          onInvalid={(e) => e.currentTarget.setCustomValidity(onInvalidMessage)}
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          style={{ resize: "none" }}
        />
      </div>
    </>
  );
}
