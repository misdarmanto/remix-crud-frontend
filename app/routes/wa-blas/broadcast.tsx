import { ReactElement, useEffect, useState } from 'react'
import {
  Form,
  useLoaderData,
  useSubmit,
  useTransition,
  Link,
  useActionData
} from '@remix-run/react'
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { redirect } from '@remix-run/router'
import { API } from '~/services/api'
import { checkSession } from '~/services/session'
import { Table, TableHeader } from '~/components/Table'
import { CONFIG } from '~/config'
import { CONSOLE } from '~/utilities/log'
import { Modal } from '~/components/Modal'
import { Breadcrumb } from '~/components/breadcrumb'
import { IUserModel } from '~/models/userModel'
import { ISessionModel } from '~/models/sessionModel'
import { IKabupatenModel, IKecamatanModel } from '~/models/regionModel'
import { IWaBlasSettings } from '~/models/waBlas'
import Button from '~/components/Button'

export let loader: LoaderFunction = async ({ params, request }) => {
  const session: any = await checkSession(request)
  if (!session) return redirect('/login')

  let url = new URL(request.url)
  let search = url.searchParams.get('search') || ''
  let size = url.searchParams.get('size') || 10
  let page = url.searchParams.get('page') || 0

  // let kabupatenSelected = JSON.parse(
  //   url.searchParams.get('kabupatenSelected') ?? ''
  // ) as unknown as IKabupatenModel

  // let kecamatanSelected = JSON.parse(
  //   url.searchParams.get('kecamatanelected') ?? ''
  // ) as unknown as IKecamatanModel

  const kabupaten = await API.get(session, CONFIG.base_url_api + `/region/kabupaten`)
  const kecamatan = await API.get(
    session,
    CONFIG.base_url_api + `/region/kecamatan?kabupatenId=11`
  )

  const waBlasSettings = await API.get(session, `${CONFIG.base_url_api}/wa-blas/settings`)

  try {
    const result = await API.getTableData({
      session: session,
      url: CONFIG.base_url_api + '/users/list',
      pagination: true,
      page: +page || 0,
      size: +size || 10,
      filters: {
        search: search || ''
        // userKabupaten: kabupatenSelected.kabupatenName || '',
        // userKecamatan: kecamatanSelected.kecamatanName || ''
      }
    })
    return {
      table: {
        link: 'wa-blas/broadcast',
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
      waBlasSettings,
      kabupaten,
      kecamatan,
      isError: false
    }
  } catch (error: any) {
    CONSOLE.log(error)
    return { ...error, isError: true }
  }
}

export let action: ActionFunction = async ({ request }) => {
  const session: ISessionModel | any = await checkSession(request)
  if (!session) return redirect('/login')

  let formData = await request.formData()

  try {
    if (request.method == 'POST') {
      const payload: any = {
        kabupatenId: formData.get('kabupatenId') || '',
        kecamatanId: formData.get('kecamatanId') || ''
      }

      await API.post(session, CONFIG.base_url_api + '/wa-blas/send-message', payload)
    }
    return { isError: false, request }
  } catch (error: any) {
    console.log(error)
    return { ...error, isError: true }
  }
}

export default function Index(): ReactElement {
  const loader = useLoaderData()

  if (loader.isError) {
    return (
      <h1 className='text-center font-bold text-xl text-red-600'>
        {loader.message || `Error ${loader.code || ''}!`}
      </h1>
    )
  }

  const submit = useSubmit()

  const actionData = useActionData()
  const navigation = [{ title: 'data pemilu', href: '', active: true }]

  const waBlasSettings: IWaBlasSettings = loader?.waBlasSettings

  const kabupaten: IKabupatenModel[] = loader.kabupaten
  const kecamatan: IKecamatanModel[] = loader.kecamatan

  const [kabupatenList, setKabupatenList] = useState<IKabupatenModel[]>([])
  const [kecamatanList, setKecamatanList] = useState<IKecamatanModel[]>([])

  const [kabupatenSelected, setKabupatenSelected] = useState<IKabupatenModel>()
  const [kecamatanSelected, setKecamatanSelected] = useState<IKecamatanModel>()

  const [defaultMessage, setDefaultMessage] = useState('')

  const transition = useTransition()
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    const filterKecamatan = kecamatan.filter((item) => item.kabupatenId === '11')
    setKabupatenList(kabupaten)
    setKecamatanList(filterKecamatan)
  }, [])

  useEffect(() => {
    if (kabupatenSelected) {
      const findKabupaten = kabupaten.find(
        (item) => item.kabupatenId === kabupatenSelected.kabupatenId
      )
      const filterKecamatan = kecamatan.filter(
        (item) => item.kabupatenId === findKabupaten?.kabupatenId
      )
      if (filterKecamatan.length !== 0) {
        setKecamatanList(filterKecamatan)
      }
    }
  }, [kabupatenSelected])

  useEffect(() => {
    setDefaultMessage(waBlasSettings.waBlasSettingsMessage)
  }, [])

  const submitData = async (e: React.FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget, {
      method: 'patch',
      action: `/wa-blas/broadcast`
    })
  }

  const header: TableHeader[] = [
    {
      title: 'Nama',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'userName'} className='md:px-6 md:py-3 '>
          {data.userName}
        </td>
      )
    },
    {
      title: 'WA',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'wa'} className='md:px-6 md:py-3'>
          {data.userPhoneNumber}
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
      title: 'nama referrer',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'tim relawan'} className='md:px-6 md:py-3'>
          {data.userReferrerName || '_'}
        </td>
      )
    },
    {
      title: 'jabatab referrer',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'nama relawan'} className='md:px-6 md:py-3'>
          {data.userReferrerPosition || '_'}
        </td>
      )
    }
  ]

  return (
    <div className=''>
      <Breadcrumb title='Data Pemilu' navigation={navigation} />
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
              className='block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm'
            >
              <option value='2'>2</option>
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
            </select>
            <select
              name='kabupatenSelected'
              onChange={(e) => setKabupatenSelected(JSON.parse(e.target.value))}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5'
            >
              <option value=''>Pilih Kabupaten</option>
              {kabupatenList.map((item: IKabupatenModel, index) => (
                <option key={index} value={JSON.stringify(item)}>
                  {item.kabupatenName}
                </option>
              ))}
            </select>
            <select
              name='kecamatanSelected'
              onChange={(e) => setKecamatanSelected(JSON.parse(e.target.value))}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5'
            >
              <option value=''>Pilih Kecamatan</option>
              {kecamatanList.map((item, index) => (
                <option key={index} value={JSON.stringify(item)}>
                  {item.kecamatanName}
                </option>
              ))}
            </select>
            <button
              onClick={() => setOpenModal(true)}
              type='button'
              className='bg-transparent hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-2 px-4 border border-teal-500 hover:border-transparent rounded'
            >
              Kirim
            </button>
          </div>

          <div className='w-full md:w-1/5'>
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

      <Modal
        open={openModal}
        setOpen={() => {
          setOpenModal(false)
        }}
      >
        <Form method={'post'} onSubmit={submitData}>
          <input hidden name='kabupatenId' value={kabupatenSelected?.kabupatenId} />
          <input hidden name='kecamatanId' value={kecamatanSelected?.kecamatanId} />
          Apakah anda yakin ingin membroadcast pesan ke pada pengguna tersebut?
          <div className='flex flex-col md:flex-row mt-4'>
            <button
              type='submit'
              onClick={() => setOpenModal(false)}
              className='inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm'
            >
              {transition?.submission ? 'Sending...' : 'Send'}
            </button>
            <button
              type='button'
              className='inline-flex ml-0 md:ml-2 justify-center w-full rounded-md border border-gray shadow-sm px-4 py-2 bg-white text-base font-medium text-gray hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray sm:text-sm'
              onClick={() => {
                setOpenModal(false)
              }}
            >
              Batalkan
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
