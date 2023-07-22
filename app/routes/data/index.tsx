import { ReactElement, useEffect, useState } from "react";
import { Form, useLoaderData, useSubmit, useTransition, Link } from "@remix-run/react";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { Table, TableHeader } from "~/components/Table";
import { CONFIG } from "~/config";
import { CONSOLE } from "~/utilities/log";
import { Modal } from "~/components/Modal";
import { classNames } from "~/utilities";
import { Breadcrumb } from "~/components/breadcrumb";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");

	let url = new URL(request.url);
	let search = url.searchParams.get("search") || "";
	let status = url.searchParams.get("status") || "";
	let size = url.searchParams.get("size") || 10;
	let page = url.searchParams.get("page") || 0;
	let franchiseId = url.searchParams.get("franchise_id") || "";
	let categoryId = url.searchParams.get("category_id") || "";
	let creatorId = url.searchParams.get("creator_id") || "";

	try {
		const result = await API.getTableData({
			session: session,
			url: CONFIG.base_url_api.product + "/admin/product/list",
			pagination: true,
			page: +page || 0,
			size: +size || 10,
			filters: {
				search: search || "",
				bank_id: 1,
				status: status,
				franchise_id: franchiseId,
				category_id: categoryId,
				creator_id: creatorId,
			},
		});
		return {
			table: {
				link: "product",
				data: result,
				page: page,
				size: size,
				filter: {
					search: search,
				},
			},
			session: session,
			asset: {
				url: `${CONFIG.base_url_api.asset}/upload`,
				auth: {
					username: CONFIG.asset.authorization.username,
					password: CONFIG.asset.authorization.passsword,
				},
			},
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
				CONFIG.base_url_api.product + `/admin/product?id=${formData.get("id")}`
			);
		}
		return reponse.data;
	} catch (error: any) {
		return { ...error, isError: true };
	}
};

