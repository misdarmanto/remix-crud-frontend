import { Form, useLoaderData, useSubmit, useActionData } from "@remix-run/react";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { Breadcrumb } from "~/components/breadcrumb";
import { ReactElement, useState } from "react";
import axios from "axios";
import { ExclamationCircleIcon, TrashIcon } from "@heroicons/react/outline";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");

	const product = await API.get(session, `${CONFIG.base_url_api.product}/admin/product?id=${params.id}`);
	try {
		return {
			header: params.header,
			paramsId: params.id,
			product: product,
			session: session,
			asset: {
				url: `${CONFIG.base_url_api.asset}/upload`,
				auth: {
					username: CONFIG.asset.authorization.username,
					password: CONFIG.asset.authorization.passsword,
				},
			},
			isError: false,
		};
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

export let action: ActionFunction = async ({ request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");

	let formData = await request.formData();

	try {
		const payload = {
			id: formData.get("product_id"),
			thumbnail: formData.get("thumbnail"),
			video: formData.get("video"),
		};

		if (request.method == "PATCH") {
			await API.patch(session, CONFIG.base_url_api.product + "/admin/product", payload);
			return redirect(`/product/edit/${payload.id}/variant`);
		}
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

export default function Index(): ReactElement {
	const loader = useLoaderData();

	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-xl text-red-600">
				{loader.message || `Error ${loader.code || ""}!`}
			</h1>
		);
	}
	const submit = useSubmit();
	const actionData = useActionData();
	console.log(actionData);
	const navigation = [
		{ title: "Media", href: "/product/media", active: false },
		{ title: "Tambah", href: "", active: true },
	];
	const [thumbnail, setThumbnail] = useState<string>(loader.product.thumbnail);

	const handleUpload = async (event: any) => {
		try {
			if (event.target.files.length > 0) {
				const formData = new FormData();
				formData.append("file", event.target.files[0]);
				formData.append("location", "image");
				const result = await axios.post(loader.asset?.url, formData, {
					auth: loader.asset?.auth,
					headers: { "content-type": "multipart/form-data" },
				});
				return result.data.data;
			}
		} catch (error) {
			console.log(error);
		}
	};

	const uploadImage = async (e: any) => {
		const url = await handleUpload(e);
		setThumbnail(url);
	};

	const handleDeleteThumbnail = () => {
		setThumbnail("");
	};

	const renderUploadThumbnailSection = (
		<div className="w-full">
			<div className="w-full md:w-1/3 mb-4 mt-8 md:my-8">
				<p className="mt-2 block text-sm font-bold text-gray-700">
					Thumbnail
					<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
						Wajib
					</span>
				</p>
				<span className="text-xs font-medium text-gray-500">
					<ExclamationCircleIcon className="h-5 w-5 inline mr-1.5 text-yellow-500" />
					Pastikan ukuran gambar 16:9 (1280 x 720), format gambar(jpg, jpeg, png) dan max 2mb
				</span>
			</div>

			{thumbnail && (
				<div className="mt-2 relative p-2 bg-white border-dashed border-2 border-gray-400 w-full rounded-lg image-cover flex flex-row justify-center">
					<TrashIcon
						onClick={handleDeleteThumbnail}
						className="absolute p-1 bottom-0 right-0 text-xs h-8 w-8 text-red-500 rounded-full bg-white hover:bg-red-200"
					/>

					<img src={thumbnail} className="image-cover flex-center rounded-md hover:opacity-80" />
					<input type="hidden" value={thumbnail} name="thumbnail" />
				</div>
			)}

			{!thumbnail && (
				<label className="m-2 p-2 bg-white border-dashed border-2 border-gray-400 h-32 w-32 rounded-lg image-cover flex flex-row items-center justify-center hover:border-teal-400 cursor-pointer">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-6 h-6 text-gray-500 mx-auto hover:text-teal-500"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
						/>
					</svg>

					<input onChange={uploadImage} id="dropzone-file" type="file" className="hidden" />
				</label>
			)}
		</div>
	);

	const [videoUrl, setVideoUrl] = useState("");
	const renderUploadVedeoSection = (
		<div className="flex justify-between align-center w-full">
			<div>
				<p className="mt-2 block text-sm font-bold text-gray-700">
					Video produk
					<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
						Wajib
					</span>
				</p>
				<span className="text-xs font-medium text-gray-500">
					<ExclamationCircleIcon className="h-5 w-5 inline mr-1.5 text-yellow-500" />
					Masukan video produk berupa link yang di upload di YouTube. Pastikan link tidak di private
					agar dapat ditampilkan.
				</span>
			</div>

			<div className=" w-full ml-5">
				<input
					className={
						"h-10 w-full px-2 sm:text-sm rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500 outline-none"
					}
					name="video"
					onChange={(e: any) => setVideoUrl(e.target.value)}
					placeholder="masukan url video youtube anda!"
					type="text"
					onInvalid={(e) => e.currentTarget.setCustomValidity("Vidio wajib di isi")}
					onInput={(e) => e.currentTarget.setCustomValidity("")}
				/>

				{videoUrl && (
					<div className="w-full py-2 md:py-2">
						<iframe className="w-full aspect-video rounded-lg" src={videoUrl}></iframe>
					</div>
				)}
			</div>
		</div>
	);

	return (
		<div className="">
			<Breadcrumb title="edit produk" navigation={navigation} />
			<Form
				method="patch"
				onSubmit={(e): void => {
					submit(e.currentTarget, {
						method: "patch",
						action: `/product/edit/${loader.product.id}/media`,
					});
				}}
			>
				<div className="px-4 py-5 my-4 bg-white sm:p-6 rounded-lg">
					<div className="w-full my-4">
						<div className="w-full bg-white shadow-lg shadow-gray-200 md:shadow-gray-100 rounded-md p-4 md:mr-2">
							<h1 className="mt-2 block text-sm font-bold text-gray-700">Upload produk</h1>
							<span className="text-xs font-medium text-gray-500">
								Hindari produk palsu/melanggar Hak Kekayaan Intelektual, supaya produkmu tidak
								dihapus.
							</span>
							{renderUploadThumbnailSection}
						</div>
						<div className="w-full mt-10 bg-white shadow-lg shadow-gray-200 md:shadow-gray-100 rounded-md p-4 md:mr-2">
							{renderUploadVedeoSection}
						</div>

						<input className="hidden" name="product_id" value={loader?.product.id}></input>
						<div className="flex justify-end w-full px-2 py-4 md:py-0">
							{actionData && (
								<label className="mt-2 mx-5 block text-sm font-medium text-red-500">
									{actionData?.message}
								</label>
							)}
							<button
								type="submit"
								className="text-white font-semibold bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 rounded-md text-md px-4 py-2 disabled:opacity-50 disabled:hover:bg-teal-500 disabled:cursor-nodrop"
							>
								Selanjutnya
							</button>
						</div>
					</div>
				</div>
			</Form>
		</div>
	);
}
