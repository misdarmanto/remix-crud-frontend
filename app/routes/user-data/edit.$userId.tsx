import {
  Form,
  useLoaderData,
  useSubmit,
  useTransition,
  useActionData,
  useNavigate
} from '@remix-run/react'
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { redirect } from '@remix-run/router'
import { API } from '~/services/api'
import { checkSession } from '~/services/session'
import { CONFIG } from '~/config'
import { Breadcrumb } from '~/components/breadcrumb'
import { ISessionModel } from '~/models/sessionModel'
import { IRelawanModel, IUserCreateRequestModel, IUserModel } from '~/models/userModel'
import { useEffect, useState } from 'react'
import { IDesaModel, IKabupatenModel, IKecamatanModel } from '~/models/regionModel'

export let loader: LoaderFunction = async ({ params, request }) => {
  const session: any = await checkSession(request)
  if (!session) return redirect('/login')
  try {
    const result = await API.get(
      session,
      CONFIG.base_url_api + `/users/detail/${params.userId}`
    )

    const kabupaten = await API.get(session, CONFIG.base_url_api + `/region/kabupaten`)
    const kecamatan = await API.get(
      session,
      CONFIG.base_url_api + `/region/kecamatan?kabupatenId=11`
    )

    const desa = await API.get(
      session,
      CONFIG.base_url_api + `/region/desa?kecamatanId=1111`
    )

    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const position = url.searchParams.get('position')

    let userReferrals = { items: [] }
    if (search !== '' && search !== null) {
      userReferrals = await API.get(
        session,
        `${CONFIG.base_url_api}/users/position?userPosition=${position}&&search=${search}`
      )
    }

    return {
      userReferrals,
      user: result,
      kabupaten,
      kecamatan,
      desa,
      session: session,
      isError: false
    }
  } catch (error: any) {
    console.log(error)
    return { ...error, isError: true }
  }
}

export let action: ActionFunction = async ({ request }) => {
  const session: ISessionModel | any = await checkSession(request)
  if (!session) return redirect('/login')

  let formData = await request.formData()
  try {
    let result: any = null
    if (request.method === 'PATCH') {
      const payload: IUserCreateRequestModel | any = {
        userId: formData.get('userId'),
        userName: formData.get('userName'),
        userPhoneNumber: formData.get('userPhoneNumber'),
        userDetailAddress: formData.get('userDetailAddress'),
        userDesa: formData.get('userDesa'),
        userDesaId: formData.get('userDesaId'),
        userKecamatan: formData.get('userKecamatan'),
        userKecamatanId: formData.get('userKecamatanId'),
        userKabupaten: formData.get('userKabupaten'),
        userKabupatenId: formData.get('userKabupatenId'),
        userPosition: formData.get('userPosition'),
        userReferrerId: formData.get('userReferrerId') ?? null,
        userReferrerName: formData.get('userReferrerName') ?? null,
        userReferrerPosition: formData.get('userReferrerPosition') ?? null
      }

      result = await API.patch(session, CONFIG.base_url_api + '/users', payload)

      return redirect(
        `/user-data?page=${formData.get('tablePage')}&size=${formData.get(
          'tableSize'
        )}&search=${formData.get('tableSearch')}`
      )
    }
    return { isError: false, result, back: false }
  } catch (error: any) {
    console.log(error)
    return { ...error, isError: true }
  }
}

