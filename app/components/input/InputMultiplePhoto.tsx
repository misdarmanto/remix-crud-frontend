import axios from "axios";
import { Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { Modal } from "../Modal";

type Props = {
    photo: Array<string>;
    setPhoto: any;
    loaderAsset: {
        url: string;
        auth: any;
    };
    max: number;
    name?: string;
    error?: string;
};

export const InputMultiplePhoto = ({ photo = [], setPhoto, loaderAsset, max, name = "photo", error = "" }: Props): ReactElement => {
    const [modalPhotoAction, setModalPhotoAction] = useState<{ open: boolean; photoId: number }>({
        open: false,
        photoId: 0,
    });
    const [photoError, setPhotoError] = useState<string>("");
    const photoRef = useRef<any | null>(null);

    useEffect((): void => {
        setPhotoError(error);
    }, [photo, error]);

    const uploadPhoto = async (e: any): Promise<any> => {
        try {
            if (e.target.files.length > 0) {
                const formData = new FormData();
                formData.append("file", e.target.files[0]);
                formData.append("location", "image");
                const result = await axios.post(loaderAsset.url, formData, {
                    auth: loaderAsset.auth,
                    headers: { "content-type": "multipart/form-data" },
                });
                const photoIdAttribute = photoRef.current.getAttribute("photoId");
                if (photoIdAttribute !== null) {
                    setPhoto(photo.map((photoValue, index): any => (index == photoIdAttribute ? result.data.data : photoValue)));
                    return photoRef.current.removeAttribute("photoId");
                }
                setPhoto([...photo, result.data.data]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            photoRef.current.value = null;
        }
    };

    return (
        <Fragment>
            <div className={"flex relative content-center justify-center items-stretch align-center" + (photo.length > 0 && " grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5")}>
                <input
                    onChange={uploadPhoto}
                    className={`hidden`}
                    ref={photoRef}
                    accept="image/*"
                    type="file"
                    required={photo.length == 0}
                    onInvalid={(e): void => {
                        setPhotoError(e.currentTarget.validationMessage);
                    }}
                />
                {photo.map(
                    (photo: string, i: number): ReactElement => (
                        <div
                            key={"photo-" + i}
                            onClick={(): void => {
                                setModalPhotoAction({
                                    open: true,
                                    photoId: i,
                                });
                            }}
                            className={
                                (!photo && "hidden") + ` m-2 bg-gray-300 border-dashed border-2 border-gray-400 h-28 w-28 rounded-lg image-cover flex flex-row justify-center hover:border-teal-400 z-0`
                            }
                        >
                            <img src={photo} className="h-30 image-cover flex-center rounded-md hover:opacity-80 -z-2" />
                            <input type="hidden" value={photo} name={`${name}.${i}`} />
                        </div>
                    ),
                )}

                <div
                    onClick={(e): void => {
                        setPhotoError("");
                        photoRef.current.click();
                    }}
                    className={`${photo.length > max && "hidden"} ${
                        photoError.length && "border-red-500"
                    } m-2 p-2 bg-white border-dashed border-2 border-gray-400 h-28 w-28 rounded-lg image-cover flex flex-row items-center justify-center hover:border-teal-400 cursor-pointer`}
                >
                    <div className="">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 mx-auto hover:text-teal-500">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                        </svg>
                        <span className="text-xs font-medium text-gray-400 p-1 py-[2px] rounded hover:text-teal-400">Tambah Foto</span>
                    </div>
                </div>
                <em className="text-red-500 text-xs absolute top-[100%]">{photoError}</em>
            </div>
            {/** Modal Photo Action **/}
            <Modal
                open={modalPhotoAction.open}
                setOpen={(): void => {
                    setModalPhotoAction({
                        ...modalPhotoAction,
                        open: false,
                    });
                }}
            >
                <div>
                    <div className="w-full text-center mb-4 md:mr-2">
                        <p className="text-sm font-medium text-gray-700">Edit Foto</p>
                    </div>
                    <div className="w-full text-center my-4 md:mr-2">
                        <div>
                            <img className="rounded-md w-full h-auto aspect-video" src={photo[modalPhotoAction.photoId]} alt="" />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row mt-8 md:mt-4 gap-2 md:gap-4">
                        <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-500 text-base font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-300 sm:text-sm disabled:opacity-50 disabled:hover:bg-teal-500 cursor-pointer disabled:cursor-nodrop"
                            onClick={(): void => {
                                photoRef.current.setAttribute("photoId", modalPhotoAction.photoId);
                                photoRef.current.click();
                                setModalPhotoAction({ ...modalPhotoAction, open: false });
                            }}
                        >
                            Ganti
                        </button>
                        <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300 sm:text-sm disabled:opacity-50 disabled:hover:bg-red-500 cursor-pointer disabled:cursor-nodrop"
                            onClick={(): void => {
                                setModalPhotoAction({ ...modalPhotoAction, open: false });
                                setTimeout((): void => {
                                    setPhoto(photo.map((photoValue, i): string => (i == modalPhotoAction.photoId ? "" : photoValue)));
                                }, 300);
                            }}
                        >
                            Hapus
                        </button>
                    </div>
                    <div className="w-full text-center mt-2 md:mt-4">
                        <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-gray shadow-sm px-4 py-2 bg-white text-base font-medium text-gray hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray sm:text-sm disabled:opacity-80 cursor-pointer disabled:cursor-nodrop"
                            onClick={(): void => setModalPhotoAction({ ...modalPhotoAction, open: false })}
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </Modal>
        </Fragment>
    );
};
