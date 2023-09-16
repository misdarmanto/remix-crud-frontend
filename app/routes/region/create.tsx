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
import {
  ICreateRegionRequest,
  IDesaModel,
  IKabupatenModel,
  IKecamatanModel
} from '~/models/regionModel'
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
  const relawanTim = await API.get(session, CONFIG.base_url_api + `/relawan-tim/all`)

  return {
    kabupaten,
    kecamatan,
    desa,
    relawanTim,
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
      const payload: ICreateRegionRequest | any = {
        desaName: formData.get('desaName'),
        desaId: formData.get('desaId'),
        kecamatanId: formData.get('kecamatanId'),
        kabupatenId: formData.get('kabupatenId'),
        provinceId: '1'
      }

      await API.post(session, CONFIG.base_url_api + '/region', payload)
      return redirect('/region/all')
    }
    return { isError: false, request }
  } catch (error: any) {
    console.log(error)
    return { ...error, isError: true }
  }
}

export default function Index() {
  const navigation = [{ title: 'buat', href: '', active: true }]
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

  const kabupaten: IKabupatenModel[] = loader.kabupaten
  const kecamatan: IKecamatanModel[] = loader.kecamatan
  const desa: IDesaModel[] = loader.desa
  const lastDesa = desa[desa.length - 1]

  const [kabupatenList, setKabupatenList] = useState<IKabupatenModel[]>([])
  const [kecamatanList, setKecamatanList] = useState<IKecamatanModel[]>([])
  const [desaList, setDesaList] = useState<IDesaModel[]>([])

  const [kabupatenSelected, setKabupatenSelected] = useState<IKabupatenModel>()
  const [kecamatanSelected, setKecamatanSelected] = useState<IKecamatanModel>()
  const [desaSelected, setDesaSelected] = useState<IDesaModel>()

  useEffect(() => {
    const filterKecamatan = kecamatan.filter((item) => item.kabupatenId === '11')
    setKabupatenList(kabupaten)
    setKecamatanList(filterKecamatan)
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
    submit(e.currentTarget, {
      method: 'post',
      action: `/region/create`
    })
  }

  return (
    <div className=''>
      <Breadcrumb title='Tambah Wilayah' navigation={navigation} />
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
            <div className='my-2'>
              <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                Kabupaten
              </label>

              <select
                onChange={(e) => setKabupatenSelected(JSON.parse(e.target.value))}
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              >
                <option>Pilih Kabupaten</option>
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
                <option>Pilih Kecamatan</option>
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
            <div className='w-full sm:w-1/2'>
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Nama Desa
              </label>
              <input
                name='desaName'
                type='text'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
                required
                placeholder='nama desa...'
              />
            </div>
          </div>
        </div>

        <input hidden name='desaId' value={parseInt(lastDesa.desaId) + 1} />
        <input hidden name='kecamatanId' value={kecamatanSelected?.kecamatanId} />
        <input hidden name='kabupatenId' value={kabupatenSelected?.kabupatenId} />

        <div className='flex justify-end mt-4'>
          <button
            type='submit'
            className='inline-flex justify-center w-32 rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm'
          >
            {transition?.submission ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </Form>
    </div>
  )
}
