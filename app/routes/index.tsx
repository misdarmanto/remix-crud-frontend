import Chart from "react-google-charts";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { Breadcrumb } from "~/components/breadcrumb";
import { checkSession } from "~/services/session";
import { toMoney } from "~/utilities";
import { CONSOLE } from "~/utilities/log";
import {
	CurrencyDollarIcon,
	OfficeBuildingIcon,
	ShoppingBagIcon,
	ShoppingCartIcon,
} from "@heroicons/react/outline";
import { API } from "~/services/api";
import { CONFIG } from "~/config";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const product = await API.get(session, `${CONFIG.base_url_api.product}/statistic`);
		const showroom = await API.get(session, `${CONFIG.base_url_api.showroom}/statistic`);
		return {
			session: session,
			statistic: { product, showroom },
			isError: false,
		};
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

export default function Index() {
	const loader = useLoaderData();
	console.log(loader);

	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-xl text-red-600">
				{loader.message || `Error ${loader.code || ""}!`}
			</h1>
		);
	}

	const navigation = [{ title: "Dashboard", href: "", active: true }];

	const data = [
		["Day", "Product", "Showroom"],
		[1, 37, 80],
		[2, 30, 69],
		[3, 25, 57],
		[4, 11, 18],
		[5, 11, 17],
		[6, 8, 13],
		[7, 7, 12],
		[8, 12, 29],
		[9, 16, 42],
		[10, 12, 30],
		[11, 5, 7],
		[12, 6, 8],
		[13, 4, 6],
		[14, 4, 6],
	];

	return (
		<div>
			<Breadcrumb title="Dashboard" navigation={navigation} />
			<div className="flex w-full flex-row justify-between bg-white rounded-xl shadow-md p-4 mb-4">
				<div className="w-1/2 md:w-full">
					<h1 className="text-2xl font-medium text-gray-800 w-82">
						Halo, {loader.session.user_name}
					</h1>
				</div>
			</div>

			<div className="flex flex-wrap my-5">
				<Card className="bg-blue-500">
					<ShoppingBagIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-normal text-white">{loader.statistic.product.totalProduct} product</p>
				</Card>
				<Card className="bg-rose-500">
					<OfficeBuildingIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-normal text-white">
						{loader.statistic.showroom.totalShowroom} showroom
					</p>
				</Card>
				<Card className="bg-teal-500">
					<ShoppingCartIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-normal text-white">
						{loader.statistic.product.totalOrder + loader.statistic.showroom.totalOrder} Pesanan
					</p>
				</Card>
				<Card className="bg-indigo-500">
					<CurrencyDollarIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-normal text-white">
						Rp.
						{toMoney(
							+loader.statistic.product.transactions.amount +
								+loader.statistic.showroom.transactions.amount
						)}
					</p>
				</Card>
			</div>
			<div className="p-10 bg-white border rounded-xl">
				<p className="font-normal text-white">Rp.80000</p>
				<Chart chartType="Line" width="100%" height="300px" data={data} />
			</div>
		</div>
	);
}

const Card = ({ children, className }: { children: any; className?: string }) => (
	<div className={`${className} max-w-sm  mr-2 my-3 flex p-6 bg-white border rounded-lg shadow`}>
		{children}
	</div>
);
