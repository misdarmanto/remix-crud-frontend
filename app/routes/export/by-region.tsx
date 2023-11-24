import { ReactElement, useEffect, useState } from 'react'
import { Form, useLoaderData, useSubmit, useActionData } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/router'
import { API } from '~/services/api'
import { checkSession } from '~/services/session'
import { CONFIG } from '~/config'
import { CONSOLE } from '~/utilities/log'
import { Breadcrumb } from '~/components/breadcrumb'
import { IUserModel } from '~/models/userModel'
import moment from 'moment'
import * as XLSX from 'xlsx'
import { convertTime } from '~/utilities/convertTime'
import { IDesaModel, IKabupatenModel, IKecamatanModel } from '~/models/regionModel'

export let loader: LoaderFunction = async ({ params, request }) => {
  const session: any = await checkSession(request)
  if (!session) return redirect('/login')

  const url = new URL(request.url)
  const search = url.searchParams.get('search') || ''
  const size = url.searchParams.get('size') || 10
  const page = url.searchParams.get('page') || 0
  const desaNameSelected = url.searchParams.get('desaNameSelected') || ''
  const kabupatenNameSelected = url.searchParams.get('kabupatenNameSelected') || ''
  const kecamatanNameSelected = url.searchParams.get('kecamatanNameSelected') || ''

  const kabupaten = await API.get(session, CONFIG.base_url_api + `/region/kabupaten`)
  const kecamatan = await API.get(
    session,
    CONFIG.base_url_api + `/region/kecamatan?kabupatenId=11`
  )
  const desa = await API.get(
    session,
    CONFIG.base_url_api + `/region/desa?kecamatanId=1111`
  )

  try {
    const result = await API.getTableData({
      session: session,
      url: CONFIG.base_url_api + '/users/download',
      pagination: true,
      filters: {
        search: search || '',
        userKabupaten: kabupatenNameSelected || '',
        userKecamatan: kecamatanNameSelected || '',
        userDesa: desaNameSelected || ''
      }
    })
    return {
      table: {
        link: 'export/by-region',
        data: result,
        page: page,
        size: size,
        filter: {
          search: search
        }
      },
      API: {
        baseUrl: CONFIG.base_url_api,
        authorization: {
          username: CONFIG.authorization.username,
          password: CONFIG.authorization.passsword
        }
      },
      session: session,
      isError: false,
      kabupaten,
      kecamatan,
      desa
    }
  } catch (error: any) {
    CONSOLE.log(error)
    return { ...error, isError: true }
  }
}

