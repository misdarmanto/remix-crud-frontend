import { PencilIcon, TrashIcon } from "@heroicons/react/outline";
import { ReactElement, useEffect, useState } from "react";

type Props = {
    videoUrl: string;
    label: string;
    name?: string;
    placeholder?: string;
    handleChange: any;
    required?: boolean;
    validityMessage?: string;
};

export const InputVideo = (props: Props): ReactElement => {
    const [isEditVideo, setIsEditVideo] = useState<boolean>(false);
    const [errorVideo, setErrorVideo] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>("");

    const getVideoId = (videoUrl: string): string => {
        let match = videoUrl.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
        let videoId = match && match[7].length == 11 ? match[7] : "";

        if (videoId.length === 0) {
            setErrorVideo("Masukan url vidio yang valid");
            setIsEditVideo(true);
            props.handleChange("");
        }

        return videoId;
    };

    useEffect((): void => {
        setVideoUrl(props.videoUrl);
        setIsEditVideo(props.videoUrl.length == 0);
    }, [props.videoUrl]);

    return (
        <div className="w-full text-center pt-2 pb-4">
            {!isEditVideo && (
                <div className={(videoUrl.length == 0 ? "hidden " : "") + " w-full"}>
                    <div className="relative mb-2 mx-auto bg-white border-dashed border-2 border-gray-400 w-10/12 md:w-8/10 aspect-video rounded-lg justify-center">
                        <iframe className="w-full aspect-video rounded-lg" src={props.videoUrl}></iframe>
                    </div>
                    <div className="flex justify-between mx-auto w-10/12 md:w-8/10">
                        <button
                            onClick={(): void => {
                                props.handleChange("");
                                setVideoUrl("");
                                setIsEditVideo(true);
                            }}
                            type="button"
                            className="mt-2 mx-auto bg-transparent text-sm hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-2 border border-red-500 hover:border-transparent rounded flex items-center"
                        >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Hapus Video
                        </button>
                        <button
                            onClick={(): void => {
                                setVideoUrl(`https://www.youtube.com/watch?v=${getVideoId(videoUrl)}`);
                                setIsEditVideo(true);
                            }}
                            type="button"
                            className="mt-2 mx-auto bg-transparent text-sm hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-1 px-2 border border-teal-500 hover:border-transparent rounded flex items-center"
                        >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit Video
                        </button>
                    </div>
                </div>
            )}
            <div className={isEditVideo ? "block" : "hidden"}>
                <label htmlFor={`video-${props.name}`} className={(errorVideo !== null && "text-red-500") + " text-xs font-medium text-gray-400 p-1 py-[2px]"}>
                    {errorVideo !== null ? errorVideo : props.label}
                </label>
                <div className="relative mt-2 mx-auto w-11/12 md:w-10/12">
                    <input
                        className={
                            (errorVideo !== null && "border-red-500 focus:ring-red-500 focus:border-red-500") +
                            " block pr-20 pl-3 py-2 w-full sm:text-sm rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        }
                        placeholder={props.placeholder ?? ""}
                        onChange={(e): void => {
                            setVideoUrl(e.target.value);
                            setErrorVideo(null);
                        }}
                        id={`video-${props.name}`}
                        name={props.name ?? "video"}
                        value={videoUrl}
                        type="text"
                        required={props.required ?? false}
                        onInvalid={(e): void => e.currentTarget.setCustomValidity(props.validityMessage || "Vidio wajib di isi")}
                        onInput={(e): void => e.currentTarget.setCustomValidity("")}
                    />
                    <button
                        onClick={(): void => {
                            let videoId = getVideoId(videoUrl);
                            if (videoId.length !== 0) {
                                props.handleChange(`https://www.youtube.com/embed/${videoId}`);
                                setIsEditVideo(false);
                            }
                        }}
                        disabled={videoUrl.length == 0 || errorVideo !== null}
                        type="button"
                        className="text-white absolute inset-y-1 right-1 bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 font-medium rounded-lg text-sm px-3 py-auto disabled:opacity-50 disabled:hover:bg-teal-500"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
};
