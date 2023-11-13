import { Form, Link, useLoaderData, useSubmit } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/router'
import { Breadcrumb } from '~/components/breadcrumb'
import { checkSession } from '~/services/session'
import { API } from '~/services/api'
import { CONFIG } from '~/config'
import { CONSOLE } from '~/utilities/log'
import { Table, TableHeader } from '~/components/Table'
import { ReactElement } from 'react'
import { IWaBlasHistory } from '~/models/waBlasHistory'
import { convertTime } from '~/utilities/convertTime'

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
      url: CONFIG.base_url_api + '/wa-blas/history',
      pagination: true,
      page: +page || 0,
      size: +size || 10,
      filters: {
        search: search || ''
      }
    })
    return {
      table: {
        link: 'wa-blas/history',
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

export default function Index() {
  const loader = useLoaderData()

  if (loader.isError) {
    return (
      <h1 className='text-center font-bold text-xl text-red-600'>
        {loader.message || `Error ${loader.code || ''}!`}
      </h1>
    )
  }

  const navigation = [{ title: 'History', href: '', active: true }]

  const submit = useSubmit()

  const header: TableHeader[] = [
    {
      title: 'Nama',
      data: (data: IWaBlasHistory, index: number): ReactElement => (
        <td key={index + 'userName'} className='md:px-6 md:py-3 '>
          {data.waBlasHistoryUserName}
        </td>
      )
    },
    {
      title: 'Wa',
      data: (data: IWaBlasHistory, index: number): ReactElement => (
        <td key={index + 'userName'} className='md:px-6 md:py-3 '>
          {data.waBlasHistoryUserPhone}
        </td>
      )
    },
    {
      title: 'Pesan',
      data: (data: IWaBlasHistory, index: number): ReactElement => (
        <td key={index + 'message'} className='md:px-6 md:py-3 '>
          {data.waBlasHistoryMessage.length > 100
            ? data.waBlasHistoryMessage.slice(0, 100) + '.....'
            : data.waBlasHistoryMessage}
        </td>
      )
    },
    {
      title: 'TGL',
      data: (data: IWaBlasHistory, index: number): ReactElement => (
        <td key={index + 'tgl'} className='md:px-6 md:py-3 '>
          {convertTime(data.createdOn)}
        </td>
      )
    }
  ]

  return (
    <div>
      <Breadcrumb title='Wa Blas' navigation={navigation} />

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
            &nbsp;
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
