import { ReactElement, useEffect, useState } from 'react'
import { Form, Link, useLoaderData, useSubmit } from '@remix-run/react'
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

  try {
    const result = await API.getTableData({
      session: session,
      url: CONFIG.base_url_api + '/region/all',
      pagination: true,
      page: +page || 0,
      size: +size || 10,
      filters: {
        search: search || ''
      }
    })
    return {
      table: {
        link: 'region/all',
        data: result,
        page: page,
        size: size,
        filter: {
          search: search
        }
      },
      session: session,
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
      <Breadcrumb title='Wilayah' navigation={navigation} />

      <Form
        onChange={(e: any) =>
          submit(e.currentTarget, { action: `${loader?.table?.link}` })
        }
        method='get'
      >
        <div className='flex flex-col md:flex-row justify-between mb-2 md:px-0'>
          <div className='px-1 w-full mb-2 flex flex-row justify-between md:justify-start'>
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
            <Link to={`/region/create`}>
              <button
                type='button'
                className='bg-transparent hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-2 px-4 border border-teal-500 hover:border-transparent rounded'
              >
                Tambah Wilayah
              </button>
            </Link>
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
