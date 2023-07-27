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
	createdOn: string;
}

export interface IUserCreateRequestModel {
	userId: string;
	userName: string;
	userDetailAddress: string;
	userDesa: string;
	userDesaId: string;
	userKecamatan: string;
	userKecamatanId: string;
	userKabupaten: string;
	userKabupatenId: string;
	userPhoneNumber: string;
}

export interface IUserUpdateRequestModel {
	userId?: string;
	userName?: string;
	userDetailAddress?: string;
	userDesa?: string;
	userDesaId?: string;
	userKecamatan?: string;
	userKecamatanId?: string;
	userKabupaten?: string;
	userKabupatenId?: string;
	userPhoneNumber?: string;
}
