import { ReactElement, useEffect, useState } from 'react'
import { Form, useLoaderData, useSubmit, Link, useActionData } from '@remix-run/react'
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { redirect } from '@remix-run/router'
import { API } from '~/services/api'
import { checkSession } from '~/services/session'
import { Table, TableHeader } from '~/components/Table'
import { CONFIG } from '~/config'
import { CONSOLE } from '~/utilities/log'
import { Breadcrumb } from '~/components/breadcrumb'
import { IUserModel } from '~/models/userModel'
import { IDesaModel, IKabupatenModel, IKecamatanModel } from '~/models/regionModel'
import * as XLSX from 'xlsx'
import { convertTime } from '~/utilities/convertTime'
import moment from 'moment'
import { ISessionModel } from '~/models/sessionModel'

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
  const userPositionSelected = url.searchParams.get('userPositionSelected') || ''

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
      url: CONFIG.base_url_api + '/users/referrals',
      pagination: true,
      page: +page || 0,
      size: +size || 10,
      filters: {
        userKabupaten: kabupatenNameSelected || '',
        userKecamatan: kecamatanNameSelected || '',
        userPosition: userPositionSelected || '',
        userReferrerId: params.userId,
        userDesa: desaNameSelected || '',
        search: search || ''
      }
    })
    return {
      table: {
        link: `referral/members/${params.userName}/${params.userId}`,
        data: result,
        page: page,
        size: size,
        filter: {
          userKabupaten: kabupatenNameSelected || '',
          userKecamatan: kecamatanNameSelected || '',
          userPosition: userPositionSelected || '',
          userDesa: desaNameSelected || '',
          userReferrerId: params.userId,
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
      currentUserName: params.userName,
      kabupaten,
      kecamatan,
      desa,
      isError: false
    }
  } catch (error: any) {
    CONSOLE.log(error)
    return { ...error, isError: true }
  }
}

