import { Form, useLoaderData, useSubmit, useTransition, useActionData, Link } from "@remix-run/react";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { Breadcrumb } from "~/components/breadcrumb";
import { ReactElement, useEffect, Fragment, useState } from "react";
import { ExclamationCircleIcon, TrashIcon } from "@heroicons/react/outline";
import { Dialog, Transition } from "@headlessui/react";
import { toMoney } from "~/utilities";
import axios from "axios";
import { ProductVariantTypes } from "~/types/product/variant";
import { Modal } from "~/components/Modal";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");

	try {
		const productVariant = await API.get(
			session,
			CONFIG.base_url_api.product + `/admin/product/variant?product_id=${params.id}`
		);

		return {
			product_id: params.id,
			productVariants: productVariant,
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

	try {
		const formData = await request.formData();

		const pyload = {
			product_id: formData.get("product_id"),
			name: formData.get("variant_name"),
			price: formData.get("price"),
			weight: +formData.get("weight")!,
			length: +formData.get("length")!,
			width: +formData.get("width")!,
			height: +formData.get("height")!,
			photo: formData.get("photo"),
			stock: formData.get("stock"),
			condition: formData.get("condition"),
		};

		if (request.method === "PATCH") {
			const newPyload = { ...pyload, id: formData.get("variant_id") };
			const result = await API.patch(
				session,
				CONFIG.base_url_api.product + "/admin/product/variant",
				newPyload
			);
			return { ...result.data, isError: false, type: "patch" };
		}

		if (request.method === "POST") {
			const result = await API.post(
				session,
				CONFIG.base_url_api.product + "/admin/product/variant",
				pyload
			);
			return { ...result.data, isError: false, type: "post" };
		}

		if (request.method === "DELETE") {
			await API.delete(
				session,
				CONFIG.base_url_api.product + `/admin/product/variant?id=${formData.get("variant_id")}`
			);
			return { isError: false, type: "delete" };
		}
	} catch (error: any) {
		console.log(error);
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
	const submit = useSubmit();
	const actionData = useActionData();

	console.log(actionData);
	const navigation = [
		{ title: "Product", href: "/product", active: false },
		{ title: "Tambah", href: "", active: true },
	];

	const [productVariants, setproductVariants] = useState<ProductVariantTypes[]>([]);
	const [productVariantUpdateData, setproductVariantUpdateData] = useState<ProductVariantTypes>();

	useEffect(() => {
		const variant = loader.productVariants || [];
		setproductVariants(variant);
	}, []);

	useEffect(() => {
		if (!actionData || actionData.isError || actionData.type === "delete") return;
		setproductVariants([...productVariants, actionData]);
	}, [actionData]);

	let [isOpenModal, setIsOpenModal] = useState(false);

	function handleOpenAndCloseModal() {
		setIsOpenModal(!isOpenModal);
	}

	const handleDeleteVariant = (variantId: number) => {
		const newVariant = productVariants.filter((item) => item.id !== variantId);
		setproductVariants(newVariant);
	};

	const handleUpdateVariant = (variantId: number) => {
		const variantData = productVariants.find((item) => item.id === variantId);
		setproductVariantUpdateData(variantData);
		setPhoto(variantData?.photo + "");
	};

	const defaultImage =
		"https://asset.lenterailmu.id/?dir=resources/image/banner%20(copy)%20(copy)%20(copy)%20(copy)%20(copy)%20(copy)%20(copy)%20(copy).jpg";

	const [photo, setPhoto] = useState<string>();

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
		setPhoto(url);
	};

	const handleDeletePhoto = () => {
		setPhoto("");
	};

	const renderUploadImageSection = (
		<div className="w-full my-5">
			<div className="mb-4 mt-8 md:my-8">
				<p className="mt-2 block text-sm font-bold text-gray-700">
					Foto
					<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
						Wajib
					</span>
				</p>
				<span className="text-xs font-medium text-gray-500">
					<ExclamationCircleIcon className="h-5 w-5 inline mr-1.5 text-yellow-500" />
					Pastikan ukuran gambar 16:9 (1280 x 720), format gambar(jpg, jpeg, png) dan max 2mb
				</span>
			</div>

			{photo && (
				<div className="mt-2 relative p-2 bg-white border-dashed border-2 border-gray-400 w-full rounded-lg image-cover flex flex-row justify-center">
					<TrashIcon
						onClick={handleDeletePhoto}
						className="absolute p-1 bottom-0 right-0 text-xs h-8 w-8 text-red-500 rounded-full bg-white hover:bg-red-200"
					/>

					<img
						src={photo}
						className="image-cover h-64 w-64 flex-center rounded-md hover:opacity-90"
					/>
					<input type="hidden" value={photo} name="photo" />
				</div>
			)}

			{!photo && (
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

	const renderVariantForm = (
		<Form
			method={productVariantUpdateData ? "patch" : "post"}
			onSubmit={(e) => {
				if (productVariantUpdateData) {
					submit(e.currentTarget, {
						method: "patch",
						action: `/product/create/${loader.product_id}/variant`,
					});
					handleDeleteVariant(productVariantUpdateData.id);
				} else {
					submit(e.currentTarget, {
						method: "post",
						action: `/product/create/${loader.product_id}/variant`,
					});
				}
			}}
		>
			<div className="w-full mt-5 rounded-md p-4 md:mr-2">
				<h1 className="block text-sm font-bold text-gray-700">
					Informasi produk
					<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
						Wajib
					</span>
				</h1>
				<span className="text-xs font-medium text-gray-500">
					Masukan informasi seputar produk anda
				</span>

				<div className="w-full grid gap-6 mb-6 md:grid-cols-2 mt-2">
					<InputStyles
						label="nama variant"
						type="text"
						name="variant_name"
						isRequired={true}
						placeholder="nama varian"
						defaultValue={productVariantUpdateData?.name || ""}
					/>
					<InputStyles
						label="harga"
						type="number"
						isRequired={true}
						min={0}
						name="price"
						placeholder="masukan haraga"
						defaultValue={productVariantUpdateData?.price + "" || ""}
					/>
				</div>

				<h1 className="block text-sm font-bold text-gray-700">
					Berat & Pengiriman
					<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
						Wajib
					</span>
				</h1>
				<span className="text-xs font-medium text-gray-500">
					Masukkan berat dengan menimbang produk setelah dikemas.
				</span>

				<div className="w-full grid mt-2 gap-6 mb-6 md:grid-cols-2">
					<InputStyles
						label="berat dalam gram"
						type="number"
						min={0}
						name="weight"
						placeholder="example: 10 gram"
						defaultValue={productVariantUpdateData?.weight + "" || ""}
					/>
					<InputStyles
						label="panjang dalam cm"
						type="number"
						min={0}
						name="length"
						placeholder="example: 10 cm"
						defaultValue={productVariantUpdateData?.length + "" || ""}
					/>
					<InputStyles
						label="lebar dalam cm"
						type="number"
						min={0}
						name="width"
						placeholder="example: 10 cm"
						defaultValue={productVariantUpdateData?.width + "" || ""}
					/>
					<InputStyles
						label="tinggi dalam cm"
						type="number"
						min={0}
						name="height"
						placeholder="example: 10 cm"
						defaultValue={productVariantUpdateData?.height + "" || ""}
					/>
				</div>

				{renderUploadImageSection}

				<div className="flex my-8">
					<h1 className="block mr-10 text-sm font-bold text-gray-700">
						Kondisi Produk
						<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
							Wajib
						</span>
					</h1>
					<RadioButtonStyle name="condition" value="new" label="Baru" />
					<RadioButtonStyle name="condition" value="second" label="Bekas" />
				</div>

				<div className="w-full grid gap-6 mb-6 md:grid-cols-2 mt-2">
					<InputStyles
						label="stok produk"
						type="number"
						isRequired={true}
						min={0}
						name="stock"
						placeholder="stok produk"
						defaultValue={productVariantUpdateData?.stock + "" || ""}
					/>
				</div>

				<input className="hidden" name="product_id" value={loader?.product_id} />
				<input className="hidden" name="variant_id" value={productVariantUpdateData?.id} />
				<div className="flex justify-end my-5 w-full px-2 py-4 md:py-0">
					<button
						onClick={handleOpenAndCloseModal}
						className="mx-5 text-white font-semibold bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 rounded-md text-md px-4 py-2 disabled:opacity-50 disabled:hover:bg-teal-500 disabled:cursor-nodrop"
					>
						cancel
					</button>

					<button
						onClick={handleOpenAndCloseModal}
						type="submit"
						className="text-white font-semibold bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 rounded-md text-md px-4 py-2 disabled:opacity-50 disabled:hover:bg-teal-500 disabled:cursor-nodrop"
					>
						simpan
					</button>
				</div>
			</div>
		</Form>
	);

	const transition = useTransition();
	const [modalDelete, setModalDelete] = useState(false);
	const [modalData, setModalData] = useState<any>();
	const submitDeleteData = async (e: React.FormEvent<HTMLFormElement>) => {
		submit(e.currentTarget, { method: "delete", action: `/product/create/${loader.product_id}/variant` });
		setModalDelete(false);
		handleDeleteVariant(modalData.id);
	};

	const renderModalDelete = (
		<Modal
			open={modalDelete}
			setOpen={() => {
				setModalDelete(false);
			}}
		>
			<Form method="delete" onSubmit={submitDeleteData}>
				<input className="hidden" name="variant_id" value={modalData?.id} />
				Apakah anda yakin akan menghapus produk <strong>{modalData?.name}</strong>
				<div className="flex flex-col md:flex-row mt-4">
					<button
						type="submit"
						className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
					>
						{transition?.submission ? "Menghapus..." : "Hapus"}
					</button>
					<button
						type="button"
						className="inline-flex ml-0 md:ml-2 justify-center w-full rounded-md border border-gray shadow-sm px-4 py-2 bg-white text-base font-medium text-gray hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray sm:text-sm"
						onClick={() => {
							setModalDelete(false);
						}}
					>
						Batalkan
					</button>
				</div>
			</Form>
		</Modal>
	);

	return (
		<div className="px-4 py-5 my-4 bg-white sm:p-6 rounded-lg">
			{renderModalDelete}
			<Breadcrumb title="Tambah varian" navigation={navigation} />
			<h1 className="mt-2 block text-sm font-bold text-gray-700">
				Varian Produk
				<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
					Wajib
				</span>
			</h1>
			<span className="text-xs font-medium text-gray-500">Masukan beberapa varian produk</span>
			<div className="relative mt-5 overflow-x-auto shadow-md sm:rounded-lg">
				<button
					onClick={handleOpenAndCloseModal}
					type="submit"
					className="text-white my-5 font-semibold bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 rounded-md text-md px-4 py-2 disabled:opacity-50 disabled:hover:bg-teal-500 disabled:cursor-nodrop"
				>
					Tambah
				</button>
				<table className="w-full text-sm text-left text-gray-500">
					<thead className="text-xs text-gray-700 uppercase bg-gray-50">
						<tr>
							{[
								"nama varian",
								"photo",
								"harga",
								"size",
								"stok",
								"kondisi",
								"deskripsi",
								"action",
							].map((header) => (
								<th key={header} scope="col" className="px-6 py-3">
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{productVariants.map((item: ProductVariantTypes, index: number) => (
							<tr key={index} className="bg-white border-b">
								<th
									scope="row"
									className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
								>
									{item.name}
								</th>
								<td className="px-6 py-4">
									<img className="h-10 w-10" src={item.photo} />
								</td>
								<td className="px-6 py-4">Rp.{toMoney(item.price)}</td>
								<td className="px-6 py-4">
									<ul className="mb-8 space-y-4 text-left text-gray-500">
										<ListStyle text={`berat: ${item.weight} gram`} />
										<ListStyle text={`panjang: ${item.length} cm `} />
										<ListStyle text={`lebar: ${item.width} cm`} />
										<ListStyle text={`tinggi: ${item.height} cm`} />
									</ul>
								</td>
								<td className="px-6 py-4">{item.stock}</td>
								<td className="px-6 py-4">{item.condition === "new" ? "Baru" : "Bekas"}</td>
								<td className="px-6 py-4">{item.description}</td>
								<td className="px-6 py-4">
									<div className="flex w-full md:py-0">
										<button
											onClick={() => {
												handleUpdateVariant(item.id);
												handleOpenAndCloseModal();
											}}
											type="submit"
											className="text-white mr-2 font-semibold bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 rounded-md text-md px-4 py-2 disabled:opacity-50 disabled:hover:bg-teal-500 disabled:cursor-nodrop"
										>
											edit
										</button>

										<button
											onClick={() => {
												setModalData(item);
												setModalDelete(true);
											}}
											type="submit"
											className="text-white mr-2 font-semibold bg-red-500 hover:bg-red-600 focus:ring-2 focus:outline-none focus:ring-red-200 rounded-md text-md px-4 py-2 disabled:opacity-50 disabled:hover:bg-red-500 disabled:cursor-nodrop"
										>
											Hapus
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{productVariants.length === 0 && (
					<div className="p-10 flex justify-center align-center">
						<span className="text-xs font-medium text-gray-500">
							<ExclamationCircleIcon className="h-5 w-5 inline mr-1.5 text-yellow-500" />
							anda belum membuat varian
						</span>
					</div>
				)}
			</div>
			<Transition appear show={isOpenModal} as={Fragment}>
				<Dialog as="div" className="relative z-10" onClose={handleOpenAndCloseModal}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md md:max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
									<Dialog.Title
										as="h3"
										className="text-lg font-medium leading-6 text-gray-900"
									>
										Masukan varian
									</Dialog.Title>
									{renderVariantForm}
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
			<div className="flex my-5 justify-end w-full px-2 py-4 md:py-0">
				{actionData && actionData.isError && (
					<span className={"text-red-500 mr-10 leading-none text-xs font-medium text-gray-500"}>
						{actionData.message || "terjadi kesalahan"}
					</span>
				)}

				<Link to={`/product`}>
					<button
						disabled={productVariants.length === 0}
						className="text-white font-semibold bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 rounded-md text-md px-4 py-2 disabled:opacity-50 disabled:hover:bg-teal-500 disabled:cursor-nodrop"
					>
						Selanjutnya
					</button>
				</Link>
			</div>
		</div>
	);
}

type InputStyleTypes = {
	label: string;
	placeholder: string;
	type: string;
	name: string;
	min?: number;
	isRequired?: boolean;
	defaultValue?: string;
};

const InputStyles = ({
	label,
	name,
	placeholder,
	defaultValue,
	isRequired = false,
	type,
	min,
}: InputStyleTypes) => {
	return (
		<div>
			<label className="block mb-2 text-sm text-gray-500">{label}</label>
			<input
				type={type}
				name={name}
				className={`block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
				placeholder={placeholder}
				onInvalid={(e) => e.currentTarget.setCustomValidity("wajib di isi!")}
				onInput={(e) => e.currentTarget.setCustomValidity("")}
				defaultValue={defaultValue}
				min={min}
				required={isRequired}
			/>
		</div>
	);
};

interface RadioButtonStyleTypes {
	name: string;
	value: string;
	label: string;
	defaultValue?: string;
}

const RadioButtonStyle = ({ name, value, label, defaultValue }: RadioButtonStyleTypes) => {
	return (
		<div className="flex mr-5">
			<input
				type="radio"
				value={value}
				name={name}
				defaultValue={defaultValue}
				className="text-teal-600 bg-gray-100 border-gray-300 focus:ring-teal-500 focus:ring-2"
			/>
			<label className="ml-2 text-sm font-medium text-gray-500">{label}</label>
		</div>
	);
};

const ListStyle = ({ text }: { text: string }) => {
	return (
		<li className="flex items-center space-x-3">
			<svg
				className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
					clipRule="evenodd"
				></path>
			</svg>
			<span>{text}</span>
		</li>
	);
};
