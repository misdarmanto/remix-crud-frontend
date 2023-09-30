import { ReactElement, useEffect, useState } from 'react'
import { Form, useLoaderData, useSubmit } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/router'
import { API } from '~/services/api'
import { checkSession } from '~/services/session'
import { Table, TableHeader } from '~/components/Table'
import { CONFIG } from '~/config'
import { CONSOLE } from '~/utilities/log'
import { Breadcrumb } from '~/components/breadcrumb'
import { ISessionModel } from '~/models/sessionModel'
import { IDesaModel, IKabupatenModel, IKecamatanModel } from '~/models/regionModel'

interface IUnregisteredRegionModel {
  desaName: string
  kecamatan: {
    kecamatanName: string
  }
  kabupaten: {
    kabupatenName: string
  }
}

export let loader: LoaderFunction = async ({ params, request }) => {
  const session: any = await checkSession(request)
  if (!session) return redirect('/login')

  let url = new URL(request.url)
  let search = url.searchParams.get('search') || ''
  let size = url.searchParams.get('size') || 10
  let page = url.searchParams.get('page') || 0

  let desaNameSelected = url.searchParams.get('desaNameSelected') || ''
  let kabupatenNameSelected = url.searchParams.get('kabupatenNameSelected') || ''
  let kecamatanNameSelected = url.searchParams.get('kecamatanNameSelected') || ''
  let userPositionSelected = url.searchParams.get('userPositionSelected') || ''

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
      url: CONFIG.base_url_api + '/region/unregistered',
      pagination: true,
      page: +page || 0,
      size: +size || 10,
      filters: {
        kabupatenName: kabupatenNameSelected || '',
        kecamatanName: kecamatanNameSelected || '',
        desaName: desaNameSelected || '',
        userPosition: userPositionSelected || '',
        search: search || ''
      }
    })
    return {
      table: {
        link: 'region/unregistered',
        data: result,
        page: page,
        size: size,
        filter: {
          kabupatenName: kabupatenNameSelected || '',
          kecamatanName: kecamatanNameSelected || '',
          desaName: desaNameSelected || '',
          userPosition: userPositionSelected || '',
          search: search
        }
      },
      session: session,
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

export default function Index(): ReactElement {
  const loader = useLoaderData()
  const session: ISessionModel = loader.session

  console.log(loader)
  if (loader.isError) {
    return (
      <h1 className='text-center font-bold text-xl text-red-600'>
        {loader.message || `Error ${loader.code || ''}!`}
      </h1>
    )
  }

  const submit = useSubmit()

  const kabupaten: IKabupatenModel[] = loader.kabupaten
  const kecamatan: IKecamatanModel[] = loader.kecamatan
  const desa: IDesaModel[] = loader.desa

  const [kabupatenList, setKabupatenList] = useState<IKabupatenModel[]>([])
  const [kecamatanList, setKecamatanList] = useState<IKecamatanModel[]>([])
  const [desaList, setDesaList] = useState<IDesaModel[]>([])

  const [desaNameSelected, setDesaNameSelected] = useState('')
  const [kabupatenNameSelected, setKabupatenNameSelected] = useState('')
  const [kecamatanNameSelected, setKecamatanNameSelected] = useState('')

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

  const header: TableHeader[] = [
    {
      title: 'No',
      data: (data: IUnregisteredRegionModel, index: number): ReactElement => (
        <td key={index + '-photo'} className='md:px-6 md:py-3 w-auto mb-4 md:mb-0 '>
          {index + 1}
        </td>
      )
    },
    {
      title: 'Desa',
      data: (data: IUnregisteredRegionModel, index: number): ReactElement => (
        <td key={index + 'name'} className='md:px-2 md:py-3'>
          {data.desaName}
        </td>
      )
    },
    {
      title: 'Kecamatan',
      data: (data: IUnregisteredRegionModel, index: number): ReactElement => (
        <td key={index + 'kecamatan'} className='md:px-2 md:py-3'>
          {data.kecamatan.kecamatanName}
        </td>
      )
    },
    {
      title: 'Kabupaten',
      data: (data: IUnregisteredRegionModel, index: number): ReactElement => (
        <td key={index + 'kabupaten'} className='md:px-2 md:py-3'>
          {data.kabupaten.kabupatenName}
        </td>
      )
    }
  ]

  const navigation = [{ title: 'Daftar', href: '', active: true }]

  return (
    <div className=''>
      <Breadcrumb title='Wilayah yang Belum Terdaftar' navigation={navigation} />

      <Form
        onChange={(e: any) =>
          submit(e.currentTarget, { action: `${loader?.table?.link}` })
        }
        method='get'
      >
        <div className='flex flex-col md:flex-row justify-between mb-2 md:px-0'>
          <div className='px-1 w-full mb-2 flex flex-row justify-between md:justify-start gap-5'>
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
            &nbsp;
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
          </div>
          <div className='w-full mb-2 md:w-1/5'>
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
