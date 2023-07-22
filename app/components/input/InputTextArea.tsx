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
    validityMessage?: string;
    maxChar?: number;
    withOutLabel?: boolean;
    errors?: any;
};

export const InputTextArea = ({
    name,
    id,
    labelText,
    placeholder,
    defaultValue,
    setValue,
    required = false,
    withOutLabel = false,
    validityMessage = "Kolom wajib di isi",
    maxChar,
    errors,
}: Props): ReactElement => {
    const [input, setInput] = useState<string>("");

    useEffect(() => {
        setInput(defaultValue || "");
    }, [defaultValue, errors]);

    return (
        <Fragment>
            {!withOutLabel && (
                <label htmlFor={id} className="mt-2 block text-sm font-medium text-gray-700">
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
                <textarea
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                    name={name}
                    id={id}
                    placeholder={placeholder}
                    onChange={(e) => {
                        // errors && delete errors;
                        if (maxChar) {
                            if (input.length < maxChar) {
                                setInput(e.currentTarget.value);
                                setValue && setValue(e.currentTarget.value);
                            } else {
                                setInput(input.substring(0, maxChar - 1));
                                e.currentTarget.value = input.substring(0, maxChar - 1);
                            }
                        } else {
                            setInput(e.currentTarget.value);
                            setValue && setValue(e.currentTarget.value);
                        }
                    }}
                    defaultValue={input}
                    required={required}
                    rows={4}
                    style={{ resize: "vertical" }}
                    onInvalid={(e): void => e.currentTarget.setCustomValidity(validityMessage)}
                    onInput={(e): void => e.currentTarget.setCustomValidity("")}
                />
            </div>
        </Fragment>
    );
};
