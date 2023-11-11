import { ReactElement, useEffect, useRef, useState } from 'react'
import {
  Form,
  useLoaderData,
  useSubmit,
  useTransition,
  Link,
  useActionData,
  useLocation,
  useNavigate
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
      url: CONFIG.base_url_api + '/users/list',
      pagination: true,
      page: +page || 0,
      size: +size || 10,
      filters: {
        search: search || ''
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
  const transition = useTransition()
  const [mobileActionDropDown, setMobileActionDropdown] = useState<number | null>()

  const [modalDelete, setModalDelete] = useState(false)
  const [modalData, setModalData] = useState<IUserModel>()
  const navigate = useNavigate()

  const actionData = useActionData()
  const session: ISessionModel = loader.session

  const submitDeleteData = async (e: React.FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget, { method: 'delete', action: `/user-data` })
    setModalDelete(false)
  }

  const navigation = [{ title: 'data pemilu', href: '', active: true }]

  useEffect(() => {
    setMobileActionDropdown(null)
  }, [])

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
          {data.userPosition || '_'}
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
      title: 'Nama Referrer',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'referrer'} className='md:px-6 md:py-3'>
          {data.userReferrerName || '_'}
        </td>
      )
    },
    {
      title: 'Jabatan Referrer',
      data: (data: IUserModel, index: number): ReactElement => (
        <td key={index + 'jabatan referrer'} className='md:px-6 md:py-3'>
          {data.userReferrerPosition || '_'}
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
            <button
              onClick={() => {
                setModalData(data)
                setModalDelete(true)
              }}
              className='bg-transparent m-1 hover:bg-red-500 text-red-700 hover:text-white py-1 px-2 border border-red-500 hover:border-transparent rounded'
            >
              Hapus
            </button>
            &nbsp;
            <Link to={`/user-data/edit/${data.userId}`}>
              <button className='bg-transparent m-1 hover:bg-teal-500 text-teal-700 hover:text-white py-1 px-2 border border-teal-500 hover:border-transparent rounded'>
                Edit
              </button>
            </Link>
            <Link to={`/user-data/detail/${data.userId}`}>
              <button className='bg-transparent  m-1 hover:bg-teal-500 text-teal-700 hover:text-white py-1 px-2 border border-teal-500 hover:border-transparent rounded'>
                Detail
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
                  <Link
                    to={`/user-data/edit/${data.userId}`}
                    className='block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-800 dark:hover:text-white'
                  >
                    Edit
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/user-data/detail/${data.userId}`}
                    className='block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-800 dark:hover:text-white'
                  >
                    Detail
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setModalData(data)
                      setModalDelete(true)
                    }}
                    className='block w-full text-left py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-800 dark:hover:text-white'
                  >
                    Hapus
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </td>
      )
    }
  ]

  const [tableSize, setTableSize] = useState<number>()
  const [tableSearch, setTableSearch] = useState<string>('')

  const tableSizeKey = 'currentTableSize'
  const tablePageKey = 'tablePage'
  const tableSearchKey = 'searchKey'

  useEffect(() => {
    const currentTableSize = localStorage.getItem(tableSizeKey)
    if (!currentTableSize) {
      localStorage.setItem(tableSizeKey, JSON.stringify(loader?.table?.size))
    } else {
      setTableSize(parseInt(JSON.parse(currentTableSize)))
    }

    const currentTabelSearch = localStorage.getItem(tableSearchKey)
    if (!currentTabelSearch) {
      localStorage.setItem(tableSearchKey, JSON.stringify(loader?.table?.filter.search))
    } else {
      setTableSearch(currentTabelSearch)
    }

    localStorage.setItem(tableSearchKey, JSON.stringify(loader?.table?.filter.search))
    localStorage.setItem(tablePageKey, JSON.stringify(loader?.table?.page))
  }, [loader])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        navigate('create-auto')
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
        navigate('create-manual')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div>
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
              defaultValue={tableSize || loader?.table?.size}
              onChange={(e) => {
                setTableSize(+e.target.value)
                localStorage.setItem(tableSizeKey, JSON.stringify(e.target.value))
              }}
              className='block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm'
            >
              {tableSize && <option value={tableSize}>{tableSize}</option>}
              <option value='2'>2</option>
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
              <option value='1000'>1000</option>
            </select>
            &nbsp;
            <Link to={`create-auto`}>
              <button
                type='button'
                className='bg-transparent hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-2 px-4 border border-teal-500 hover:border-transparent rounded'
              >
                Tambah Data Otomatis
              </button>
            </Link>
            &nbsp;
            <Link to={`create-manual`}>
              <button
                type='button'
                className='bg-transparent hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-2 px-4 border border-teal-500 hover:border-transparent rounded'
              >
                Tambah Data Manual
              </button>
            </Link>
            {session.adminRole === 'superAdmin' && (
              <Link to={'export'}>
                <button
                  type='button'
                  className='bg-transparent hover:bg-teal-500 text-teal-700 font-semibold hover:text-white py-2 px-4 border border-teal-500 hover:border-transparent rounded'
                >
                  Export
                </button>
              </Link>
            )}
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
        open={modalDelete}
        setOpen={() => {
          setModalDelete(false)
        }}
      >
        <Form method='delete' onSubmit={submitDeleteData}>
          <input className='hidden' name='userId' value={modalData?.userId}></input>
          Apakah anda yakin akan menghapus <strong>{modalData?.userName}</strong>
          <div className='flex flex-col md:flex-row mt-4'>
            <button
              type='submit'
              className='inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm'
            >
              {transition?.submission ? 'Menghapus...' : 'Hapus'}
            </button>
            <button
              type='button'
              className='inline-flex ml-0 md:ml-2 justify-center w-full rounded-md border border-gray shadow-sm px-4 py-2 bg-white text-base font-medium text-gray hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray sm:text-sm'
              onClick={() => {
                setModalDelete(false)
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
