export interface IStatisticModel {
	totalKotaPekalongan: number;
	totalKabupatenPemalang: number;
	totalKabupatenPekalongan: number;
	totalKabupatenBatang: number;
}

export interface IStatisticKabupatenModel {
	kabupatenName: string;
	kabupatenId: string;
	totalUser: number;
}

export interface IStatisticKecamatanModel {
	kabupatenId: string;
	kecamatan: string;
	kecamatanId: string;
	totalUser: number;
}

export interface IStatisticDesaModel {
	desa: string;
	desaId: string;
	kabupatenId: string;
	kecamatanId: string;
	totalUser: number;
}
