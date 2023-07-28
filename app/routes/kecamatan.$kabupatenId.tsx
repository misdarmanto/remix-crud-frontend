import { Link, useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { Breadcrumb } from "~/components/breadcrumb";
import { checkSession } from "~/services/session";
import { DatabaseIcon } from "@heroicons/react/outline";
import { API } from "~/services/api";
import { CONFIG } from "~/config";
import { IStatisticKecamatanModel, IStatisticModel } from "~/models/statisticModel";
import Chart from "react-google-charts";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const statistic = await API.get(
			session,
			`${CONFIG.base_url_api}/statistic/kecamatan?kabupatenId=${params.kabupatenId}`
		);

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

	const navigation = [{ title: "Dashboard", href: "", active: true }];
	const statistic: IStatisticKecamatanModel[] = loader.statistic;

	const kecamatan: any = [["Task", "Hours per Day"]];

	for (let i = 0; statistic.length > i; i++) {
		kecamatan.push([statistic[i].kecamatan, statistic[i].totalUser]);
	}

	const kecamatanOptions = {
		title: "Kecamatan",
	};

	const bgColors = ["bg-teal-500", "bg-blue-500", "bg-indigo-500", "bg-rose-500"];

	return (
		<div>
			<Breadcrumb title="Dashboard" navigation={navigation} />
			<div className="flex w-full flex-row justify-between bg-white rounded-xl shadow-md p-4 mb-4">
				<div className="w-1/2 md:w-full">
					<h1 className="text-2xl font-medium text-gray-800 w-82">
						Halo, {loader.session.adminName}
					</h1>
				</div>
			</div>

			<div className="flex flex-wrap my-5 gap-5">
				{statistic.map((item, index: number) => (
					<Link
						key={item.kabupatenId}
						to={`/desa/${item.kecamatanId}/${item.kabupatenId}`}
					>
						<Card className={bgColors[index]}>
							<DatabaseIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
							<p className="font-extrabold text-white">
								KECAMATAN {item.kecamatan} {item.totalUser}
							</p>
						</Card>
					</Link>
				))}
			</div>

			<div className="p-5 rounded-lg shadow bg-white">
				<Chart
					chartType="PieChart"
					data={kecamatan}
					options={kecamatanOptions}
					width={"100%"}
					height={"400px"}
				/>
			</div>
		</div>
	);
}

const Card = ({ children, className }: { children: any; className?: string }) => (
	<div
		className={`${className} w-full md:max-w-xs  sm:mr-2 my-2 sm:my-3 flex p-6 bg-white border rounded-lg shadow`}
	>
		{children}
	</div>
);
