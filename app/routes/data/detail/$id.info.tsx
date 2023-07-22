import { ReactElement } from "react";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { CONSOLE } from "~/utilities/log";
import { ExclamationCircleIcon } from "@heroicons/react/outline";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session = await checkSession(request);
	if (!session) return redirect("/login");

	try {
		const product = await API.get(
			session,
			`${CONFIG.base_url_api.product}/admin/product?id=${params.id}`
		);

		const address = await API.get(session, `${CONFIG.base_url_api.user}/address`);

		return {
			address: address,
			product: product,
			isError: false,
		};
	} catch (error: any) {
		CONSOLE.log(error);
		return { ...error, isError: true };
	}
};

export default function Index(): ReactElement {
	const loader = useLoaderData();
	console.log(loader);
	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-xl text-red-600">
				{loader.message || `Error ${loader.code || ""}!`}
			</h1>
		);
	}

	return (
		<div className="px-4 mt-2 py-5 bg-white sm:p-6 rounded-lg">
			<div className="w-full md:flex md:gap-8 p-2 border-b border-gray-100">
				<div className="w-full md:w-1/4">
					<p className="block text-md font-medium text-gray-700">Status Publish</p>
				</div>
				<div className="w-full md:w-9/12">
					{loader.product.variants.length === 0 && (
						<div
							className="flex p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
							role="alert"
						>
							<p className="block break-all text-md sm:mb-1 text-red-600">
								Lengkapi data varian! postingan anda tidak akan dipublish jika tidak memiliki
								varian
							</p>
						</div>
					)}
					{loader.product.variants.length !== 0 &&
						loader.product.status_confirmation === "accepted" && (
							<p className="block break-all text-md sm:mb-1 text-teal-600">Publish</p>
						)}

					{loader.product.variants.length !== 0 && loader.product.status_confirmation === "review" && (
						<div
							className="flex p-4 mb-4 text-sm text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50"
							role="alert"
						>
							<span className="font-medium mx-2">Ditinjau! </span> postingan mu sedang ditinjau
							oleh admin
						</div>
					)}

					{loader.product.variants.length !== 0 &&
						loader.product.status_confirmation === "rejected" && (
							<div
								className="flex p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
								role="alert"
							>
								<span className="font-medium mx-2">Ditolak! </span>{" "}
								{loader.product.status_confirmation_message || "maaf postingan mu ditolak"}
							</div>
						)}
				</div>
			</div>
			<div className="w-full md:flex md:gap-8 p-2 border-b border-gray-100">
				<div className="w-full md:w-1/4">
					<p className="block text-md font-medium text-gray-700">Status Produk</p>
				</div>
				<div className="w-full md:w-9/12">
					{loader.product.status === "active" && (
						<p className="block break-all text-md sm:mb-1 text-teal-600">Aktif</p>
					)}
					{loader.product.status === "inactive" && (
						<p className="block break-all text-md sm:mb-1 text-red-600">Tidak Aktif</p>
					)}
				</div>
			</div>
			<div className="w-full md:flex md:gap-8 p-2 border-b border-gray-100">
				<div className="w-full md:w-1/4">
					<p className="block text-md font-medium text-gray-700">Nama Produk</p>
				</div>
				<div className="w-full md:w-9/12">
					<p className="block break-all text-md sm:mb-1 text-gray-600">{loader.product.name}</p>
				</div>
			</div>
			<div className="w-full md:flex md:gap-8 p-2 border-b border-gray-100">
				<div className="w-full md:w-1/4">
					<p className="block text-md sm:mb-1 font-medium text-gray-700">Kategori Produk</p>
				</div>
				<div className="w-full md:w-9/12">
					<p className="block text-md text-gray-600">{loader.product.category_name}</p>
				</div>
			</div>
			<div className="w-full md:flex md:gap-8 p-2 border-b border-gray-100">
				<div className="w-full md:w-1/4">
					<p className="block text-md sm:mb-1 font-medium text-gray-700">Deskripsi Produk</p>
				</div>
				<div className="w-full md:w-9/12">
					<p className="block break-all text-md text-gray-600">{loader.product.description}</p>
				</div>
			</div>

			<div className="w-full md:flex md:gap-8 p-2 border-b border-gray-100">
				<div className="w-full md:w-1/4">
					<p className="block text-md sm:mb-1 font-medium text-gray-700">Alamat</p>
				</div>
				<div className="w-full md:w-9/12">
					<p className="mb-3 text-md font-light text-gray-500">
						{loader.address.province_name}, {loader.address.city_name},{loader.address.detail},
						kode pos : {loader.address.postal_code}, whatsapp :{loader.address.phone}
					</p>
				</div>
			</div>

			<div className="w-full md:flex md:gap-8 p-2 border-b border-gray-100">
				<div className="w-full md:w-1/4">
					<p className="block text-md sm:mb-1 font-medium text-gray-700">Pemilik</p>
				</div>
				<div className="w-full md:w-9/12">
					<p className="block text-md text-gray-600">{loader.product.creator_name}</p>
				</div>
			</div>
			<div className="w-full md:flex md:gap-8 p-2 border-b border-gray-100">
				<div className="w-full md:w-1/4">
					<p className="block text-md sm:mb-1 font-medium text-gray-700">Thumbnail Produk</p>
				</div>
				<div className="w-full md:w-9/12 flex relative">
					<img src={loader.product.thumbnail} className="object-contain h-64 w-96 rounded-md"></img>
				</div>
			</div>
			<div className="w-full md:flex md:gap-8 p-2 border-b border-gray-100">
				<div className="w-full md:w-1/4">
					<p className="block text-md sm:mb-1 font-medium text-gray-700">Vidio Produk</p>
				</div>
				{loader.product?.video !== null && (
					<div className="w-full md:w-9/12 py-2 md:py-2">
						<iframe
							className="w-full aspect-video rounded-lg"
							src={loader.product?.video}
						></iframe>
					</div>
				)}
				{loader.product?.video === null && (
					<div className="p-10 flex justify-center align-center">
						<span className="text-xs font-medium text-gray-500">
							<ExclamationCircleIcon className="h-5 w-5 inline mr-1.5 text-yellow-500" />
							Tidak ada video
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