export default function Index(): ReactElement {
	const navigation = [{ title: "Produk", href: "", active: true }];
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

	const [tabs, setTabs] = useState<any[]>([]);

	useEffect(() => {
		setMobileActionDropdown(null);
	}, []);

	const header: TableHeader[] = [
		{
			title: "Foto",
			data: (data: any, index: number): ReactElement => (
				<td key={index + "-photo"} className="md:px-6 md:py-3 w-auto md:w-2/12 mb-4 md:mb-0 ">
					<img src={data.thumbnail} className="object-cover rounded" />
				</td>
			),
		},
		{
			title: "Nama",
			data: (data: any, index: number): ReactElement => (
				<td key={index + "name"} className="md:px-2 md:py-3">
					{data.name}
				</td>
			),
		},
		{
			title: "Kategori",
			data: (data: any, index: number): ReactElement => (
				<td key={index + "category"} className="md:px-2 md:py-3">
					{data.category_name}
				</td>
			),
		},
		{
			title: "Status",
			data: (data: any, index: number): ReactElement => (
				<>
					{data.variants.length === 0 && (
						<td key={index + "status"} className="md:px-2 md:py-3">
							<span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
								lengkapi data varian!
							</span>
						</td>
					)}
					{data.variants.length !== 0 && data.status_confirmation === "review" && (
						<td key={index + "status"} className="md:px-2 md:py-3">
							<span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
								review
							</span>
						</td>
					)}

					{data.variants.length !== 0 && data.status_confirmation === "accepted" && (
						<td key={index + "status"} className="md:px-2 md:py-3">
							<span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
								publish
							</span>
						</td>
					)}

					{data.variants.length !== 0 && data.status_confirmation === "rejected" && (
						<td key={index + "status"} className="md:px-2 md:py-3">
							<span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
								{data.status_confirmation}
							</span>
						</td>
					)}
				</>
			),
		},

		{
			title: "Total Varian",
			data: (data: any, index: number): ReactElement => (
				<td key={index} className="md:px-6 md:py-3 text-sm break-all">
					{data.variants?.length + ""}
				</td>
			),
		},

		{
			title: "Aksi",
			action: true,
			data: (data: any, index: number): ReactElement => (
				<td key={index + "action"} className="md:px-2 md:py-3">
					{/* Desktop only  */}
					<div className="hidden md:block w-64">
						<button
							onClick={() => {
								setModalData(data);
								setModalDelete(true);
							}}
							className="bg-transparent m-1 hover:bg-red-500 text-red-700 hover:text-white py-1 px-2 border border-red-500 hover:border-transparent rounded"
						>
							Hapus
						</button>
						&nbsp;
						<Link to={`/product/edit/${data.id}/info`}>
							<button className="bg-transparent  m-1 hover:bg-teal-500 text-teal-700 hover:text-white py-1 px-2 border border-teal-500 hover:border-transparent rounded">
								Edit
							</button>
						</Link>
						&nbsp;
						<Link to={`/product/detail/${data.id}/info`}>
							<button className="bg-transparent  m-1 hover:bg-teal-500 text-teal-700 hover:text-white py-1 px-2 border border-teal-500 hover:border-transparent rounded">
								Lihat
							</button>
						</Link>
					</div>
					{/* Mobile only  */}
					<div className="block md:hidden relative">
						<button
							id={`dropdownButton-${index}`}
							onClick={() => {
								if (index == mobileActionDropDown) {
									setMobileActionDropdown(null);
								} else {
									setMobileActionDropdown(index);
								}
							}}
							data-dropdown-toggle={`dropdown-${index}`}
							type="button"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
								/>
							</svg>
						</button>
						<div
							id={`dropdown-${index}`}
							className={`${
								mobileActionDropDown == index ? "absolute right-0" : "hidden"
							} z-10 w-44 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-white`}
						>
							<ul className="py-1" aria-labelledby={`dropdownButton-${index}`}>
								<li>
									<Link
										to={`/product/detail/${data.id}/info`}
										className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-800 dark:hover:text-white"
									>
										Lihat
									</Link>
								</li>
								<li>
									<button
										onClick={() => {
											setModalData(data);
											setModalDelete(true);
										}}
										className="block w-full text-left py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-800 dark:hover:text-white"
									>
										Hapus
									</button>
								</li>
							</ul>
						</div>
					</div>
				</td>
			),
		},
	];

	const [modalDelete, setModalDelete] = useState(false);
	const [modalData, setModalData] = useState<any>();
	const submitDeleteData = async (e: React.FormEvent<HTMLFormElement>) => {
		submit(e.currentTarget, { method: "delete", action: `/product` });
		setModalDelete(false);
	};

	return (
		<div className="">
			<Breadcrumb title="Produk" navigation={navigation} />

			<div className="border-gray-200">
				<nav className="-mb-px flex space-x-8" aria-label="Tabs">
					{tabs.map(
						(tab, i): ReactElement => (
							<Link to={tab.href} className={tab.current && "pointer-events-none"}>
								<button
									key={i}
									className={classNames(
										tab.current
											? "border-green-500 text-green-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
										"whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
									)}
									aria-current={tab.current ? "page" : undefined}
								>
									{tab.name}
								</button>
							</Link>
						)
					)}
				</nav>
			</div>

			<Form
				onChange={(e: any) => submit(e.currentTarget, { action: `/${loader?.table?.link}` })}
				method="get"
			>
				<div className="flex flex-col md:flex-row justify-between mb-2 md:px-0">
					<div className="mt-1 w-full flex flex-row justify-between md:justify-start">
						<select
							name="size"
							defaultValue={loader?.table?.size}
							className="block w-16 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
						>
							<option value="2">2</option>
							<option value="5">5</option>
							<option value="10">10</option>
							<option value="50">50</option>
							<option value="100">100</option>
						</select>
						&nbsp;
						<Link to={`create`}>
							<button
								type="button"
								className="bg-transparent hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-2 px-4 border border-teal-500 hover:border-transparent rounded"
							>
								Tambah Produk
							</button>
						</Link>
					</div>
					<div className="mt-1 w-full md:w-1/5">
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

			<Modal
				open={modalDelete}
				setOpen={() => {
					setModalDelete(false);
				}}
			>
				<Form method="delete" onSubmit={submitDeleteData}>
					<input className="hidden" name="id" value={modalData?.id}></input>
					Anda yakin akan menghapus produk <strong>{modalData?.name}</strong>
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
