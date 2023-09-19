import {
  Form,
  useLoaderData,
  useSubmit,
  useTransition,
  useActionData
} from '@remix-run/react'
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { redirect } from '@remix-run/router'
import { API } from '~/services/api'
import { checkSession } from '~/services/session'
import { CONFIG } from '~/config'
import { Breadcrumb } from '~/components/breadcrumb'
import { ISessionModel } from '~/models/sessionModel'
import { IUserCreateRequestModel } from '~/models/userModel'
import { useEffect, useState } from 'react'
import { IDesaModel, IKabupatenModel, IKecamatanModel } from '~/models/regionModel'
import { IRelawanModel } from '~/models/relawanTimModel'

export let loader: LoaderFunction = async ({ params, request }) => {
  const session: any = await checkSession(request)
  if (!session) return redirect('/login')

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
  const userReferrerPosition = url.searchParams.get('userReferrerPosition')

  console.log(url.searchParams)

  let userReferrals = { items: [] }
  if (search !== '' && search !== null) {
    userReferrals = await API.get(
      session,
      `${CONFIG.base_url_api}/users/list?userPosition=${userReferrerPosition}&&search=${search}`
    )
  }

  return {
    userReferrals,
    kabupaten,
    kecamatan,
    desa,
    session: session,
    isError: false
  }
}

