import { Form, useLoaderData, useSubmit, useActionData } from "@remix-run/react";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { Breadcrumb } from "~/components/breadcrumb";
import { ReactElement, useState } from "react";
import { ShowMessage } from "~/components/Message";
import ReferralFeeLevels from "~/components/collections/ReferralFeeForm";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const categories = await API.get(
			session,
			`${CONFIG.base_url_api.lms}/category/list?pagination=false&role=mentor`
		);

		const address = await API.get(session, `${CONFIG.base_url_api.user}/address`);

		return {
			address: address,
			categories: categories.items,
			session: session,
			isError: false,
		};
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

export let action: ActionFunction = async ({ request }) => {
	const session: any = await checkSession(request);
	let formData = await request.formData();

	try {
		if (request.method == "POST") {
			const pyload = {
				name: formData.get("product_name"),
				description: formData.get("description"),
				category_id: +formData.get("category_id")!,
				address_id: formData.get("address_id"),
				category_name: formData.get("category_name"),
				platform_fee: formData.get("platform_fee"),
				sharing_fee: {
					level_1: +formData.get("level_1")!,
					level_2: +formData.get("level_2")!,
					level_3: +formData.get("level_3")!,
					level_4: +formData.get("level_4")!,
					level_5: +formData.get("level_5")!,
				},
			};
			const result = await API.post(session, CONFIG.base_url_api.product + "/admin/product", pyload);
			return redirect(`/product/create/${result.data.id}/media`);
		}
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

function classNames(...classes: any[]): string {
	return classes.filter(Boolean).join(" ");
}

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
	const actionData = useActionData();
	console.log(actionData);

	const submit = useSubmit();
	const navigation = [
		{ title: "Product", href: "/product", active: false },
		{ title: "Tambah", href: "", active: true },
	];

	interface CategoryTypes {
		category_id: number;
		category_name: string;
	}

	const [category, setCategory] = useState<CategoryTypes>();

	const renderSelectCategory = (
		<div>
			<label className="mt-2 block text-sm font-medium text-gray-700">Kategori Produk</label>
			<div className="mt-2">
				<select
					required={true}
					defaultValue={loader?.categories.category_id}
					onChange={(e) => {
						setCategory(JSON.parse(e.target.value));
					}}
					className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
				>
					<option>Pilih Kategori</option>
					{loader?.categories.map(
						(value: any, index: number): ReactElement => (
							<option
								key={"category-" + value.id}
								value={JSON.stringify({
									category_id: value.id,
									category_name: value.name,
								})}
							>
								{value.name}
							</option>
						)
					)}
				</select>
				<input type="hidden" name="category_id" value={category?.category_id} />
				<input type="hidden" name="category_name" value={category?.category_name} />
			</div>
		</div>
	);

	const renderCreateInformationSection = (
		<div className="w-full">
			<div className="w-full mb-4">
				<div className="w-full">
					<h1 className="mt-2 block text-sm font-bold text-gray-700">
						Informasi Produk
						<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
							Wajib
						</span>
					</h1>
					<span className="text-xs font-medium text-gray-500">
						Masukan informasi Produk dengan benar.
					</span>
				</div>

				<div className="w-full mr-2">
					<label className="my-2 block text-sm font-medium text-gray-700">Nama Produk</label>
					<input
						className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
						placeholder="Masukkan Nama Usaha"
						onInvalid={(e) => e.currentTarget.setCustomValidity("Nama Produk Wajib Diisi!")}
						onInput={(e) => e.currentTarget.setCustomValidity("")}
						name="product_name"
						required={true}
					/>
				</div>
			</div>

			<div className="w-full mb-4">{renderSelectCategory}</div>

			<div className="w-full mb-4">
				<label className="mt-2 block text-sm font-medium text-gray-700">Detail Produk</label>
				<div className="mt-2">
					<textarea
						className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
						name="description"
						onInvalid={(e) => e.currentTarget.setCustomValidity("Deskripsi wajib diisi")}
						onInput={(e) => e.currentTarget.setCustomValidity("")}
						placeholder="Masukkan detail produk"
						required={true}
						rows={4}
						style={{ resize: "vertical" }}
					/>
				</div>
				<div className="w-full flex justify-between mt-1">
					<span className="text-xs text-gray-400">Tulis detail usaha min 100 karakter.</span>
				</div>
			</div>
		</div>
	);

	type ReferralFeeTypes = { level: number; value: string };
	const [sharingReferalLevels, setSharingReferalLevels] = useState<ReferralFeeTypes[]>([
		{ level: 1, value: "" },
	]);

	return (
		<div>
			<Breadcrumb title="Informasi Produk" navigation={navigation} />
			<Form
				method="post"
				onSubmit={(e) => {
					submit(e.currentTarget, {
						method: "post",
						action: `/product/create`,
					});
				}}
			>
				{loader.address === null && (
					<ShowMessage
						title="Alamat Usaha Tidak Ditemukan"
						link="/settings/address"
						linkTitle="buat alamat disini!"
						type="error"
						message={`Anda tidak bisa membuat postingan sebelum menambahkan alamat terlebih dahulu!`}
					/>
				)}
				<div className="px-4 py-5 my-4 bg-white sm:p-6 rounded-lg">
					<div className="w-full my-4">
						<div className="w-full bg-white shadow-lg shadow-gray-200 md:shadow-gray-100 rounded-md p-4 md:mr-2">
							<div className="w-full mt-8">{renderCreateInformationSection}</div>
						</div>
					</div>
					{loader.address && <input type="hidden" name="address_id" value={loader.address.id} />}

					<div className="w-full md:flex my-10">
						<div className="w-full md:w-1/2">
							<label className="mt-2 block text-sm font-medium text-gray-700">
								Referral Fee
								<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
									Opsional
								</span>
							</label>
							<span className="text-xs font-medium text-gray-500">
								Isi referral fee dalam % (input nilai hanya angka persentase tanpa tanda "%")
							</span>

							<div className="mt-5">
								<ReferralFeeLevels levels={sharingReferalLevels} />
							</div>
						</div>
						<div className="w-full md:w-1/2">
							<label className="mt-2 block text-sm font-medium text-gray-700">
								Platform Fee
								<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
									Opsional
								</span>
							</label>
							<span className="text-xs font-medium text-gray-500">
								isi platform fee dalam nominal angka rupiah contoh: 2000000 (masukan hanya
								angka tanpa tanda Rp, titik(.) atau koma(,))
							</span>
							<div className="flex items-center mt-5 ">
								<p className="mr-2 text-sm font-medium text-gray-500">Rp</p>
								<input
									name="platform_fee"
									type="number"
									className={`block px-3 py-2 w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
									placeholder="example 200000"
									min={0}
									onInvalid={(e) => e.currentTarget.setCustomValidity("wajib di isi!")}
									onInput={(e) => e.currentTarget.setCustomValidity("")}
								/>
							</div>
						</div>
					</div>

					{sharingReferalLevels.map((item, index) => (
						<input key={index} type="hidden" name={`level_${item.level}`} value={item.value} />
					))}

					<div className="flex justify-end w-full px-2 py-4 md:py-0">
						{actionData && (
							<label className="mt-2 mx-5 block text-sm font-medium text-red-500">
								{actionData?.message}
							</label>
						)}
						<button
							type="submit"
							disabled={loader.address === null}
							className="text-white font-semibold bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 rounded-md text-md px-4 py-2 disabled:opacity-50 disabled:hover:bg-teal-500 disabled:cursor-nodrop"
						>
							Selanjutnya
						</button>
					</div>
				</div>
			</Form>
		</div>
	);
}
