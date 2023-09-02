import { Link, useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { Breadcrumb } from "~/components/breadcrumb";
import { checkSession } from "~/services/session";
import { API } from "~/services/api";
import { CONFIG } from "~/config";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const statistic = await API.get(session, `${CONFIG.base_url_api}/statistic`);

		return {
			session: session,
			statistic: statistic,
			isError: false,
		};
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

export default function Index() {
	const loader = useLoaderData();

	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-xl text-red-600">
				{loader.message || `Error ${loader.code || ""}!`}
			</h1>
		);
	}

	const navigation = [{ title: "Broadcast", href: "", active: true }];

	return (
		<div>
			<Breadcrumb title="Wa Blas" navigation={navigation} />
		</div>
	);
}
