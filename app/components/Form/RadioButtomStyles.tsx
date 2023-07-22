import { FormInterfaces } from "./FormInterfaces";

interface RadioTypes extends FormInterfaces {
  onChange: any;
  defaultChecked?: boolean;
  value: string;
}

export default function RadioButtomStyles({
  title,
  name,
  onChange,
  defaultChecked,
  value,
}: RadioTypes) {
  return (
    <div className="flex items-center mb-2">
      <input
        id="default-radio-1"
        type="radio"
        value={value}
        onChange={onChange}
        defaultChecked={defaultChecked}
        name={name}
        className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 focus:ring-teal-500 focus:ring-2"
      />
      <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{title}</label>
    </div>
  );
}
