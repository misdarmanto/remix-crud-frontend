export interface IDesaModel {
  desaId: string
  desaName: string
  kecamatanId: string
  kabupatenId: string
  provinceId: string
}

export interface IKecamatanModel {
  kecamatanId: string
  kecamatanName: string
  kabupatenId: string
  provinceId: string
}

export interface IKabupatenModel {
  kabupatenId: string
  kabupatenName: string
  provinceId: string
}

export interface ICreateRegionRequest {
  desaName: string
  desaId: string
  kecamatanId: string
  kabupatenId: string
  provinceId: string
}
