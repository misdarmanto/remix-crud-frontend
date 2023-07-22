import { Fragment, ReactElement, useEffect, useState } from "react";

type Props = {
    id: string;
    name: string;
    label: string;
    placeholder: string;
    unitName: string;
    required?: boolean;
    defaultValue?: number;
    validityMessage?: string;
    onChange?: any;
    errors?: any;
};

export const InputUnit = (props: Props): ReactElement => {
    const [unit, setUnit] = useState<number>(0);

    useEffect((): void => {
        props?.defaultValue && setUnit(props?.defaultValue);
    }, [props?.defaultValue]);

    return (
        <Fragment>
            <label htmlFor={props.id} className="w-auto md:hidden inline-flex items-center text-sm text-gray-500">
                {props.label}
            </label>
            <div className="w-auto md:w-full relative">
                <span className="flex font-semibold text-gray-500 bg-gray-200 rounded-r-md absolute inset-y-0 right-0 items-center px-3 pointer-events-none border border-l-0 border-gray-300">
                    {props.unitName}
                </span>
                <input
                    className={`block w-full pr-12 pl-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                    placeholder={props.placeholder}
                    id={props.id}
                    name={props.name}
                    type="number"
                    required={props.required || false}
                    defaultValue={unit || ""}
                    min={0}
                    onChange={(e): void => {
                        if (Number(e.currentTarget.value) < 0) {
                            e.currentTarget.value = e.currentTarget.value.replace(/-/, "");
                        }
                        setUnit(Number(e.currentTarget.value));
                        props?.onChange && props?.onChange(Number(e.currentTarget.value));
                    }}
                    onInvalid={(e): void => e.currentTarget.setCustomValidity(props.validityMessage || "Kolom wajib di isi")}
                    onInput={(e): void => e.currentTarget.setCustomValidity("")}
                />
            </div>
        </Fragment>
    );
};
