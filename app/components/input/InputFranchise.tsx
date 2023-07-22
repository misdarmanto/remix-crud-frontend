import { CheckIcon, ExclamationCircleIcon, XIcon } from "@heroicons/react/outline";
import axios from "axios";
import { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { Form } from "remix";
import { API, getHeaders } from "~/services/api";
import { Modal, ModalStatus } from "../Modal";
import { InputText } from "./InputText";
import { InputTextArea } from "./InputTextArea";

interface ModalType {
    name: {
        name: string;
        label: string;
        placeholder: string;
    };
    detail: {
        name: string;
        label: string;
        placeholder: string;
    };
    address: {
        name: string;
        label: string;
        placeholder: string;
    };
}

type Props = {
    franchiseOption: any;
    name: string;
    label: string;
    placeholder: string;
    buttonAddName: string;
    franchises: any;
    session: any;
    defaultValue?: {
        id: number;
        name: string;
    };
    required?: boolean;
    withOutLabel?: boolean;
    errors?: any;
    onChange?: any;
    validityMessage?: string;
    modalValue: ModalType;
};

export const InputFranchise = ({
    franchiseOption,
    name,
    label,
    placeholder,
    buttonAddName,
    franchises,
    defaultValue,
    session,
    required = false,
    withOutLabel = false,
    errors,
    onChange,
    validityMessage = "Kolom wajib di isi",
    modalValue,
}: Props): ReactElement => {
    const [modal, setModal] = useState<{ action: string; open: boolean; data: any }>({
        action: "",
        open: false,
        data: {},
    });
    const franchiseInputRef = useRef<any>(null);
    const addFranchiesModalRef = useRef<any>(null);
    const [franchise, setFranchise] = useState<{ id: number; name: string }>({ id: 0, name: "" });
    const [isShowButtonAddFranchise, setIsShowButtonAddFranchise] = useState<boolean>(false);
    const [listFranchises, setListFranchises] = useState<Array<any>>();

    useEffect(() => {
        defaultValue && setFranchise(defaultValue);
        franchises && setListFranchises(franchises);
    }, [franchises, defaultValue]);

    const handleAddFranchise = async (params: { method: string; action: string; formData: any }): Promise<any> => {
        const formData = Object.fromEntries(new FormData(params.formData));

        setModal({
            ...modal,
            open: false,
        });

        try {
            const result: any = await axios.post(franchiseOption.url, formData, {
                auth: franchiseOption.auth,
                headers: {
                    ...getHeaders(session),
                },
            });
            setListFranchises([...franchises, result.data.data]);
            if (result.data.status == "success")
                setModal({
                    action: "status",
                    open: true,
                    data: {
                        success: true,
                        message: `Berhasil menambah ${label}`,
                    },
                });
        } catch (err: any) {
            console.error(err);
            setModal({
                action: "status",
                open: true,
                data: {
                    success: false,
                    message: `Gagal menambah ${label}, ${err.message}`,
                },
            });
        } finally {
            setTimeout((): void => {
                franchiseInputRef.current.focus();
            }, 500);
        }
    };

    return (
        <Fragment>
            <div>
                {!withOutLabel && (
                    <label className="mt-2 block text-sm font-medium text-gray-700">
                        Waralaba
                        <span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">Wajib</span>
                        {errors?.franchise && (
                            <span className="mx-2">
                                <ExclamationCircleIcon className="text-red-500 h-5 w-5 inline mr-1.5" />
                                <em className="leading-none text-xs text-red-500">{errors?.franchise}</em>
                            </span>
                        )}
                    </label>
                )}
                <div className={`${!withOutLabel && "mt-2 relative"}`}>
                    <select
                        required={required}
                        name={`${name}_id`}
                        ref={franchiseInputRef}
                        onChange={(e): void => {
                            let frnchise = listFranchises?.find((fr: { id: number; name: string }): any => fr.id == Number(e.currentTarget.value) && fr);
                            setFranchise({ id: frnchise.id, name: frnchise.name });
                            onChange && onChange({ id: frnchise.id, name: frnchise.name });
                        }}
                        onFocus={(): void => {
                            errors?.franchise && delete errors.franchise;
                            setIsShowButtonAddFranchise(true);
                        }}
                        onBlur={(): any =>
                            setTimeout((): void => {
                                setIsShowButtonAddFranchise(false);
                            }, 200)
                        }
                        onInvalid={(e): void => e.currentTarget.setCustomValidity(validityMessage)}
                        onInput={(e): void => e.currentTarget.setCustomValidity("")}
                        className={
                            (errors?.franchise && "border-red-500") +
                            " block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        }
                        value={franchise.id}
                    >
                        <option className="hidden">{placeholder}</option>
                        {listFranchises?.map(
                            (value: any, index: number): ReactElement => (
                                <option key={`${name}-${value.id}`} value={value.id}>
                                    {value.name}
                                </option>
                            ),
                        )}
                    </select>
                    <button
                        onClick={(): void => {
                            setModal({
                                action: "add-franchise",
                                open: true,
                                data: {},
                            });
                        }}
                        disabled={!isShowButtonAddFranchise}
                        type="button"
                        className="z-4 text-white absolute inset-y-1 right-1 bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 font-medium rounded-lg text-sm px-3 py-auto disabled:hidden"
                    >
                        {buttonAddName}
                    </button>
                </div>
            </div>

            {/** Modal add franchise **/}
            <Modal
                open={modal.open && modal.action == "add-franchise"}
                setOpen={(): void => {
                    setModal({
                        ...modal.data,
                        open: false,
                    });
                }}
            >
                <Form method="post" ref={addFranchiesModalRef}>
                    <input type="hidden" name="creator_id" value={session.role == "super_admin" || session.role == "admin" ? session.admin_id : session.user_id} />
                    <input type="hidden" name="creator_name" value={session.role == "super_admin" || session.role == "admin" ? session.admin_name : session.user_name} />
                    <div className="w-full text-center mb-4 md:mr-2">
                        <p className="text-sm font-medium text-gray-700">{buttonAddName}</p>
                    </div>
                    <div>
                        <div className="w-full mt-4 md:mr-2">
                            <InputText
                                name={modalValue.name.name}
                                id={`modal_${modalValue.name.name.toLowerCase()}_franchise`}
                                labelText={modalValue.name.label}
                                placeholder={modalValue.name.placeholder}
                                validityMessage={`${modalValue.name.label} wajib di isi`}
                                required
                            />
                        </div>
                        <div className="w-full mt-4 md:mr-2">
                            <InputTextArea
                                name={modalValue.detail.name}
                                id={`modal_${modalValue.detail.name.toLowerCase()}_franchise`}
                                labelText={modalValue.detail.label}
                                placeholder={modalValue.detail.placeholder}
                                validityMessage={`${modalValue.detail.label} wajib di isi`}
                                required
                            />
                        </div>
                        <div className="w-full mt-4 md:mr-2">
                            <InputTextArea
                                name={modalValue.address.name}
                                id={`modal_${modalValue.address.name.toLowerCase()}_franchise`}
                                labelText={modalValue.address.label}
                                placeholder={modalValue.address.placeholder}
                                validityMessage={`${modalValue.address.label} wajib di isi`}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row mt-8 gap-2 md:gap-0">
                        <button
                            type="button"
                            className="inline-flex mr-0 md:mr-2 justify-center w-full rounded-md border border-gray shadow-sm px-4 py-2 bg-white text-base font-medium text-gray hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray sm:text-sm disabled:opacity-80 cursor-pointer disabled:cursor-nodrop"
                            onClick={(): void => {
                                setModal({
                                    action: "",
                                    open: false,
                                    data: {},
                                });
                            }}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                handleAddFranchise({
                                    method: "post",
                                    action: `/franchise/create`,
                                    formData: addFranchiesModalRef.current,
                                });
                            }}
                            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-500 text-base font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-300 sm:text-sm disabled:opacity-50 disabled:hover:bg-teal-500 cursor-pointer disabled:cursor-nodrop"
                        >
                            Simpan
                        </button>
                    </div>
                </Form>
            </Modal>

            {/* Modal Status */}
            <Modal
                open={modal.open && modal.action == "status"}
                setOpen={(): void =>
                    setModal({
                        ...modal,
                        open: false,
                    })
                }
            >
                <Fragment>
                    <div>
                        <div className={"mx-auto flex items-center justify-center h-12 w-12 rounded-full " + (modal.data.success ? "bg-teal-100" : "bg-red-100")}>
                            {modal.data.success ? <CheckIcon className="h-6 w-6 text-teal-600" aria-hidden="true" /> : <XIcon className="h-6 w-6 text-red-600" aria-hidden="true" />}
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{modal.data.success ? "Berhasil" : "Gagal"}</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">{modal.data.message}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-6 flex flex-col md:flex-row">
                        <button
                            type="button"
                            className={
                                "inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm " +
                                (modal.data.success ? "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500" : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500")
                            }
                            onClick={(): void => {
                                setModal({
                                    ...modal,
                                    open: false,
                                });
                            }}
                        >
                            Tutup
                        </button>
                    </div>
                </Fragment>
            </Modal>
        </Fragment>
    );
};
