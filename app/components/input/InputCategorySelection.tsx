import { ExclamationCircleIcon } from "@heroicons/react/outline";
import { Fragment, ReactElement, useEffect, useState } from "react";

type CategoryType = {
    category_id: number;
    category_name: string;
};

type Props = {
    name: string;
    label: string;
    placeholder: string;
    selectedCategory?: CategoryType;
    listCategories: Array<CategoryType>;
    required?: boolean;
    withOutLabel?: boolean;
    messageValidity: string;
    onChange?: any;
    errors?: string;
};

export const InputCategorySelection = ({ name, label, placeholder, selectedCategory, listCategories, required = false, withOutLabel = false, messageValidity, onChange, errors }: Props) => {
    const [category, setCategory] = useState<{ category_id: number; category_name: string }>({ category_id: 0, category_name: "" });
    const [categories, setCategories] = useState<Array<any>>();

    useEffect(() => {
        selectedCategory && setCategory(selectedCategory);
        listCategories && setCategories(listCategories);
    }, [listCategories]);

    return (
        <Fragment>
            {!withOutLabel && (
                <label className="mt-2 block text-sm font-medium text-gray-700">
                    {label}
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
                <select
                    required={required}
                    onChange={(e): void => {
                        const categorySelected: any = categories?.find((ctgory: any, index: number): any => ctgory.id == Number(e.currentTarget.value) && ctgory);
                        setCategory({
                            category_id: categorySelected.id,
                            category_name: categorySelected.name,
                        });
                        onChange &&
                            onChange({
                                category_id: categorySelected.id,
                                category_name: categorySelected.name,
                            });
                    }}
                    onInvalid={(e): void => e.currentTarget.setCustomValidity(messageValidity)}
                    onInput={(e): void => e.currentTarget.setCustomValidity("")}
                    className={
                        (errors && "border-red-400") +
                        " block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    }
                    value={category.category_id}
                >
                    <option value="" className="hidden">
                        {placeholder}
                    </option>
                    {categories?.map(
                        (value: any, index: number): ReactElement => (
                            <option key={`category-${index}`} value={value.id}>
                                {value.name}
                            </option>
                        ),
                    )}
                </select>
                <input type="hidden" name={`${name}_id`} value={category.category_id} />
                <input type="hidden" name={`${name}_name`} value={category.category_name} />
            </div>
        </Fragment>
    );
};
