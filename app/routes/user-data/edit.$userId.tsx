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
import { IRelawanModel, IUserCreateRequestModel, IUserModel } from "~/models/userModel";
import { useEffect, useState } from "react";
import { IDesaModel, IKabupatenModel, IKecamatanModel } from "~/models/regionModel";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const result = await API.get(
			session,
			CONFIG.base_url_api + `/users/detail/${params.userId}`
		);

		const kabupaten = await API.get(
			session,
			CONFIG.base_url_api + `/region/kabupaten`
		);
		const kecamatan = await API.get(
			session,
			CONFIG.base_url_api + `/region/kecamatan?kabupatenId=11`
		);

		const desa = await API.get(
			session,
			CONFIG.base_url_api + `/region/desa?kecamatanId=1111`
		);

		const relawanTim = await API.get(
			session,
			CONFIG.base_url_api + `/relawan-tim/all`
		);

		return {
			user: result,
			relawanTim,
			kabupaten,
			kecamatan,
			desa,
			session: session,
			isError: false,
		};
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

export let action: ActionFunction = async ({ request }) => {
	const session: ISessionModel | any = await checkSession(request);
	if (!session) return redirect("/login");

	let formData = await request.formData();
	try {
		let result: any = null;
		if (request.method === "PATCH") {
			const payload: IUserCreateRequestModel | any = {
				userId: formData.get("userId"),
				userName: formData.get("userName"),
				userPhoneNumber: formData.get("userPhoneNumber"),
				userDetailAddress: formData.get("userDetailAddress"),
				userDesa: formData.get("userDesa"),
				userDesaId: formData.get("userDesaId"),
				userKecamatan: formData.get("userKecamatan"),
				userKecamatanId: formData.get("userKecamatanId"),
				userKabupaten: formData.get("userKabupaten"),
				userKabupatenId: formData.get("userKabupatenId"),
				userRelawanTimName: formData.get("userRelawanTimName"),
				userRelawanName: formData.get("userRelawanName"),
			};

			console.log(payload);
			result = await API.patch(session, CONFIG.base_url_api + "/users", payload);

			return redirect("/user-data");
		}
		return { isError: false, result };
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
	const detailUser: IUserModel = loader.user;

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

	const [relawanTim, setRelawanTim] = useState<IRelawanModel[]>([]);
	const [relawanTimNameSelected, setRelawanTimNameSelected] = useState<string>("");

	useEffect(() => {
		const filterKecamatan = kecamatan.filter((item) => item.kabupatenId === "11");
		setKabupatenList(kabupaten);
		setKecamatanList(filterKecamatan);
		setDesaList(desa);
		setRelawanTim(loader.relawanTim);
		setRelawanTimNameSelected(detailUser.userRelawanTimName);
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

	useEffect(() => {
		const findDesa = desa.find((item) => item.desaName === loader.user.userDesa);
		const findKecamatan = kecamatan.find(
			(item) => item.kecamatanName === loader.user.userKecamatan
		);
		const findKabupaten = kabupaten.find(
			(item) => item.kabupatenName === loader.user.userKabupaten
		);

		setDesaSelected(findDesa);
		setKecamatanSelected(findKecamatan);
		setKabupatenSelected(findKabupaten);
	}, []);

	const submitData = async (e: React.FormEvent<HTMLFormElement>) => {
		submit(e.currentTarget, {
			method: "patch",
			action: `/user-data/edit/${detailUser.userId}`,
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
				method={"patch"}
				onSubmit={submitData}
				className="bg-white rounded-xl p-5 sm:p-10"
			>
				<input hidden name="userId" value={detailUser.userId} />
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
							defaultValue={detailUser.userName}
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
							defaultValue={detailUser.userPhoneNumber}
						/>
					</div>
				</div>

				<div className="sm:my-6 flex flex-col sm:flex-row gap-5">
					<div className="w-full sm:w-1/2">
						<div className="my-2">
							<label className="block mb-2 text-sm font-medium text-gray-900">
								Kabupaten
							</label>
							<select
								onChange={(e) =>
									setKabupatenSelected(JSON.parse(e.target.value))
								}
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							>
								<option value={JSON.stringify(kabupatenSelected)}>
									{kabupatenSelected?.kabupatenName}
								</option>
								{kabupatenList.map((item, index) => (
									<option key={index} value={JSON.stringify(item)}>
										{item.kabupatenName}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="w-full sm:w-1/2">
						<div className="my-2">
							<label className="block mb-2 text-sm font-medium text-gray-900">
								Kecamatan
							</label>
							<select
								onChange={(e) =>
									setKecamatanSelected(JSON.parse(e.target.value))
								}
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							>
								<option value={JSON.stringify(kecamatanSelected)}>
									{kecamatanSelected?.kecamatanName}
								</option>
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
							<label className="block mb-2 text-sm font-medium text-gray-900">
								Desa
							</label>
							<select
								onChange={(e) =>
									setDesaSelected(JSON.parse(e.target.value))
								}
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							>
								<option value={JSON.stringify(desaSelected)}>
									{desaSelected?.desaName}
								</option>
								{desaList.map((item, index) => (
									<option key={index} value={JSON.stringify(item)}>
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
								defaultValue={detailUser.userDetailAddress}
								required
							/>
						</div>
					</div>
				</div>

				<div className="sm:my-6 flex flex-col sm:flex-row gap-5">
					<div className="w-full sm:w-1/2">
						<div className="my-2">
							<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
								Tim Relawan (optional)
							</label>
							<select
								onChange={(e) =>
									setRelawanTimNameSelected(e.target.value)
								}
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							>
								<option value={detailUser.userRelawanTimName}>
									{detailUser.userRelawanTimName}
								</option>
								{relawanTim.map((item: IRelawanModel, index: number) => (
									<option key={index} value={item.relawanTimName}>
										{item.relawanTimName}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="w-full sm:w-1/2">
						<div className="my-2">
							<label className="block mb-2 text-sm font-medium text-gray-900">
								Nama Relawan (optional)
							</label>
							<input
								name="userRelawanName"
								type="text"
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
								placeholder="nama..."
								defaultValue={detailUser.userRelawanName}
							/>
						</div>
					</div>
				</div>

				<input hidden name="userRelawanTimName" value={relawanTimNameSelected} />

				<input hidden name="userDesa" value={desaSelected?.desaName} />
				<input hidden name="userDesaId" value={desaSelected?.desaId} />
				<input
					hidden
					name="userKecamatan"
					value={kecamatanSelected?.kecamatanName}
				/>
				<input
					hidden
					name="userKecamatanId"
					value={kecamatanSelected?.kecamatanId}
				/>
				<input
					hidden
					name="userKabupaten"
					value={kabupatenSelected?.kabupatenName}
				/>
				<input
					hidden
					name="userKabupatenId"
					value={kabupatenSelected?.kabupatenId}
				/>

				<div className="flex justify-end mt-4">
					<button
						type="submit"
						className="inline-flex justify-center w-32 rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
					>
						{transition?.submission ? "Loading..." : "Update"}
					</button>
				</div>
			</Form>
		</div>
	);
}
