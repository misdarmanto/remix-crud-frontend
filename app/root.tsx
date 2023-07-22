import {
	useLoaderData,
	Meta,
	Links,
	useLocation,
	Outlet,
	Scripts,
	ScrollRestoration,
	LiveReload,
} from "@remix-run/react";
import { LoaderFunction, LinksFunction, MetaFunction } from "@remix-run/node";

import rootStyles from "~/styles/tailwind.css";
import globalStyle from "~/styles/global.css";
import Layout from "./layouts";
import { checkSession } from "./services/session";
import { CONSOLE } from "./utilities/log";

export const links: LinksFunction = () => {
	return [
		{
			rel: "icon",
			href: "https://asset.lenterailmu.id?dir=resources/icon/play_store_512.png",
			type: "image/png",
		},
		{ rel: "stylesheet", href: rootStyles },
		{ rel: "stylesheet", href: globalStyle },
	];
};

export const meta: MetaFunction = () => {
	return { title: "Data Pemilu" };
};

export let loader: LoaderFunction = async ({
	params,
	request,
}: {
	params: any;
	request: any;
}) => {
	const session: any = await checkSession(request);
	console.log(session);
	try {
		return {
			session: session,
		};
	} catch (error) {
		CONSOLE.log(error);
		return { error_message: "error_message" };
	}
};

export default function App() {
	let location = useLocation();
	const loader = useLoaderData();
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="bg-gray-200">
				{!location.pathname.includes("login") ? (
					<Layout session={loader.session}>
						<Outlet />
						<ScrollRestoration />
						<Scripts />
						<LiveReload />
					</Layout>
				) : (
					<>
						<Outlet />
						<ScrollRestoration />
						<Scripts />
						<LiveReload />
					</>
				)}
			</body>
		</html>
	);
}
