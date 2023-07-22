import { ReactElement } from "react";
import { useLoaderData, useLocation, Link, Outlet } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { CONSOLE } from "~/utilities/log";
import { Breadcrumb } from "~/components/breadcrumb";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session = await checkSession(request);
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

function classNames(...classes: any[]): string {
	return classes.filter(Boolean).join(" ");
}

export default function Index(): ReactElement {
	const navigation = [
		{ title: "Product", href: "/product", active: false },
		{ title: "Details", href: "", active: true },
	];

	const loader = useLoaderData();
	const location = useLocation();

	if (loader.isError) {
		return <h1 className="text-center font-bold text-xl text-red-600">{loader.message || "Error!"}</h1>;
	}

	const TAB_HEADERS = [
		{
			name: "Detail Produk",
			href: `/product/detail/${loader.product.id}/info`,
			current: location.pathname == `/product/detail/${loader.product.id}/info`,
		},
		{
			name: "Varian Produk",
			href: `/product/detail/${loader.product.id}/variants`,
			current: location.pathname == `/product/detail/${loader.product.id}/variants`,
		},
		{
			name: "Referral & Platform Fee",
			href: `/product/detail/${loader.product.id}/fee`,
			current: location.pathname == `/product/detail/${loader.product.id}/fee`,
		},
		// {
		// 	name: "Prasyarat Course",
		// 	href: `/product/detail/${loader.product.id}/prerequisite`,
		// 	current: location.pathname == `/product/detail/${loader.product.id}/prerequisite`,
		// },
		{
			name: "Pengaturan",
			href: `/product/detail/${loader.product.id}/settings`,
			current: location.pathname == `/product/detail/${loader.product.id}/settings`,
		},
	];

	const renderTabs = (
		<div className="border-b border-gray-200">
			<nav className="-mb-px flex space-x-8 overflow-x-scroll lg:overflow-x-auto" aria-label="Tabs">
				{TAB_HEADERS.map((tab, i) => (
					<Link key={"tab-" + i} to={tab.href}>
						<button
							key={"button-tab-" + i}
							className={classNames(
								tab.current
									? "border-teal-500 text-teal-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
								"whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
							)}
							aria-current={tab.current ? "page" : undefined}
						>
							{tab.name}
						</button>
					</Link>
				))}
			</nav>
		</div>
	);

	return (
		<>
			<Breadcrumb title="Detail Product" navigation={navigation} />
			{renderTabs}
			<Outlet />
		</>
	);
}
