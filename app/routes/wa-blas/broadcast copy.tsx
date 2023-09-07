import {
	Form,
	useActionData,
	useLoaderData,
	useSubmit,
	useTransition,
} from "@remix-run/react";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { Breadcrumb } from "~/components/breadcrumb";
import { checkSession } from "~/services/session";
import { API } from "~/services/api";
import { CONFIG } from "~/config";
import { IWaBlasSettings } from "~/models/waBlas";
import { ISessionModel } from "~/models/sessionModel";
import { Modal } from "~/components/Modal";
import { useEffect, useState } from "react";
import { IKabupatenModel, IKecamatanModel } from "~/models/regionModel";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const waBlasSettings = await API.get(
			session,
			`${CONFIG.base_url_api}/wa-blas/settings`
		);
		const kabupaten = await API.get(
			session,
			CONFIG.base_url_api + `/region/kabupaten`
		);
		const kecamatan = await API.get(
			session,
			CONFIG.base_url_api + `/region/kecamatan?kabupatenId=11`
		);

		return {
			session: session,
			kabupaten,
			kecamatan,
			waBlasSettings: waBlasSettings || "",
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
		if (request.method == "POST") {
			const payload: any = {
				whatsAppMessage: formData.get("whatsAppMessage"),
			};

			await API.post(
				session,
				CONFIG.base_url_api + "/wa-blas/send-message",
				payload
			);
		}
		return { isError: false, request };
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

	const waBlasSettings: IWaBlasSettings = loader?.waBlasSettings;
	const navigation = [{ title: "Broadcast Pesan", href: "", active: true }];
	const action = useActionData();
	const submit = useSubmit();
	const transition = useTransition();
	const [openModal, setOpenModal] = useState(false);
	const [defaultMessage, setDefaultMessage] = useState("");

	const submitData = async (e: React.FormEvent<HTMLFormElement>) => {
		submit(e.currentTarget, {
			method: "patch",
			action: `/wa-blas/broadcast`,
		});
	};

	useEffect(() => {
		setDefaultMessage(waBlasSettings.waBlasSettingsMessage);
	}, []);

	return (
		<div>
			<Breadcrumb title="Wa Blas" navigation={navigation} />

			<Modal
				open={openModal}
				setOpen={() => {
					setOpenModal(false);
				}}
			>
				<Form method={"post"} onSubmit={submitData}>
					<input hidden name="whatsAppMessage" value={defaultMessage} />
					Apakah anda yakin ingin membroadcast pesan ini?
					<div className="flex flex-col md:flex-row mt-4">
						<button
							type="submit"
							onClick={() => setOpenModal(false)}
							className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
						>
							{transition?.submission ? "Sending..." : "Send"}
						</button>
						<button
							type="button"
							className="inline-flex ml-0 md:ml-2 justify-center w-full rounded-md border border-gray shadow-sm px-4 py-2 bg-white text-base font-medium text-gray hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray sm:text-sm"
							onClick={() => {
								setOpenModal(false);
							}}
						>
							Batalkan
						</button>
					</div>
				</Form>
			</Modal>
			<div className="w-full md:mr-2">
				<div className="mt-1">
					<textarea
						className={`min-h-[20rem] resize-y w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
						defaultValue={defaultMessage}
						onInvalid={(e) =>
							e.currentTarget.setCustomValidity("wajib diisi")
						}
						onInput={(e) => e.currentTarget.setCustomValidity("")}
						placeholder="Pesan"
						required={true}
						rows={4}
						style={{ resize: "vertical" }}
					/>
				</div>
			</div>

			<div className="flex justify-end mt-4">
				<button
					onClick={() => setOpenModal(!openModal)}
					className="inline-flex justify-center w-32 rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
				>
					Kirim Pesan
				</button>
			</div>
		</div>
	);
}
