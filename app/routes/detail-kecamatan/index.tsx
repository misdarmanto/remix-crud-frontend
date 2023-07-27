import { LoaderFunction, redirect, useLoaderData } from "remix";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { CONSOLE } from "~/utilities/log";
import { Breadcrumb } from "~/components/breadcrumb";
import Chart from "react-google-charts";
import { DatabaseIcon } from "@heroicons/react/outline";

export let loader: LoaderFunction = async ({
	params,
	request,
}: {
	params: any;
	request: any;
}) => {
	const session: any = await checkSession(request);
	let access: any = false;
	if (session.role != "super_admin")
		access = session.modules?.filter((value: any) => value.module_id == 2)[0];
	else access = true;
	if (!session || !access) return redirect("/login");

	try {
		const result = await API.get(
			session,
			CONFIG.base_url_api + "/sosmed-ai/statistic"
		);
		return {
			data: result,
			session: session,
		};
	} catch (error) {
		CONSOLE.log(error);
		return { error_message: "error_message" };
	}
};

export default function Index() {
	const navigation = [{ title: "Report", href: "", active: true }];
	const loader = useLoaderData();

	const userStatisticData: any = loader.data;

	console.log(loader);
	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-3xl text-red-600">
				{loader.error?.messsage || "error"}
			</h1>
		);
	}

	const data = [
		["Element", "Users", { role: "style" }],
		["membayar", userStatisticData.totalUserPaid, "color: #abe5b8"],
		["belum membayar", userStatisticData.totalUserUnPaid, "color: #e7e48b"],
		[
			"mendaftar dari landing page",
			userStatisticData.totalUserRegisterFromLandingPage,
			"color: #afe4ec",
		],
		[
			"mendaftar dari lainya",
			userStatisticData.totalUserRegisterFromOther,
			"color: #eebc89",
		],
	];

	const nickNames = [
		["Task", "Hours per Day"],
		["Pak", userStatisticData.totalNickName.Pak],
		["Bu", userStatisticData.totalNickName.Bu],
		["Mas", userStatisticData.totalNickName.Mas],
		["Mbak", userStatisticData.totalNickName.Mbak],
		["Kak", userStatisticData.totalNickName.Kak],
		["Kang", userStatisticData.totalNickName.Kang],
		["Teh", userStatisticData.totalNickName.Teh],
	];

	const nickNameOptions = {
		title: "Nama Pangilan",
	};

	const programs = [
		["Task", "Hours per Day"],
		["Sosmed AI", userStatisticData.programs.totalProgram1],
		["Story Telling", userStatisticData.programs.totalProgram2],
		["MMS", userStatisticData.programs.totalProgram3],
	];

	const programsOptions = {
		title: "Program",
	};

	const registrationSource = [
		["Task", "Hours per Day"],
		["Landing Page", userStatisticData.totalUserRegisterFromLandingPage],
		["Organik", userStatisticData.totalUserRegisterFromOther],
	];

	const registrationSourceOptions = {
		title: "Sumber",
	};

	return (
		<div className="">
			<Breadcrumb title="Sosmed AI" navigation={navigation} />
			<div className="flex gap-5 flex-wrap">
				<Card className="bg-teal-500">
					<DatabaseIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-extrabold text-white">
						pengguna {userStatisticData.totalUser}
					</p>
				</Card>
				<Card className="bg-indigo-500">
					<DatabaseIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-extrabold text-white">
						Sosmed-AI {userStatisticData.programs.totalProgram1}
					</p>
				</Card>

				<Card className="bg-blue-500">
					<DatabaseIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-extrabold text-white">
						Sosmed-AI + Story Telling{" "}
						{userStatisticData.programs.totalProgram2}
					</p>
				</Card>

				<Card className="bg-rose-500">
					<DatabaseIcon className="text-white group-hover:text-white mr-3 flex-shrink-0 h-6 w-6" />
					<p className="font-extrabold text-white">
						program MMS {userStatisticData.programs.totalProgram3}
					</p>
				</Card>
			</div>

			<div className="my-10 p-5 flex flex-wrap gap-5">
				<div className="p-5 rounded-lg shadow bg-white">
					<Chart
						chartType="PieChart"
						data={programs}
						options={programsOptions}
						width={"50%"}
						height={"400px"}
					/>
				</div>
				<div className="p-5 rounded-lg shadow bg-white">
					<Chart
						chartType="PieChart"
						data={nickNames}
						options={nickNameOptions}
						width={"50%"}
						height={"400px"}
					/>
				</div>
				<div className="p-5 rounded-lg shadow bg-white">
					<Chart
						chartType="PieChart"
						data={registrationSource}
						options={registrationSourceOptions}
						width={"50%"}
						height={"400px"}
					/>
				</div>
			</div>

			{/* <div className="my-10 p-5 rounded-lg shadow bg-white">
				<Chart chartType="ColumnChart" width="100%" height="400px" data={data} />
			</div> */}
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
