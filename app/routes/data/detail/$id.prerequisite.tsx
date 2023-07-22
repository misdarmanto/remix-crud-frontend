import { ReactElement } from "react";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/node";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { CONSOLE } from "~/utilities/log";
import { ExclamationCircleIcon } from "@heroicons/react/outline";

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

	return (
		<div className="px-4 mt-2 py-5 bg-white sm:p-6 rounded-lg">
			<div className="p-10 flex justify-center align-center">
				<span className="text-xs font-medium text-gray-500">
					<ExclamationCircleIcon className="h-5 w-5 inline mr-1.5 text-yellow-500" />
					anda belum menambahkan persyaratan kursus
				</span>
			</div>
		</div>
	);
}
