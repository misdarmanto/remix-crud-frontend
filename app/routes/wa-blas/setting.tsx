import {
	Form,
	Link,
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
import { useState } from "react";

export let loader: LoaderFunction = async ({ params, request }) => {
	const session: any = await checkSession(request);
	if (!session) return redirect("/login");
	try {
		const waBlasSettings = await API.get(
			session,
			`${CONFIG.base_url_api}/wa-blas/settings`
		);

		return {
			session: session,
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
		if (request.method == "PATCH") {
			const payload: IWaBlasSettings | any = {
				waBlasSettingsMessage: formData.get("waBlasSettingsMessage"),
			};

			await API.patch(session, CONFIG.base_url_api + "/wa-blas/settings", payload);

			return redirect("/wa-blas/setting");
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
	const navigation = [{ title: "Setting", href: "", active: true }];
	const action = useActionData();
	const submit = useSubmit();
	const transition = useTransition();

	const submitData = async (e: React.FormEvent<HTMLFormElement>) => {
		submit(e.currentTarget, {
			method: "patch",
			action: `/wa-blas/settings`,
		});
	};

	return (
		<div>
			<Breadcrumb title="Wa Blas" navigation={navigation} />
			{/* <div
				className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50"
				role="alert"
			>
				<span className="font-medium">Info alert!</span> Change a few things up
				and try submitting again.
			</div> */}
			<Form method={"patch"} onSubmit={submitData}>
				<div className="w-full md:mr-2">
					<div className="mt-1">
						<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
							pesan default
						</label>
						<textarea
							className={`min-h-[20rem] resize-y w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
							name="waBlasSettingsMessage"
							defaultValue={waBlasSettings.waBlasSettingsMessage || "..."}
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
						type="submit"
						className="inline-flex justify-center w-32 rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
					>
						{transition?.submission ? "Menyimpan..." : "Submit"}
					</button>
				</div>
			</Form>
		</div>
	);
}
