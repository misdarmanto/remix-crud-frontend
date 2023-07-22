import { ShareFeeModel } from "./fee";

export interface ProductTypes {
	id: number;
	name: string;
	description: string;
	franchise_id: string;
	creator_id: number;
	creator_name: string;
	category_id: number;
	address_id: number;
	supply_month: number;
	category_name: string;
	thumbnail: string | null;
	video: string;
	status: "active" | "inactive";
	status_confirmation: "review" | "rejected" | "accepted";
	status_confirmation_message: string;
	prerequisite: string;
	platform_fee: string;
	sharing_fee: ShareFeeModel;
}
