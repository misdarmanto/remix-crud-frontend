export const CONFIG = {
	env: process.env.NODE_ENV || "development",
	authorization: {
		username: process.env.AUTHORIZATION_USERNAME || "sigmentasi",
		passsword: process.env.AUTHORIZATION_PASSWORD || "S!gm3nt4s12022!",
	},
	asset: {
		authorization: {
			username: process.env.AUTHORIZATION_ASSET_USERNAME || "sigmentasi_assets",
			passsword: process.env.AUTHORIZATION_ASSET_PASSWORD || "sigmentasi_assets",
		},
	},
	session: {
		secret: process.env.SESSION_SECRET || "sigmentasi-session-secret",
		name: process.env.SESSION_NAME || "sigmentasi-session",
	},
	base_url_api: "http://localhost:6005",
};
