import { ReactElement, useEffect, useState } from "react";
import {
	Form,
	useLoaderData,
	useSubmit,
	useTransition,
	Link,
	useActionData,
} from "@remix-run/react";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { Table, TableHeader } from "~/components/Table";
import { CONFIG } from "~/config";
import { CONSOLE } from "~/utilities/log";
import { Modal } from "~/components/Modal";
import { Breadcrumb } from "~/components/breadcrumb";
import { IUserModel } from "~/models/userModel";
import { ISessionModel } from "~/models/sessionModel";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import { convertTime } from "~/utilities/convertTime";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");

	let url = new URL(request.url);
	let search = url.searchParams.get("search") || "";
	let size = url.searchParams.get("size") || 10;
	let page = url.searchParams.get("page") || 0;

	try {
		const result = await API.getTableData({
			session: session,
			url: CONFIG.base_url_api + "/users/list",
			pagination: true,
			page: +page || 0,
			size: +size || 10,
			filters: {
				search: search || "",
			},
		});
		return {
			table: {
				link: "/wa-blas/broadcast",
				data: result,
				page: page,
				size: size,
				filter: {
					search: search,
				},
			},
			API: {
				baseUrl: CONFIG.base_url_api,
				authorization: {
					username: CONFIG.authorization.username,
					password: CONFIG.authorization.passsword,
				},
			},
			session: session,
			isError: false,
		};
	} catch (error: any) {
		CONSOLE.log(error);
		return { ...error, isError: true };
	}
};

export let action: ActionFunction = async ({ request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");

	let formData = await request.formData();

	try {
		let reponse = null;
		if (request.method == "DELETE") {
			reponse = await API.delete(
				session,
				CONFIG.base_url_api + `/users?userId=${formData.get("userId")}`
			);

			console.log(reponse);
		}
		return { ...reponse.data, isError: false };
	} catch (error: any) {
		return { ...error, isError: true };
	}
};

export default function Index(): ReactElement {
	const loader = useLoaderData();

	console.log(loader);
	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-xl text-red-600">
				{loader.message || `Error ${loader.code || ""}!`}
			</h1>
		);
	}

	const submit = useSubmit();
	const transition = useTransition();
	const [mobileActionDropDown, setMobileActionDropdown] = useState<number | null>();

	const [modalDelete, setModalDelete] = useState(false);
	const [modalData, setModalData] = useState<IUserModel>();

	const actionData = useActionData();
	const session: ISessionModel = loader.session;

	const submitDeleteData = async (e: React.FormEvent<HTMLFormElement>) => {
		submit(e.currentTarget, { method: "delete", action: `/user-data` });
		setModalDelete(false);
	};

	const navigation = [{ title: "broadcast", href: "", active: true }];

	useEffect(() => {
		setMobileActionDropdown(null);
	}, []);

	const header: TableHeader[] = [
		{
			title: "Nama",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "userName"} className="md:px-6 md:py-3 ">
					{data.userName}
				</td>
			),
		},
		{
			title: "Desa",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "desa"} className="md:px-6 md:py-3">
					{data.userDesa}
				</td>
			),
		},
		{
			title: "Kecamatan",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "kecamatan"} className="md:px-6 md:py-3">
					{data.userKecamatan}
				</td>
			),
		},
		{
			title: "Kabupaten",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "kabupaten"} className="md:px-6 md:py-3">
					{data.userKabupaten}
				</td>
			),
		},
		{
			title: "Tim Relawan",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "tim relawan"} className="md:px-6 md:py-3">
					{data.userRelawanTimName || "_"}
				</td>
			),
		},
		{
			title: "Nama Relawan",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "nama relawan"} className="md:px-6 md:py-3">
					{data.userRelawanName || "_"}
				</td>
			),
		},
	];

	return (
		<div className="">
			<Breadcrumb title="Wa Blas" navigation={navigation} />
			{actionData?.isError && (
				<div
					className="p-4 my-5 text-sm text-red-800 rounded-lg bg-red-50"
					role="alert"
				>
					<span className="font-medium">Error</span> {actionData.message}
				</div>
			)}

			<Form
				onChange={(e: any) =>
					submit(e.currentTarget, { action: `${loader?.table?.link}` })
				}
				method="get"
			>
				<div className="flex flex-col md:flex-row justify-between mb-2 md:px-0">
					<div className="px-1 w-full mb-2 flex flex-row gap-2 justify-between md:justify-start">
						<select
							name="size"
							defaultValue={loader?.table?.size}
							className="block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
						>
							<option value="2">2</option>
							<option value="5">5</option>
							<option value="10">10</option>
							<option value="50">50</option>
							<option value="100">100</option>
						</select>
					</div>
					<div className="flex flex-row w-full gap-5">
						<input
							defaultValue={loader?.table?.filter.search}
							name="search"
							className={`block w-full px-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
							placeholder="Cari data"
							type="text"
						/>

						<button className="hover:bg-teal-500 text-teal-700 hover:text-white px-5 border border-teal-500 hover:border-transparent rounded">
							Send
						</button>
					</div>
				</div>
			</Form>

			<Table header={header} table={loader.table} />

			<Modal
				open={modalDelete}
				setOpen={() => {
					setModalDelete(false);
				}}
			>
				<Form method="delete" onSubmit={submitDeleteData}>
					<input
						className="hidden"
						name="userId"
						value={modalData?.userId}
					></input>
					Apakah anda yakin akan menghapus{" "}
					<strong>{modalData?.userName}</strong>
					<div className="flex flex-col md:flex-row mt-4">
						<button
							type="submit"
							className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
						>
							{transition?.submission ? "Menghapus..." : "Hapus"}
						</button>
						<button
							type="button"
							className="inline-flex ml-0 md:ml-2 justify-center w-full rounded-md border border-gray shadow-sm px-4 py-2 bg-white text-base font-medium text-gray hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray sm:text-sm"
							onClick={() => {
								setModalDelete(false);
							}}
						>
							Batalkan
						</button>
					</div>
				</Form>
			</Modal>
		</div>
	);
}