export default function Index(): ReactElement {
  const loader = useLoaderData()

  console.log(loader)
  if (loader.isError) {
    return (
      <h1 className='text-center font-bold text-xl text-red-600'>
        {loader.message || `Error ${loader.code || ''}!`}
      </h1>
    )
  }

  const actionData = useActionData()
  const submit = useSubmit()
  const navigation = [{ title: 'by wilayah', href: '', active: true }]

  const kabupaten: IKabupatenModel[] = loader.kabupaten
  const kecamatan: IKecamatanModel[] = loader.kecamatan
  const desa: IDesaModel[] = loader.desa

  const [kabupatenList, setKabupatenList] = useState<IKabupatenModel[]>([])
  const [kecamatanList, setKecamatanList] = useState<IKecamatanModel[]>([])
  const [desaList, setDesaList] = useState<IDesaModel[]>([])

  const [kabupatenNameSelected, setKabupatenNameSelected] = useState('')
  const [kecamatanNameSelected, setKecamatanNameSelected] = useState('')
  const [desaNameSelected, setDesaNameSelected] = useState('')

  useEffect(() => {
    const filterKecamatan = kecamatan.filter((item) => item.kabupatenId === '11')
    setKabupatenList(kabupaten)
    setKecamatanList(filterKecamatan)
    setDesaList(desa)
  }, [])

  useEffect(() => {
    if (kabupatenNameSelected) {
      const findKabupaten = kabupaten.find(
        (item) => item.kabupatenName === kabupatenNameSelected
      )
      const filterKecamatan = kecamatan.filter(
        (item) => item.kabupatenId === findKabupaten?.kabupatenId
      )
      if (filterKecamatan.length !== 0) {
        setKecamatanList(filterKecamatan)
      }
    }
  }, [kabupatenNameSelected])

  useEffect(() => {
    if (kecamatanNameSelected) {
      const findKecamatan = kecamatan.find(
        (item) => item.kecamatanName === kecamatanNameSelected
      )
      const filterDesa = desa.filter(
        (item) => item.kecamatanId === findKecamatan?.kecamatanId
      )

      if (filterDesa.length !== 0) {
        setDesaList(filterDesa)
      }
    }
  }, [kecamatanNameSelected, kabupatenNameSelected])

  const download = async () => {
    try {
      let xlsRows: any[] = []
      await loader.table.data.rows.map((value: IUserModel, index: number) => {
        let documentItem = {
          userName: value.userName,
          userPhoneNumber: value.userPhoneNumber,
          userPosition: value.userPosition,
          userDetailAddress: value.userDetailAddress,
          userDesa: value.userDesa,
          userKecamatan: value.userKecamatan,
          userKabupaten: value.userKabupaten,
          userReferrerName: value.userReferrerName,
          userReferrerPosition: value.userReferrerPosition,
          createdOn: convertTime(value.createdOn)
        }
        xlsRows.push(documentItem)
      })

      let xlsHeader = [
        'Nama',
        'WA',
        'jabatan',
        'Alamat',
        'Desa',
        'Kecamatan',
        'Kabupaten',
        'Nama Referrer',
        'Jabatan Referrer',
        'Tgl Dibuat'
      ]
      let createXLSLFormatObj = []
      createXLSLFormatObj.push(xlsHeader)
      xlsRows.map((value: IUserModel, i) => {
        let innerRowData = []
        innerRowData.push(value.userName)
        innerRowData.push(value.userPhoneNumber)
        innerRowData.push(value.userPosition)
        innerRowData.push(value.userDetailAddress)
        innerRowData.push(value.userDesa)
        innerRowData.push(value.userKecamatan)
        innerRowData.push(value.userKabupaten)
        innerRowData.push(value.userReferrerName)
        innerRowData.push(value.userReferrerPosition)
        innerRowData.push(value.createdOn)
        createXLSLFormatObj.push(innerRowData)
      })

      /* File Name */
      let filename = `Data Pengguna by wilayah ${kabupatenNameSelected ?? ''}/${
        kecamatanNameSelected ?? ''
      }/${desaNameSelected} pada  ${moment().format('YYYY-MM-DD HH:mm:ss')}.xlsx`

      /* Sheet Name */
      let ws_name = 'Sheet1'
      if (typeof console !== 'undefined') console.log(new Date())
      let wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj)

      XLSX.utils.book_append_sheet(wb, ws, ws_name)
      XLSX.writeFile(wb, filename)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className=''>
      <Breadcrumb title='Export Data Pemilu' navigation={navigation} />
      {actionData?.isError && (
        <div className='p-4 my-5 text-sm text-red-800 rounded-lg bg-red-50' role='alert'>
          <span className='font-medium'>Error</span> {actionData.message}
        </div>
      )}

      <Form
        onChange={(e: any) => submit(e.currentTarget, { action: 'export/by-region' })}
        method='get'
      >
        <div className='flex flex-col md:flex-row justify-between rounded bg-white p-10'>
          <div className='px-1 w-full mb-2 flex flex-row gap-2 justify-between md:justify-start'>
            <select
              name='kabupatenNameSelected'
              onChange={(e) => setKabupatenNameSelected(e.target.value)}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5'
            >
              <option value=''>Pilih Kabupaten</option>
              {kabupatenList.map((item: IKabupatenModel, index) => (
                <option key={index} value={item.kabupatenName}>
                  {item.kabupatenName}
                </option>
              ))}
            </select>
            <select
              name='kecamatanNameSelected'
              onChange={(e) => setKecamatanNameSelected(e.target.value)}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5'
            >
              <option value=''>Pilih Kecamatan</option>
              {kecamatanList.map((item, index) => (
                <option key={index} value={item.kecamatanName}>
                  {item.kecamatanName}
                </option>
              ))}
            </select>

            <select
              name='desaNameSelected'
              onChange={(e) => setDesaNameSelected(e.target.value)}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2.5'
            >
              <option value=''>Pilih Desa</option>
              {desaList.map((item) => (
                <option key={item.desaId} value={item.desaName}>
                  {item.desaName}
                </option>
              ))}
            </select>

            <div className='w-56 px-2 border flex justify-center items-center rounded'>
              Total {loader.table.data.count}
            </div>

            <button
              type='button'
              onClick={download}
              className='bg-transparent hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-2 px-4 border border-teal-500 hover:border-transparent rounded'
            >
              Download
            </button>
          </div>
        </div>
      </Form>
    </div>
  )
}
