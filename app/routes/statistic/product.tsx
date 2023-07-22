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
import { CreditCardIcon } from "@heroicons/react/solid";
import { API } from "~/services/api";
import { CONFIG } from "~/config";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const statistic = await API.get(session, `${CONFIG.base_url_api.product}/statistic`);
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

	console.log(loader.statistic);

	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-xl text-red-600">
				{loader.message || `Error ${loader.code || ""}!`}
			</h1>
		);
	}

	const navigation = [{ title: "Product", href: "", active: true }];

	const userGender = [
		["Task", "Hours per Day"],
		["Laki-Laki", 30],
		["Perempuan", 60],
		["Tidak Diketahui", 10],
	];

	const options = {
		title: "Jenis Kelamin Pembeli",
		is3D: true,
	};

	const data = [
		["Day", "Product"],
		[1, 3],
		[2, 4],
		[3, 2],
		[4, 11],
		[5, 11],
		[6, 8],
		[7, 7],
		[8, 12],
		[9, 16],
		[10, 12],
		[11, 5],
		[12, 6],
		[13, 4],
		[14, 4],
	];

	return (
		<div>
			<Breadcrumb title="Statistik" navigation={navigation} />

			<div className="flex flex-wrap my-5">
				<Card className="bg-blue-500">
					<ShoppingBagIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-normal text-white">{loader.statistic.totalProduct} product</p>
				</Card>
				<Card className="bg-teal-500">
					<ShoppingCartIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-normal text-white">{loader.statistic.totalOrder} Pesanan</p>
				</Card>
				<Card className="bg-indigo-500">
					<CurrencyDollarIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-normal text-white">
						Rp.{toMoney(loader.statistic.transactions.amount)}
					</p>
				</Card>
			</div>
			<div className="flex flex-wrap flex-col md:flex-row">
				<Chart
					chartType="PieChart"
					data={userGender}
					options={options}
					width={"500px"}
					style={{ marginRight: "20px" }}
					height={"350px"}
				/>
				<Chart chartType="Line" width="550px" height="350px" data={data} />
			</div>
		</div>
	);
}

const Card = ({ children, className }: { children: any; className?: string }) => (
	<div className={`${className} max-w-sm  mr-2 my-3 flex p-6 bg-white border rounded-lg shadow`}>
		{children}
	</div>
);
