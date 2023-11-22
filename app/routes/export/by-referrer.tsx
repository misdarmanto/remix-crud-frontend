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

export let loader: LoaderFunction = async ({ params, request }) => {
  const session: any = await checkSession(request)
  if (!session) return redirect('/login')

  let url = new URL(request.url)
  let search = url.searchParams.get('search') || ''
  let size = url.searchParams.get('size') || 10
  let page = url.searchParams.get('page') || 0
  let userPositionSelected = url.searchParams.get('userPositionSelected') || ''
  let userNamePositionSelected = url.searchParams.get('userNamePositionSelected') || ''

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
        userPosition: userPositionSelected,
        userName: userNamePositionSelected ?? ''
      }
    })
    return {
      table: {
        link: 'user-data',
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
  const navigation = [{ title: 'Download', href: '', active: true }]

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
      let filename = `Data Pengguna ${moment().format('DD-MM-YYYY')}.xlsx`

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

  const [userNamePositionList, setUserNamePositionList] = useState<string[]>([])

  const [userPositionSelected, setUserPositionSelected] = useState('')

  const userPositionList: string[] = [
    'korDapilX',
    'korwil',
    'korcam',
    'kordes',
    'kortps',
    'pemilih',
    'relawan'
  ]

  useEffect(() => {
    const users = loader?.table?.data?.rows.map((item: any) => item.userName)
    setUserNamePositionList(users)
    console.log(loader?.table?.data?.rows)
  }, [userPositionSelected])

  return (
    <div className=''>
      <Breadcrumb title='Data Pemilu' navigation={navigation} />
      {actionData?.isError && (
        <div className='p-4 my-5 text-sm text-red-800 rounded-lg bg-red-50' role='alert'>
          <span className='font-medium'>Error</span> {actionData.message}
        </div>
      )}

      <Form
        onChange={(e: any) => submit(e.currentTarget, { action: 'export/by-referrer' })}
        method='get'
      >
        <div className='flex flex-col md:flex-row justify-between rounded bg-white p-10'>
          <div className='px-1 w-full mb-2 flex flex-row gap-2 justify-between md:justify-start'>
            <select
              name='userPositionSelected'
              onChange={(e) => setUserPositionSelected(e.target.value)}
              className='block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm'
            >
              <option value=''>Pilih Jabatan</option>
              {userPositionList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              name='userNamePositionSelected'
              className='block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm'
            >
              <option value=''>Pilih User</option>
              {userNamePositionList.map((item) => (
                <option key={item} value={item}>
                  {item}
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
