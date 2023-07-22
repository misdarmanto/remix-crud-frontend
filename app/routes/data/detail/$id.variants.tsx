import { ReactElement } from "react";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/node";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { CONSOLE } from "~/utilities/log";
import { ExclamationCircleIcon } from "@heroicons/react/outline";
import { toMoney } from "~/utilities";
import { ProductVariantTypes } from "~/types/product/variant";

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

export default function Index(): ReactElement {
	const loader = useLoaderData();

	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-xl text-red-600">
				{loader.message || `Error ${loader.code || ""}!`}
			</h1>
		);
	}

	console.log(loader);

	return (
		<div className="px-4 py-5 bg-white sm:p-6 rounded-lg">
			<table className="w-full text-sm text-left text-gray-500">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50">
					<tr>
						{[
							"no",
							"nama varian",
							"photo",
							"harga",
							"stok",
							"kondisi",
							"size",
							"description",
						].map((header) => (
							<th key={header} scope="col" className="px-6 py-3">
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{loader.product.variants.map((item: ProductVariantTypes, index: number) => {
						return (
							<tr key={index} className="bg-white border-b">
								<td className="px-6 py-4">{index + 1}</td>
								<th
									scope="row"
									className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
								>
									{item.name}
								</th>
								<td className="px-6 py-4">
									<img className="object-contain h-16 w-32" src={item.photo} />
								</td>
								<td className="px-6 py-4">Rp.{toMoney(item.price)}</td>
								<td className="px-6 py-4">{item.stock}</td>
								<td className="px-6 py-4">{item.condition === "new" ? "Baru" : "Bekas"}</td>
								<td className="px-6 py-4">
									<ul className="mb-8 space-y-4 text-left text-gray-500">
										<ListStyle text={`berat: ${item.weight || 0} gram`} />
										<ListStyle text={`panjang: ${item.length || 0} cm `} />
										<ListStyle text={`lebar: ${item.width || 0} cm`} />
										<ListStyle text={`tinggi: ${item.height || 0} cm`} />
									</ul>
								</td>
								<td className="px-6 py-4">{item.description}</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{loader.product.variants.length === 0 && (
				<div className="p-10 flex justify-center align-center">
					<span className="text-xs font-medium text-gray-500">
						<ExclamationCircleIcon className="h-5 w-5 inline mr-1.5 text-yellow-500" />
						anda belum membuat varian
					</span>
				</div>
			)}
		</div>
	);
}

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