export let action: ActionFunction = async ({ request }) => {
  const session: ISessionModel | any = await checkSession(request)
  if (!session) return redirect('/login')

  let formData = await request.formData()
  try {
    if (request.method == 'POST') {
      const payload: IUserCreateRequestModel | any = {
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

      await API.post(session, CONFIG.base_url_api + '/users', payload)

      return redirect('/user-data')
    }
    return { isError: false, request }
  } catch (error: any) {
    console.log(error)
    return { ...error, isError: true }
  }
}

interface IHistoryField {
  kabupatenSelected: IKabupatenModel
  kecamatanSelected: IKecamatanModel
  desaSelected: IDesaModel
  relawanTim: IRelawanModel
  relawanTimNameSelected: string
  relawanNameSelected: string
}

export default function Index() {
  const navigation = [{ title: 'data pemilu', href: '', active: true }]
  const loader = useLoaderData()

  console.log(loader)

  if (loader.isError) {
    return (
      <h1 className='text-center font-bold text-3xl text-red-600'>
        {loader.error?.messsage || 'error'}
      </h1>
    )
  }

  const submit = useSubmit()
  const actionData = useActionData()

  const kabupaten: IKabupatenModel[] = loader.kabupaten
  const kecamatan: IKecamatanModel[] = loader.kecamatan
  const desa: IDesaModel[] = loader.desa

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

    const getFiledHistory = localStorage.getItem('historyField')
    if (getFiledHistory) {
      const history: IHistoryField = JSON.parse(getFiledHistory)
      setKabupatenSelected(history.kabupatenSelected)
      setKecamatanSelected(history.kecamatanSelected)
      setDesaSelected(history.desaSelected)
    }
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

  const submitData = async (e: React.FormEvent<HTMLFormElement>) => {
    const historyField = {
      kabupatenSelected,
      kecamatanSelected,
      desaSelected
    }

    localStorage.setItem('historyField', JSON.stringify(historyField))

    submit(e.currentTarget, {
      method: 'post',
      action: `/user-data/create-auto`
    })
  }

  const userPositionList: string[] = ['korwil', 'korcam', 'kordes', 'kortps', 'pemilih']

  useEffect(() => {
    switch (userPosition) {
      case 'korwil':
        setUserReferrerPositionList([])
        break
      case 'korcam':
        setUserReferrerPositionList(['korwil'])
        break
      case 'kordes':
        setUserReferrerPositionList(['korwil', 'korcam'])
        break
      case 'kortps':
        setUserReferrerPositionList(['korwil', 'korcam', 'kordes'])
        break
      case 'pemilih':
        setUserReferrerPositionList(['korwil', 'korcam', 'kordes', 'kortps'])
        break
      default:
        break
    }
  }, [userPosition])

  const handleModalOnSelect = (item: { userId: string; userName: string }) => {
    setUserReferrerId(item.userId)
    setUserReferrerName(item.userName)
  }

  return (
    <div className=''>
      <Breadcrumb title='Tambah Data Otomatis' navigation={navigation} />
      {actionData?.isError && (
        <div className='p-4 my-5 text-sm text-red-800 rounded-lg bg-red-50' role='alert'>
          <span className='font-medium'>Error</span> {actionData.message}
        </div>
      )}
      <Form
        method={'post'}
        onSubmit={submitData}
        className='bg-white rounded-xl p-5 sm:p-10'
      >
        <div className='sm:my-6 flex flex-col sm:flex-row gap-5'>
          <div className='w-full sm:w-1/2'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>Nama</label>
            <input
              name='userName'
              type='text'
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
              required
              placeholder='nama...'
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
            />
          </div>
        </div>

        <div className='sm:my-6 flex flex-col sm:flex-row gap-5'>
          <div className='w-full sm:w-1/2'>
            <div className='my-2'>
              <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Kabupaten
              </label>

              <select
                onChange={(e) => setKabupatenSelected(JSON.parse(e.target.value))}
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              >
                {kabupatenSelected ? (
                  <option value={JSON.stringify(kabupatenSelected)}>
                    {kabupatenSelected?.kabupatenName}
                  </option>
                ) : (
                  <option>Pilih Kabupaten</option>
                )}
                {kabupatenList.map((item: IKabupatenModel, index) => (
                  <option key={index} value={JSON.stringify(item)}>
                    {item.kabupatenName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='w-full sm:w-1/2'>
            <div className='my-2'>
              <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Kecamatan
              </label>
              <select
                onChange={(e) => setKecamatanSelected(JSON.parse(e.target.value))}
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              >
                {kecamatanSelected ? (
                  <option value={JSON.stringify(kecamatanSelected)}>
                    {kecamatanSelected?.kecamatanName}
                  </option>
                ) : (
                  <option>Pilih Kecamatan</option>
                )}
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
              <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Desa
              </label>
              <select
                onChange={(e) => setDesaSelected(JSON.parse(e.target.value))}
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              >
                {desaSelected ? (
                  <option value={JSON.stringify(desaSelected)}>
                    {desaSelected?.desaName}
                  </option>
                ) : (
                  <option>Pilih Desa</option>
                )}
                {desaList.map((item) => (
                  <option key={item.desaId} value={JSON.stringify(item)}>
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
                console.log(e.target.value)
              }}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            >
              <option>Pilih Jabatan</option>
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
                <option>Pilih Jabatan Referrer</option>
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

        <input hidden name='userReferrerId' value={userReferrerId} />
        <input hidden name='userReferrerName' value={userReferrerName} />
        <input hidden name='userReferrerPosition' value={userReferrerPosition} />
        <input hidden name='userPosition' value={userPosition} />
        <input hidden name='userDesa' value={desaSelected?.desaName} />
        <input hidden name='userDesaId' value={desaSelected?.desaId} />
        <input hidden name='userKecamatan' value={kecamatanSelected?.kecamatanName} />
        <input hidden name='userKecamatanId' value={kecamatanSelected?.kecamatanId} />
        <input hidden name='userKabupaten' value={kabupatenSelected?.kabupatenName} />
        <input hidden name='userKabupatenId' value={kabupatenSelected?.kabupatenId} />

        <div className='flex justify-end mt-4'>
          <button
            type='submit'
            className='inline-flex justify-center w-32 rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm'
          >
            Submit
          </button>
        </div>
      </Form>

      {isOpenModal && (
        <Modal
          isOpenModal={isOpenModal}
          setIsOpenModal={setIsOpenModal}
          loader={loader}
          searchUserReferrer={userReferrerPosition ?? ''}
          onSelected={handleModalOnSelect}
        />
      )}
    </div>
  )
}

interface ModalTypes {
  isOpenModal: any
  setIsOpenModal: any
  searchUserReferrer: string
  loader: any
  onSelected: any
}

const Modal = ({
  isOpenModal,
  setIsOpenModal,
  searchUserReferrer,
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
                submit(e.currentTarget, { action: '/user-data/create-auto' })
              }
              method='get'
            >
              <div className='flex flex-row '>
                <input
                  type='hidden'
                  name='searchUserReferrer'
                  value={searchUserReferrer}
                />
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
