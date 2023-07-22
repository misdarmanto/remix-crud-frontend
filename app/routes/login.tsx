import { useActionData, useTransition } from "@remix-run/react";
import { ActionFunction, redirect } from "@remix-run/node";
import Login from "~/components/Login";
import invariant from "tiny-invariant";
import { API } from "~/services/api";
import { CONFIG } from "~/config";
import { createSession } from "~/services/session";

export let action: ActionFunction = async ({ request }) => {
	let formData = await request.formData();

	let email = formData.get("email");
	let password = formData.get("password");

	let errors: any = {};
	if (!email) errors.email = true;
	if (!password) errors.password = true;

	if (Object.keys(errors).length) {
		return { errors };
	}

	invariant(typeof email === "string");
	invariant(typeof password === "string");

	try {
		let data = await API.post(request, `${CONFIG.base_url_api.user}/user/login`, {
			account: email,
			password: password,
		});
		if (data.data.user.role !== "seller") {
			errors.message = "akun anda belum terdaftar sebagai seller. silah hubungi admin! ";
			return { errors };
		}
		return createSession(data, "/");
	} catch (err: any) {
		console.log(errors);
		errors.message = err.message;
		return { errors };
	}
};

export default function LoginPage() {
	let errors = useActionData();
	let transition = useTransition();
	const actionData = useActionData();
	console.log(actionData);

	return (
		<>
			<Login errors={errors} transition={transition} />
		</>
	);
}
