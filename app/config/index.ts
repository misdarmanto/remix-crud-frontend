export const CONFIG = {
	env: process.env.NODE_ENV || "development",
	authorization: {
		username: process.env.AUTHORIZATION_USERNAME || "d4p1l",
		passsword: process.env.AUTHORIZATION_PASSWORD || "d4p1l2023",
	},
	session: {
		secret: process.env.SESSION_SECRET || "session-secret",
		name: process.env.SESSION_NAME || "session",
	},
	base_url_api: "http://localhost:8000",
};
