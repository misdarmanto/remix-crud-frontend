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
			url: CONFIG.base_url_api + "/statistic/users",
			pagination: true,
			page: +page || 0,
			size: +size || 10,
			filters: {
				desaId: params.desaId,
				search: search || "",
			},
		});
		return {
			table: {
				link: `user/${params.desaId}`,
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
	const [mobileActionDropDown, setMobileActionDropdown] = useState<number | null>();

	const actionData = useActionData();
	const session: ISessionModel = loader.session;

	const navigation = [{ title: "data pemilu", href: "", active: true }];

	useEffect(() => {
		setMobileActionDropdown(null);
	}, []);

	const download = async () => {
		try {
			const result = await axios.get(
				`${loader.API.baseUrl}/users/list?pagination=false`,
				{
					auth: {
						username: loader.API.authorization.username,
						password: loader.API.authorization.password,
					},
				}
			);

			let xlsRows: any[] = [];
			await result.data.data.items.map((value: IUserModel, index: number) => {
				let documentItem = {
					userName: value.userName,
					userPhoneNumber: value.userPhoneNumber,
					userDetailAddress: value.userDetailAddress,
					userDesa: value.userDesa,
					userKecamatan: value.userKecamatan,
					userKabupaten: value.userKabupaten,
					createdOn: value.createdOn,
				};
				xlsRows.push(documentItem);
			});

			let xlsHeader = [
				"Nama",
				"WA",
				"Alamat",
				"Desa",
				"Kecamatan",
				"Kabupaten",
				"Tgl Dibuat",
			];
			let createXLSLFormatObj = [];
			createXLSLFormatObj.push(xlsHeader);
			xlsRows.map((value: IUserModel, i) => {
				let innerRowData = [];
				innerRowData.push(value.userName);
				innerRowData.push(value.userPhoneNumber);
				innerRowData.push(value.userDetailAddress);
				innerRowData.push(value.userDesa);
				innerRowData.push(value.userKecamatan);
				innerRowData.push(value.userKabupaten);
				innerRowData.push(value.createdOn);
				createXLSLFormatObj.push(innerRowData);
			});

			/* File Name */
			let filename = `Data Pengguna ${moment().format("DD-MM-YYYY")}.xlsx`;

			/* Sheet Name */
			let ws_name = "Sheet1";
			if (typeof console !== "undefined") console.log(new Date());
			let wb = XLSX.utils.book_new(),
				ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);

			XLSX.utils.book_append_sheet(wb, ws, ws_name);
			XLSX.writeFile(wb, filename);
		} catch (error) {
			console.log(error);
		}
	};

	const header: TableHeader[] = [
		{
			title: "No",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "-photo"} className="md:px-6 md:py-3 mb-4 md:mb-0">
					{index + 1}
				</td>
			),
		},
		{
			title: "Nama",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "userName"} className="md:px-6 md:py-3 ">
					{data.userName}
				</td>
			),
		},
		{
			title: "WA",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "wa"} className="md:px-6 md:py-3">
					{data.userPhoneNumber}
				</td>
			),
		},
		{
			title: "alamat",
			data: (data: IUserModel, index: number): ReactElement => (
				<td key={index + "program-name"} className="md:px-6 md:py-3 break-all">
					{data.userDetailAddress.length > 10
						? data.userDetailAddress.slice(0, 10) + "....."
						: data.userDetailAddress}
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
	];

	return (
		<div className="">
			<Breadcrumb title="Data Pemilu" navigation={navigation} />
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
						&nbsp;
						{session.adminRole === "superAdmin" && (
							<button
								type="button"
								onClick={download}
								className="bg-transparent hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-2 px-4 border border-teal-500 hover:border-transparent rounded"
							>
								Export
							</button>
						)}
					</div>
					<div className="w-full  md:w-1/5">
						<input
							defaultValue={loader?.table?.filter.search}
							name="search"
							className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
							placeholder="Cari data"
							type="text"
						/>
					</div>
				</div>
			</Form>

			<Table header={header} table={loader.table} />
		</div>
	);
}
