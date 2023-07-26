import { useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { API } from "~/services/api";
import { checkSession } from "~/services/session";
import { Breadcrumb } from "~/components/breadcrumb";
import { CONFIG } from "~/config";
import { IUserModel } from "~/models/userModel";

export let loader: LoaderFunction = async ({ request, params }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const result = await API.get(
			session,
			CONFIG.base_url_api + `/users/detail/${params.userId}`
		);
		return {
			user: result,
			session: session,
			isError: false,
		};
	} catch (error: any) {
		console.log(error);
		return { ...error, isError: true };
	}
};

export default function Index() {
	const navigation = [{ title: "data pemilu", href: "", active: true }];
	const loader = useLoaderData();
	const detailUser: IUserModel = loader.user;

	console.log(loader);
	if (loader.isError) {
		return (
			<h1 className="text-center font-bold text-3xl text-red-600">
				{loader.error?.messsage || "error"}
			</h1>
		);
	}

	return (
		<div className="">
			<Breadcrumb title="Tambah Data" navigation={navigation} />

			<div className="ml-0 md:ml-4 mt-4 md:mt-0 bg-white rounded-xl p-5 sm:p-10 w-full">
				<div className="flex gap-5 items-center my-5">
					<h3 className="text-lg font-semibold">Nama : </h3>
					<p className="text-gray-800">{detailUser.userName}</p>
				</div>
				<div className="flex gap-5 items-center my-5">
					<h3 className="text-lg font-semibold">Nomor Whatsapp : </h3>
					<p className="text-gray-800">{detailUser.userPhoneNumber}</p>
				</div>
				<div className="flex gap-5 items-center my-5 w-full">
					<h3 className="text-lg font-semibold">Alamat : </h3>
					<p className="text-gray-800">{detailUser.userDetailAddress}</p>
				</div>
				<div className="flex gap-5 items-center my-5">
					<h3 className="text-lg font-semibold">Desa : </h3>
					<p className="text-gray-800">{detailUser.userDesa}</p>
				</div>
				<div className="flex gap-5 items-center my-5">
					<h3 className="text-lg font-semibold">Kecamatan : </h3>
					<p className="text-gray-800">{detailUser.userKecamatan}</p>
				</div>
				<div className="flex gap-5 items-center my-5">
					<h3 className="text-lg font-semibold">Kabupaten : </h3>
					<p className="text-gray-800">{detailUser.userKabupaten}</p>
				</div>
			</div>
		</div>
	);
}
