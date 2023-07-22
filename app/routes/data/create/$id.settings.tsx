import { Form, useLoaderData, useSubmit, useActionData } from "@remix-run/react";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { Breadcrumb } from "~/components/breadcrumb";
import { ReactElement, useState } from "react";
import ReferralFeeLevels from "~/components/collections/ReferralFeeForm";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const courses = await API.get(session, `${CONFIG.base_url_api.lms}/course/list`);
		return {
			product_id: params.id,
			courses: courses.items,
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
	if (!session) return redirect("/login");

	try {
		let formData = await request.formData();
		const product_id = formData.get("product_id");
		if (request.method == "PATCH") {
			const pyload = {
				id: product_id,
				platform_fee: formData.get("platform_fee"),
				sharing_fee: {
					level_1: +formData.get("level_1")!,
					level_2: +formData.get("level_2")!,
					level_3: +formData.get("level_3")!,
					level_4: +formData.get("level_4")!,
					level_5: +formData.get("level_5")!,
				},
				prerequisites: formData.getAll("prerequisites"),
			};
			await API.patch(session, CONFIG.base_url_api.product + "/admin/product", pyload);
			return redirect(`/product`);
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
		{ title: "product", href: "/product", active: false },
		{ title: "Tambah", href: "", active: true },
	];

	const getAllCourseModules = () => {
		const modules: any = [];
		loader.courses.forEach((item: any) => {
			item.modules.forEach((module: any) => {
				modules.push({
					creator_name: item.creator_name,
					creator_id: item.creator_id,
					course_title: module.title,
					course_id: module.course_id,
				});
			});
		});
		return modules;
	};

	const allCourseModules = getAllCourseModules();

	type ReferralFeeTypes = { level: number; value: string };
	const [sharingReferalLevels, setSharingReferalLevels] = useState<ReferralFeeTypes[]>([
		{ level: 1, value: "" },
	]);

	return (
		<div className="">
			<Breadcrumb title="Tambah Usaha" navigation={navigation} />
			<Form
				method="patch"
				onSubmit={(e): void => {
					submit(e.currentTarget, {
						method: "patch",
						action: `/product/create/${loader.product_id}/settings`,
					});
				}}
			>
				<div className="px-4 py-5 my-4 bg-white sm:p-6 rounded-lg">
					<div className="w-full bg-white shadow-lg shadow-gray-200 md:shadow-gray-100 rounded-md p-4">
						<h1 className="mt-2 block text-sm font-bold text-gray-700">Pengelolaan usaha</h1>
						<div className="w-full md:flex mt-4 md:border-t md:border-gray-100">
							<div className="w-full md:w-1/2">
								<label className="mt-2 block text-sm font-medium text-gray-700">
									Prasyarat Course
									<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
										Opsional
									</span>
								</label>
								<span className="text-xs font-medium text-gray-500">
									Prasyarat course adalah syarat wajib yang harus terpenuhi yang mana
									seseorang harus menyelesaikan course terlebih dahulu sebelum melanjutkan
								</span>
							</div>
							<div>
								<h1 className="my-5 text-center block text-sm font-bold text-gray-700">
									Daftar kursus
								</h1>
								<ul className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700 ">
									{allCourseModules.map((item: any, index: number) => (
										<li key={index}>
											<div className="flex items-center p-2 rounded hover:bg-gray-100">
												<input
													id="checkbox-item-11"
													name="prerequisites"
													type="checkbox"
													value={JSON.stringify(item)}
													className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
												/>
												<label className="w-full ml-2 text-sm font-medium text-gray-900 rounded">
													{item.course_title}
												</label>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>

					<div className="w-full my-5 p-5 bg-white shadow-lg shadow-gray-200 md:shadow-gray-100 rounded-md p-4">
						<div className="w-full md:flex mt-4 md:border-t md:border-gray-100">
							<div className="w-full md:w-1/2">
								<label className="mt-2 block text-sm font-medium text-gray-700">
									Referral Fee
									<span className="text-xs font-medium text-gray-400 bg-gray-200 mx-2 p-1 py-[2px] rounded">
										Opsional
									</span>
								</label>
								<span className="text-xs font-medium text-gray-500">
									Isi referral fee dalam % (input nilai hanya angka persentase tanpa tanda
									"%")
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
					</div>

					{sharingReferalLevels.map((item, index) => (
						<input key={index} type="hidden" name={`level_${item.level}`} value={item.value} />
					))}
					<input className="hidden" name="product_id" value={loader?.product_id}></input>

					<div className="w-full my-4">
						<div className="w-full md:flex bg-white shadow-lg shadow-gray-200 md:shadow-gray-100 rounded-md p-4 md:mr-2">
							<div className="w-full md:w-8/12 px-2">
								{actionData?.isError && (
									<span
										className={
											"text-red-500 leading-none text-xs font-medium text-gray-500"
										}
									>
										{actionData.message}
									</span>
								)}
							</div>
							<div className="w-full md:w-4/12 px-2 py-4 md:py-0">
								<button
									type="submit"
									className="w-full text-white font-semibold bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 rounded-md text-md px-4 py-2 disabled:opacity-50 disabled:hover:bg-teal-500 disabled:cursor-nodrop"
								>
									Selesai
								</button>
							</div>
						</div>
					</div>
				</div>
			</Form>
		</div>
	);
}
