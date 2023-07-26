import { IDesaModel, IKabupatenModel, IKecamatanModel } from "./regionModel";
import { IRootModel } from "./rootModel";

export interface IUserModel extends IRootModel {
	userId: string;
	userName: string;
	userDetailAddress: string;
	userDesa: IDesaModel;
	userKecamatan: IKecamatanModel;
	userKabupaten: IKabupatenModel;
	userPhoneNumber: string;
}

export interface IUserCreateRequestModel {
	userName: string;
	userDetailAddress: string;
	userDesa: string;
	userKecamatan: string;
	userKabupaten: string;
	userPhoneNumber: string;
}

export interface IUserUpdateRequestModel {
	userId?: string;
	userName?: string;
	userDetailAddress?: string;
	userDesa?: string;
	userKecamatan?: string;
	userKabupaten?: string;
	userPhoneNumber?: string;
}
