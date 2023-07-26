import {
	Form,
	useLoaderData,
	useSubmit,
	useTransition,
	useActionData,
} from "@remix-run/react";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { CONFIG } from "~/config";
import { Breadcrumb } from "~/components/breadcrumb";
import { ISessionModel } from "~/models/sessionModel";
import { IUserCreateRequestModel } from "~/models/userModel";
import { useEffect, useState } from "react";
import { IDesaModel, IKabupatenModel, IKecamatanModel } from "~/models/regionModel";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");

	const kabupaten = await API.get(session, CONFIG.base_url_api + `/region/kabupaten`);
	const kecamatan = await API.get(
		session,
		CONFIG.base_url_api + `/region/kecamatan?kabupatenId=11`
	);

	const desa = await API.get(
		session,
		CONFIG.base_url_api + `/region/desa?kecamatanId=1111`
	);

	return {
		kabupaten,
		kecamatan,
		desa,
		session: session,
		isError: false,
	};
};

export let action: ActionFunction = async ({ request }) => {
	const session: ISessionModel | any = await checkSession(request);
	if (!session) return redirect("/login");

	let formData = await request.formData();
	try {
		if (request.method == "POST") {
			const payload: IUserCreateRequestModel | any = {
				userName: formData.get("userName"),
				userPhoneNumber: formData.get("userPhoneNumber"),
				userDetailAddress: formData.get("userDetailAddress"),
				userDesa: formData.get("userDesa"),
				userKecamatan: formData.get("userKecamatan"),
				userKabupaten: formData.get("userKabupaten"),
			};

			const result = await API.post(
				session,
				CONFIG.base_url_api + "/users",
				payload
			);

			return redirect("/user-data");
		}
		return { isError: false, request };
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

export default function Index() {
	const navigation = [{ title: "data pemilu", href: "", active: true }];
	const loader = useLoaderData();

	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-3xl text-red-600">
				{loader.error?.messsage || "error"}
			</h1>
		);
	}

	const submit = useSubmit();
	const transition = useTransition();
	const actionData = useActionData();

	const kabupaten: IKabupatenModel[] = loader.kabupaten;
	const kecamatan: IKecamatanModel[] = loader.kecamatan;
	const desa: IDesaModel[] = loader.desa;
	const session: ISessionModel = loader.session;

	const [kabupatenList, setKabupatenList] = useState<IKabupatenModel[]>([]);
	const [kecamatanList, setKecamatanList] = useState<IKecamatanModel[]>([]);
	const [desaList, setDesaList] = useState<IDesaModel[]>([]);

	const [kabupatenSelected, setKabupatenSelected] = useState<IKabupatenModel>();
	const [kecamatanSelected, setKecamatanSelected] = useState<IKecamatanModel>();
	const [desaSelected, setDesaSelected] = useState<IDesaModel>();

	useEffect(() => {
		const filterKecamatan = kecamatan.filter((item) => item.kabupatenId === "11");
		setKabupatenList(kabupaten);
		setKecamatanList(filterKecamatan);
		setDesaList(desa);
	}, []);

	useEffect(() => {
		if (kabupatenSelected) {
			const filterKecamatan = kecamatan.filter(
				(item) => item.kabupatenId === kabupatenSelected.kabupatenId
			);
			if (filterKecamatan.length !== 0) {
				setKecamatanList(filterKecamatan);
			}
		}
	}, [kabupatenSelected]);

	useEffect(() => {
		if (kecamatanSelected) {
			const filterDesa = desa.filter(
				(item) => item.kecamatanId === kecamatanSelected.kecamatanId
			);
			if (filterDesa.length !== 0) {
				setDesaList(filterDesa);
			}
		}
	}, [kecamatanSelected, kabupatenSelected]);

	console.log(loader);

	const submitData = async (e: React.FormEvent<HTMLFormElement>) => {
		submit(e.currentTarget, {
			method: "post",
			action: `/user-data/create`,
		});
	};

	return (
		<div className="">
			<Breadcrumb title="Tambah Data" navigation={navigation} />
			{actionData?.isError && (
				<div
					className="p-4 my-5 text-sm text-red-800 rounded-lg bg-red-50"
					role="alert"
				>
					<span className="font-medium">Error</span> {actionData.message}
				</div>
			)}
			<Form
				method={"post"}
				onSubmit={submitData}
				className="bg-white rounded-xl p-5 sm:p-10"
			>
				<div className="sm:my-6 flex flex-col sm:flex-row gap-5">
					<div className="w-full sm:w-1/2">
						<label className="block mb-2 text-sm font-medium text-gray-900">
							Nama
						</label>
						<input
							name="userName"
							type="text"
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
							required
							placeholder="nama..."
						/>
					</div>
					<div className="w-full sm:w-1/2">
						<label className="block mb-2 text-sm font-medium text-gray-900">
							Nomor Whatsapp
						</label>
						<input
							name="userPhoneNumber"
							type="tel"
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
							required
							placeholder="+6281356657899"
						/>
					</div>
				</div>

				<div className="sm:my-6 flex flex-col sm:flex-row gap-5">
					<div className="w-full sm:w-1/2">
						<div className="my-2">
							<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
								Kabupaten
							</label>

							<select
								onChange={(e) =>
									setKabupatenSelected(JSON.parse(e.target.value))
								}
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							>
								<option>Pilih Kabupaten</option>
								{kabupatenList.map((item: IKabupatenModel, index) => (
									<option key={index} value={JSON.stringify(item)}>
										{item.kabupatenName}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="w-full sm:w-1/2">
						<div className="my-2">
							<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
								Kecamatan
							</label>
							<select
								onChange={(e) =>
									setKecamatanSelected(JSON.parse(e.target.value))
								}
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							>
								<option>Pilih Kecamatan</option>
								{kecamatanList.map((item, index) => (
									<option key={index} value={JSON.stringify(item)}>
										{item.kecamatanName}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div className="sm:my-6 flex flex-col sm:flex-row gap-5">
					<div className="w-full sm:w-1/2">
						<div className="my-2">
							<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
								Desa
							</label>
							<select
								onChange={(e) =>
									setDesaSelected(JSON.parse(e.target.value))
								}
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							>
								<option>Pilih Desa</option>
								{desaList.map((item) => (
									<option
										key={item.desaId}
										value={JSON.stringify(item)}
									>
										{item.desaName}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="w-full sm:w-1/2">
						<div className="my-2">
							<label className="block mb-2 text-sm font-medium text-gray-900">
								Alamat
							</label>
							<textarea
								name="userDetailAddress"
								className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Jl. Hadi subroto ....."
								required
							/>
						</div>
					</div>
				</div>

				<input hidden name="userDesa" value={desaSelected?.desaName} />
				<input
					hidden
					name="userKecamatan"
					value={kecamatanSelected?.kecamatanName}
				/>
				<input
					hidden
					name="userKabupaten"
					value={kabupatenSelected?.kabupatenName}
				/>

				<div className="flex justify-end mt-4">
					<button
						type="submit"
						className="inline-flex justify-center w-32 rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
					>
						{transition?.submission ? "Loading..." : "Submit"}
					</button>
				</div>
			</Form>
		</div>
	);
}
