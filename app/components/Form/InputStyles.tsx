import { FormInterfaces } from "./FormInterfaces";

interface InputTypes extends FormInterfaces {
  type?: string;
  onInputErrorMessage?: string;
}

export default function InputStyles({
  title,
  placeholder,
  name,
  onInvalidMessage = "require",
  required = false,
  value,
  defaultValue,
  onChange = () => null
}: InputTypes) {
  return (
    <>
      <label className="mt-2 block text-sm font-medium text-gray-700">{title}</label>
      <div className="mt-2">
        <input
          className={`block w-full px-3 py-2 border "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
           rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
          placeholder={placeholder}
          name={name}
          value={value}
          onInvalid={(e) => e.currentTarget.setCustomValidity(onInvalidMessage)}
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          defaultValue={defaultValue}
          required={required}
          onChange={onChange}
        />
      </div>
    </>
  );
}
