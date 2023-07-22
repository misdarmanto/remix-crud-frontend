import { ReactElement, useState } from "react";
import { Form, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/node";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { CONSOLE } from "~/utilities/log";
import { ActionFunction } from "remix";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");

	try {
		const product = await API.get(
			session,
			`${CONFIG.base_url_api.product}/admin/product?id=${params.id}`
		);
		return {
			product: product,
			isError: false,
		};
	} catch (error: any) {
		CONSOLE.log(error);
		return { ...error, isError: true };
	}
};

export let action: ActionFunction = async ({ request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");

	try {
		let formData = await request.formData();
		const product_id = +formData.get("product_id")!;
		if (request.method == "PATCH") {
			const pyload = {
				id: product_id,
				status: formData.get("product_status"),
			};
			const result = await API.patch(session, CONFIG.base_url_api.product + "/admin/product", pyload);
			return { isError: false, ...result, ...pyload };
		}
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

export default function Index(): ReactElement {
	const loader = useLoaderData();
	const actionData = useActionData();
	console.log(actionData);
	console.log(loader);
	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-xl text-red-600">
				{loader.message || `Error ${loader.code || ""}!`}
			</h1>
		);
	}

	const submit = useSubmit();
	const [productStatus, setProductStatus] = useState(loader.product.status === "active");

	return (
		<div className="px-4 mt-2 py-5 bg-white sm:p-6 rounded-lg">
			<Form
				method="patch"
				onSubmit={(e): void => {
					submit(e.currentTarget, {
						method: "patch",
						action: `/product/detail/${loader.product.id}/settings`,
					});
				}}
			>
				<label className="relative inline-flex items-center cursor-pointer">
					<input type="hidden" name="product_id" value={loader.product.id} />
					<input
						type="hidden"
						name="product_status"
						value={productStatus ? "active" : "inactive"}
					/>
					<input
						onChange={() => setProductStatus(!productStatus)}
						type="checkbox"
						checked={productStatus}
						className="sr-only peer"
					/>
					<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
					<span className="ml-3 text-sm font-medium text-gray-900">
						satatus {productStatus ? "aktif" : "tidak aktif"}
					</span>
				</label>

				<div className="w-full md:flex">
					<div className="md:w-8/12 px-2">
						{actionData?.isError && (
							<span className={"text-red-500 leading-none text-xs font-medium text-gray-500"}>
								{actionData.message}
							</span>
						)}
					</div>

					<button
						type="submit"
						className="w-32 text-white font-semibold bg-teal-500 hover:bg-teal-600 focus:ring-2 focus:outline-none focus:ring-teal-200 rounded-md text-md py-2 disabled:opacity-50 disabled:hover:bg-teal-500 disabled:cursor-nodrop"
					>
						Simpan
					</button>
				</div>
			</Form>
		</div>
	);
}
