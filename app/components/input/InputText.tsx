import { ExclamationCircleIcon } from "@heroicons/react/outline";
import { Fragment, ReactElement, useEffect, useState } from "react";

type Props = {
    name: string;
    id: string;
    labelText: string;
    placeholder: string;
    defaultValue?: string;
    setValue?: any;
    required?: boolean;
    withOutLabel?: boolean;
    validityMessage?: string;
    errors?: any;
};

export const InputText = ({
    name,
    id,
    labelText,
    placeholder,
    defaultValue,
    setValue,
    required = false,
    withOutLabel = false,
    validityMessage = "Kolom wajib di isi",
    errors,
}: Props): ReactElement => {
    const [input, setInput] = useState<string>();

    useEffect(() => {
        setInput(defaultValue || "");
    }, [defaultValue, errors]);

    return (
        <Fragment>
            {!withOutLabel && (
                <label className="mt-2 block text-sm font-medium text-gray-700">
                    {labelText}
                    {required && <span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">Wajib</span>}
                    {errors && (
                        <span className="mx-2">
                            <ExclamationCircleIcon className="text-red-500 h-5 w-5 inline mr-1.5" />
                            <em className="leading-none text-xs text-red-500">{errors}</em>
                        </span>
                    )}
                </label>
            )}
            <div className={`${!withOutLabel && "mt-2"}`}>
                <input
                    required={required}
                    className={`${
                        errors && "border-red-500"
                    } block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                    placeholder={placeholder}
                    onChange={(e) => {
                        // errors && delete errors;
                        setInput(e.currentTarget.value);
                        setValue && setValue(e.currentTarget.value);
                    }}
                    defaultValue={input}
                    id={id}
                    name={name}
                    onInvalid={(e): void => e.currentTarget.setCustomValidity(validityMessage)}
                    onInput={(e): void => e.currentTarget.setCustomValidity("")}
                />
            </div>
        </Fragment>
    );
};
