import { ReactChildren, ReactElement } from "react";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/node";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { CONSOLE } from "~/utilities/log";
import { ExclamationCircleIcon } from "@heroicons/react/outline";
import { toMoney } from "~/utilities";

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
	const parseSharingFee = (fee: string) => {
		return JSON.parse(fee);
	};

	const sharingFee = parseSharingFee(loader.product.sharing_fee);

	type Props = {
		children?: React.ReactNode;
	};

	const List: React.FC<Props> = ({ children }) => {
		return (
			<li className="flex items-center space-x-3">
				<svg
					className="flex-shrink-0 w-5 h-5 text-green-500"
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
				{children}
			</li>
		);
	};

	return (
		<div className="px-4 mt-2 py-5 bg-white sm:p-6 rounded-lg">
			{sharingFee && (
				<table className="w-full text-sm text-left text-gray-500">
					<thead className="text-xs text-gray-700 uppercase bg-gray-50">
						<tr>
							{["referral fee", "platform fee"].map((header) => (
								<th key={header} scope="col" className="px-6 py-3">
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						<tr className="bg-white border-b">
							<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<ul className="mb-8 space-y-4 text-left text-gray-500">
									<List>Level 1 : {sharingFee.level_1}%</List>
									<List>Level 2 : {sharingFee.level_2}%</List>
									<List>Level 3 : {sharingFee.level_3}%</List>
									<List>Level 4 : {sharingFee.level_4}%</List>
									<List>Level 5 : {sharingFee.level_5}%</List>
								</ul>
							</th>
							<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
								<span className="text-gray-500">
									Rp.{toMoney(loader.product.platform_fee)}
								</span>
							</th>
						</tr>
					</tbody>
				</table>
			)}

			{!sharingFee && (
				<div className="p-10 flex justify-center align-center">
					<span className="text-xs font-medium text-gray-500">
						<ExclamationCircleIcon className="h-5 w-5 inline mr-1.5 text-yellow-500" />
						anda belum membuat referral fee dan platform fee
					</span>
				</div>
			)}
		</div>
	);
}