export let action: ActionFunction = async ({ request }) => {
  const session: any = await checkSession(request)
  if (!session) return redirect('/login')

  let formData = await request.formData()

  try {
    let reponse = null
    if (request.method == 'DELETE') {
      reponse = await API.delete(
        session,
        CONFIG.base_url_api + `/users?userId=${formData.get('userId')}`
      )

      console.log(reponse)
    }
    return { ...reponse.data, isError: false }
  } catch (error: any) {
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

  const submit = useSubmit()
  const [mobileActionDropDown, setMobileActionDropdown] = useState<number | null>()

  const actionData = useActionData()

  const navigation = [{ title: 'data referral', href: '', active: true }]

  useEffect(() => {
    setMobileActionDropdown(null)
  }, [])

  const kabupaten: IKabupatenModel[] = loader.kabupaten
  const kecamatan: IKecamatanModel[] = loader.kecamatan
  const desa: IDesaModel[] = loader.desa

  const [kabupatenList, setKabupatenList] = useState<IKabupatenModel[]>([])
  const [kecamatanList, setKecamatanList] = useState<IKecamatanModel[]>([])
  const [desaList, setDesaList] = useState<IDesaModel[]>([])

  const [desaNameSelected, setDesaNameSelected] = useState('')
  const [kabupatenNameSelected, setKabupatenNameSelected] = useState('')
  const [kecamatanNameSelected, setKecamatanNameSelected] = useState('')

  const session: ISessionModel = loader.session

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
  }, [kecamatanNameSelected, kabupatenNameSelected, desaNameSelected])

  const download = async () => {
    try {
      let xlsRows: any[] = []
      await loader.table.data.items.map((value: IUserModel, index: number) => {
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
      let filename = `Data member user ${loader.currentUserName} pada ${moment().format(
        'YYYY-MM-DD HH:mm:ss'
      )}.xlsx`

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

  const header: TableHeader[] = [
    {
      title: 'No',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'no'} className='md:px-6 md:py-3 '>
          {index + 1}
        </td>
      )
    },
    {
      title: 'Nama',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'userName'} className='md:px-6 md:py-3 '>
          {data.userName}
        </td>
      )
    },
    {
      title: 'Jabatan',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'position'} className='md:px-6 md:py-3 mb-4 md:mb-0'>
          {data.userPosition}
        </td>
      )
    },
    {
      title: 'Desa',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'desa'} className='md:px-6 md:py-3'>
          {data.userDesa}
        </td>
      )
    },
    {
      title: 'Kecamatan',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'kecamatan'} className='md:px-6 md:py-3'>
          {data.userKecamatan}
        </td>
      )
    },
    {
      title: 'Kabupaten',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'kabupaten'} className='md:px-6 md:py-3'>
          {data.userKabupaten}
        </td>
      )
    },
    {
      title: 'Aksi',
      action: true,
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'action'} className='md:px-6 md:py-3 break-all'>
          {/* Desktop only  */}
          <div className='hidden md:block w-64'>
            <Link to={`/referral/members/${data.userName}/${data.userId}`}>
              <button className='bg-transparent  m-1 hover:bg-teal-500 text-teal-700 hover:text-white py-1 px-2 border border-teal-500 hover:border-transparent rounded'>
                Member
              </button>
            </Link>
          </div>
          {/* Mobile only  */}
          <div className='block md:hidden relative'>
            <button
              id={`dropdownButton-${index}`}
              onClick={() => {
                if (index == mobileActionDropDown) {
                  setMobileActionDropdown(null)
                } else {
                  setMobileActionDropdown(index)
                }
              }}
              data-dropdown-toggle={`dropdown-${index}`}
              type='button'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
                />
              </svg>
            </button>
            <div
              id={`dropdown-${index}`}
              className={`${
                mobileActionDropDown == index ? 'absolute right-0' : 'hidden'
              } z-10 w-44 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-white`}
            >
              <ul className='py-1' aria-labelledby={`dropdownButton-${index}`}>
                <li>
                  <Link to={`/referral/members/${data.userName}/${data.userId}`}>
                    <button className='bg-transparent  m-1 hover:bg-teal-500 text-teal-700 hover:text-white py-1 px-2 border border-teal-500 hover:border-transparent rounded'>
                      Member
                    </button>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </td>
      )
    }
  ]

  return (
    <div className=''>
      <Breadcrumb
        title={`${loader.currentUserName}   / Total Pengikut (${loader?.table?.data?.total_items})`}
        navigation={navigation}
      />
      {actionData?.isError && (
        <div className='p-4 my-5 text-sm text-red-800 rounded-lg bg-red-50' role='alert'>
          <span className='font-medium'>Error</span> {actionData.message}
        </div>
      )}

      <Form
        onChange={(e: any) =>
          submit(e.currentTarget, { action: `${loader?.table?.link}` })
        }
        method='get'
      >
        <div className='flex flex-col md:flex-row justify-between mb-2 md:px-0'>
          <div className='px-1 w-full mb-2 flex flex-row gap-2 justify-between md:justify-start'>
            <select
              name='size'
              defaultValue={loader?.table?.size}
              className='block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm'
            >
              <option value='2'>2</option>
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
            </select>
            {session.adminRole === 'superAdmin' && (
              <button
                type='button'
                onClick={download}
                className='bg-transparent hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-2 px-4 border border-teal-500 hover:border-transparent rounded'
              >
                Export
              </button>
            )}
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

            <select
              name='userPositionSelected'
              defaultValue={loader?.table?.size}
              className='block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm'
            >
              <option value=''>Pilih Jabatan</option>
              {userPositionList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className='w-full  md:w-1/5'>
            <input
              defaultValue={loader?.table?.filter.search}
              name='search'
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
              placeholder='Cari data'
              type='text'
            />
          </div>
        </div>
      </Form>

      <Table header={header} table={loader.table} />
    </div>
  )
}
