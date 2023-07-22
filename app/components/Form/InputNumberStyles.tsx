import { FormInterfaces } from "./FormInterfaces";

interface InputNumberTypes extends FormInterfaces {
	min?: number;
	max?: number;
	placeholder?: string;
	disabled?: boolean;
}

export default function InputNumberStyles({
	title,
	name,
	defaultValue,
	min,
	max,
	disabled = false,
	onInvalidMessage = "require",
	placeholder,
}: InputNumberTypes) {
	return (
		<>
			<label className=" block text-sm font-medium text-gray-700">{title}</label>
			<input
				className={`block w-24 px-3 py-2 mt-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
				name={name}
				type="number"
				onInvalid={(e) => e.currentTarget.setCustomValidity(onInvalidMessage)}
				onInput={(e) => e.currentTarget.setCustomValidity("")}
				min={min}
				max={max}
				placeholder={placeholder}
				disabled={disabled}
				defaultValue={defaultValue}
			/>
		</>
	);
}