export default function Index() {
  const navigation = [{ title: 'data pemilu', href: '', active: true }]
  const loader = useLoaderData()

  if (loader.isError) {
    return (
      <h1 className='text-center font-bold text-3xl text-red-600'>
        {loader.error?.messsage || 'error'}
      </h1>
    )
  }

  const submit = useSubmit()
  const transition = useTransition()
  const actionData = useActionData()
  const detailUser: IUserModel = loader.user

  const kabupaten: IKabupatenModel[] = loader.kabupaten
  const kecamatan: IKecamatanModel[] = loader.kecamatan
  const desa: IDesaModel[] = loader.desa
  const session: ISessionModel = loader.session

  const [kabupatenList, setKabupatenList] = useState<IKabupatenModel[]>([])
  const [kecamatanList, setKecamatanList] = useState<IKecamatanModel[]>([])
  const [desaList, setDesaList] = useState<IDesaModel[]>([])

  const [kabupatenSelected, setKabupatenSelected] = useState<IKabupatenModel>()
  const [kecamatanSelected, setKecamatanSelected] = useState<IKecamatanModel>()
  const [desaSelected, setDesaSelected] = useState<IDesaModel>()

  const [userPosition, setUserPosition] = useState<string>()
  const [userReferrerPosition, setUserReferrerPosition] = useState<string>()
  const [userReferrerId, setUserReferrerId] = useState<string>()
  const [userReferrerName, setUserReferrerName] = useState<string>()
  const [userReferrerPositionList, setUserReferrerPositionList] = useState<string[]>([])
  const [isOpenModal, setIsOpenModal] = useState(false)

  useEffect(() => {
    const filterKecamatan = kecamatan.filter((item) => item.kabupatenId === '11')
    setKabupatenList(kabupaten)
    setKecamatanList(filterKecamatan)
    setDesaList(desa)
    setUserPosition(detailUser.userPosition)
    setUserReferrerId(detailUser.userReferrerId)
    setUserReferrerName(detailUser.userReferrerName)
    setUserReferrerPosition(detailUser.userReferrerPosition)
  }, [])

  useEffect(() => {
    if (kabupatenSelected) {
      const filterKecamatan = kecamatan.filter(
        (item) => item.kabupatenId === kabupatenSelected.kabupatenId
      )
      if (filterKecamatan.length !== 0) {
        setKecamatanList(filterKecamatan)
      }
    }
  }, [kabupatenSelected])

  useEffect(() => {
    if (kecamatanSelected) {
      const filterDesa = desa.filter(
        (item) => item.kecamatanId === kecamatanSelected.kecamatanId
      )
      if (filterDesa.length !== 0) {
        setDesaList(filterDesa)
      }
    }
  }, [kecamatanSelected, kabupatenSelected])

  useEffect(() => {
    const findDesa = desa.find((item) => item.desaName === loader.user.userDesa)
    const findKecamatan = kecamatan.find(
      (item) => item.kecamatanName === loader.user.userKecamatan
    )
    const findKabupaten = kabupaten.find(
      (item) => item.kabupatenName === loader.user.userKabupaten
    )

    setDesaSelected(findDesa)
    setKecamatanSelected(findKecamatan)
    setKabupatenSelected(findKabupaten)
  }, [])

  const submitData = async (e: React.FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget, {
      method: 'patch',
      action: `user-data/edit/${detailUser.userId}`
    })
  }

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
    switch (userPosition) {
      case 'korDapilX':
        setUserReferrerPositionList([])
        break
      case 'korwil':
        setUserReferrerPositionList(['korDapilX'])
        break
      case 'korcam':
        setUserReferrerPositionList(['korDapilX', 'korwil'])
        break
      case 'kordes':
        setUserReferrerPositionList(['korDapilX', 'korwil', 'korcam'])
        break
      case 'kortps':
        setUserReferrerPositionList(['korDapilX', 'korwil', 'korcam', 'kordes'])
        break
      case 'pemilih':
        setUserReferrerPositionList([
          'korDapilX',
          'korwil',
          'korcam',
          'kordes',
          'kortps',
          'relawan'
        ])
        break
      default:
        break
    }
  }, [userPosition])

  const handleModalOnSelect = (item: { userId: string; userName: string }) => {
    setUserReferrerId(item.userId)
    setUserReferrerName(item.userName)
  }

  const [tableSize, setTableSize] = useState<number>()
  const [tablePage, setTablePage] = useState<number>()
  const [tableSearch, setTableSearch] = useState<string>('')

  const tableStorageKey = 'currentTableSize'
  const tablePageKey = 'tablePage'
  const tableSearchKey = 'searchKey'

  useEffect(() => {
    const currentTableSize = localStorage.getItem(tableStorageKey)
    if (currentTableSize) {
      setTableSize(parseInt(JSON.parse(currentTableSize)))
    }

    const currentTablePage = localStorage.getItem(tablePageKey)
    if (currentTablePage) {
      setTablePage(parseInt(JSON.parse(currentTablePage)))
    }

    const currentTableSearch = localStorage.getItem(tableSearchKey)
    if (currentTableSearch) {
      setTableSearch(JSON.parse(currentTableSearch))
    }
  }, [loader])

  return (
    <div className=''>
      <Breadcrumb title='Tambah Data' navigation={navigation} />
      {actionData?.isError && (
        <div className='p-4 my-5 text-sm text-red-800 rounded-lg bg-red-50' role='alert'>
          <span className='font-medium'>Error</span> {actionData.message}
        </div>
      )}
      <Form
        method={'patch'}
        onSubmit={submitData}
        className='bg-white rounded-xl p-5 sm:p-10'
      >
        <input hidden name='userId' value={detailUser.userId} />
        <div className='sm:my-6 flex flex-col sm:flex-row gap-5'>
          <div className='w-full sm:w-1/2'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>Nama</label>
            <input
              name='userName'
              type='text'
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
              required
              placeholder='nama...'
              defaultValue={detailUser.userName}
            />
          </div>
          <div className='w-full sm:w-1/2'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>
              Nomor Whatsapp
            </label>
            <input
              name='userPhoneNumber'
              type='tel'
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
              required
              placeholder='+6281356657899'
              defaultValue={detailUser.userPhoneNumber}
            />
          </div>
        </div>

        <div className='sm:my-6 flex flex-col sm:flex-row gap-5'>
          <div className='w-full sm:w-1/2'>
            <div className='my-2'>
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Kabupaten
              </label>
              <select
                onChange={(e) => setKabupatenSelected(JSON.parse(e.target.value))}
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              >
                <option value={JSON.stringify(kabupatenSelected)}>
                  {kabupatenSelected?.kabupatenName}
                </option>
                {kabupatenList.map((item, index) => (
                  <option key={index} value={JSON.stringify(item)}>
                    {item.kabupatenName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='w-full sm:w-1/2'>
            <div className='my-2'>
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Kecamatan
              </label>
              <select
                onChange={(e) => setKecamatanSelected(JSON.parse(e.target.value))}
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              >
                <option value={JSON.stringify(kecamatanSelected)}>
                  {kecamatanSelected?.kecamatanName}
                </option>
                {kecamatanList.map((item, index) => (
                  <option key={index} value={JSON.stringify(item)}>
                    {item.kecamatanName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='sm:my-6 flex flex-col sm:flex-row gap-5'>
          <div className='w-full sm:w-1/2'>
            <div className='my-2'>
              <label className='block mb-2 text-sm font-medium text-gray-900'>Desa</label>
              <select
                onChange={(e) => setDesaSelected(JSON.parse(e.target.value))}
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              >
                <option value={JSON.stringify(desaSelected)}>
                  {desaSelected?.desaName}
                </option>
                {desaList.map((item, index) => (
                  <option key={index} value={JSON.stringify(item)}>
                    {item.desaName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='w-full sm:w-1/2'>
            <div className='my-2'>
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Alamat
              </label>
              <textarea
                name='userDetailAddress'
                className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Jl. Hadi subroto .....'
                defaultValue={detailUser.userDetailAddress}
                required
              />
            </div>
          </div>
        </div>
        <div className='sm:my-6 flex flex-col sm:flex-row gap-5'>
          <div className='w-full sm:w-1/2'>
            <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
              Jabatan
            </label>
            <select
              onChange={(e) => {
                setUserPosition(e.target.value)
              }}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            >
              <option value={detailUser.userPosition}>{detailUser.userPosition}</option>
              {userPositionList.map((item, index: number) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='sm:my-6 flex flex-col sm:flex-row gap-5'>
          <div className='w-full sm:w-1/2'>
            <div className='my-2'>
              <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Jabatan Referrer
              </label>
              <select
                onChange={(e) => setUserReferrerPosition(e.target.value)}
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              >
                <option value={detailUser.userReferrerPosition}>
                  {detailUser.userReferrerPosition}
                </option>
                {userReferrerPositionList.map((item: any, index: number) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='w-full sm:w-1/2'>
            <div className='my-2'>
              <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Nama Referrer
              </label>
              <input
                onFocus={() => setIsOpenModal(true)}
                type='text'
                value={userReferrerName}
                name='userReferrarName'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-teal-500 dark:focus:border-teal-500'
                placeholder='nama'
              />
            </div>
          </div>
        </div>

        <input hidden name='tableSearch' defaultValue={tableSearch} />
        <input hidden name='tableSize' defaultValue={tableSize} />
        <input hidden name='tablePage' defaultValue={tablePage} />
        <input hidden name='userReferrerId' defaultValue={userReferrerId} />
        <input hidden name='userReferrerName' defaultValue={userReferrerName} />
        <input hidden name='userReferrerPosition' defaultValue={userReferrerPosition} />
        <input hidden name='userPosition' defaultValue={userPosition} />
        <input hidden name='userDesa' defaultValue={desaSelected?.desaName} />
        <input hidden name='userDesaId' defaultValue={desaSelected?.desaId} />
        <input
          hidden
          name='userKecamatan'
          defaultValue={kecamatanSelected?.kecamatanName}
        />
        <input
          hidden
          name='userKecamatanId'
          defaultValue={kecamatanSelected?.kecamatanId}
        />
        <input
          hidden
          name='userKabupaten'
          defaultValue={kabupatenSelected?.kabupatenName}
        />
        <input
          hidden
          name='userKabupatenId'
          defaultValue={kabupatenSelected?.kabupatenId}
        />

        <div className='flex justify-end mt-4'>
          <button
            type='submit'
            className='inline-flex justify-center w-32 rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm'
          >
            {transition?.submission ? 'Loading...' : 'Update'}
          </button>
        </div>
      </Form>

      {isOpenModal && (
        <Modal
          isOpenModal={isOpenModal}
          setIsOpenModal={setIsOpenModal}
          loader={loader}
          position={userReferrerPosition}
          onSelected={handleModalOnSelect}
        />
      )}
    </div>
  )
}

interface ModalTypes {
  isOpenModal: any
  setIsOpenModal: any
  position?: string
  loader: any
  onSelected: any
}

const Modal = ({
  isOpenModal,
  setIsOpenModal,
  position,
  loader,
  onSelected
}: ModalTypes) => {
  const submit = useSubmit()
  const userReferrals = []

  if (loader?.userReferrals?.items) {
    userReferrals.push(...loader.userReferrals.items)
  }

  return (
    <div className='fixed inset-0 z-10'>
      <div
        className='fixed inset-0 w-full h-full bg-black opacity-10'
        onClick={() => setIsOpenModal(!isOpenModal)}
      ></div>
      <div className='flex items-center min-h-screen px-4 py-8'>
        <div className='relative h-64 flex max-w-xl p-8 mx-auto bg-white rounded-md shadow-lg'>
          <div className='w-96 overflow-y-scroll'>
            <Form
              onChange={(e: any) =>
                submit(e.currentTarget, {
                  action: `/user-data/edit/${loader.user.userId}`
                })
              }
              method='get'
            >
              <div className='flex flex-row '>
                <input type='hidden' name='position' value={position} />
                <input
                  type='email'
                  name='search'
                  defaultValue={loader.search}
                  className='bg-gray-50 border border-gray-300 mx-5 h-10 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-teal-500 dark:focus:border-teal-500'
                  placeholder='masukan e-mail'
                  required
                />
              </div>
            </Form>
            <ul className='max-w-md  mx-5 divide-y divide-gray-200 mt-5 dark:divide-gray-700'>
              {userReferrals.map((item, index: number) => (
                <div
                  key={index}
                  onClick={() => {
                    onSelected(item)
                    setIsOpenModal(false)
                  }}
                  className='p-2 rounded-lg hover:bg-gray-100'
                >
                  {item.userName}
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
