import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition
} from '@remix-run/react'
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { redirect } from '@remix-run/router'
import { Breadcrumb } from '~/components/breadcrumb'
import { checkSession } from '~/services/session'
import { API } from '~/services/api'
import { CONFIG } from '~/config'
import { IWaBlasSettings } from '~/models/waBlas'
import { ISessionModel } from '~/models/sessionModel'
import { useEffect, useRef, useState } from 'react'

export let loader: LoaderFunction = async ({ params, request }) => {
  const session: any = await checkSession(request)
  if (!session) return redirect('/login')
  try {
    const waBlasSettings = await API.get(
      session,
      `${CONFIG.base_url_api}/wa-blas/settings`
    )

    return {
      session: session,
      waBlasSettings: waBlasSettings || '',
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
    if (request.method == 'PATCH') {
      const payload: IWaBlasSettings | any = {
        waBlasSettingsMessage: formData.get('waBlasSettingsMessage'),
        waBlasSettingsImage: formData.get('waBlasSettingsImage') ?? null
      }

      await API.patch(session, CONFIG.base_url_api + '/wa-blas/settings', payload)

      return redirect('/wa-blas/setting')
    }
    return { isError: false, request }
  } catch (error: any) {
    console.log(error)
    return { ...error, isError: true }
  }
}

import { initializeApp } from 'firebase/app'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'

export default function Index() {
  const loader = useLoaderData()
  const firebaseConfig = {
    apiKey: 'AIzaSyBr5A5kQ1Dak_VeVbEcJYeoCi_g8XUVmWU',
    authDomain: 'toren-itera.firebaseapp.com',
    projectId: 'toren-itera',
    storageBucket: 'toren-itera.appspot.com',
    messagingSenderId: '971511034983',
    appId: '1:971511034983:web:4f67c76d98b8baa9fb50c2'
  }
  const app = initializeApp(firebaseConfig)
  const storage = getStorage(app)

  const [imageUrl, setImageUrl] = useState('')

  const handleUploadImage = async () => {
    const selectedFile = fileInputRef.current.files[0]
    const imageRef = ref(storage, 'images-dapil-app/' + 'IMG' + Date.now())
    uploadBytesResumable(imageRef, selectedFile)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          console.log('File available at', url)
          setImageUrl(url)
        })
      })
      .catch((error) => {
        console.error('Upload failed', error)
      })
  }

  if (loader.isError) {
    return (
      <h1 className='text-center font-bold text-xl text-red-600'>
        {loader.message || `Error ${loader.code || ''}!`}
      </h1>
    )
  }

  const waBlasSettings: IWaBlasSettings = loader?.waBlasSettings
  const navigation = [{ title: 'Setting', href: '', active: true }]
  const action = useActionData()
  const submit = useSubmit()
  const transition = useTransition()
  const fileInputRef: any = useRef(null)

  const submitData = async (e: React.FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget, {
      method: 'patch',
      action: `/wa-blas/settings`
    })
  }

  useEffect(() => {
    if (waBlasSettings?.waBlasSettingsImage) {
      setImageUrl(waBlasSettings.waBlasSettingsImage)
    }
  }, [])

  return (
    <div>
      <Breadcrumb title='Wa Blas' navigation={navigation} />

      <Form method={'patch'} onSubmit={submitData}>
        <div className='flex items-center justify-center w-full'>
          {!imageUrl && (
            <label className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white'>
              <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                <svg
                  className='w-8 h-8 mb-4 text-gray-500'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 20 16'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                  />
                </svg>
                <p className='mb-2 text-sm text-gray-500'>
                  <span className='font-semibold'>Click to upload</span> or drag and drop
                </p>
                <p className='text-xs text-gray-500'>
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
              <input
                id='dropzone-file'
                type='file'
                className='hidden'
                ref={fileInputRef}
                onChange={handleUploadImage}
              />
            </label>
          )}
          {imageUrl && (
            <img className='h-auto max-w-full' src={imageUrl} alt='image description' />
          )}
        </div>

        {imageUrl && (
          <div className='flex justify-end mt-4'>
            <button
              onClick={() => setImageUrl('')}
              type='button'
              className='inline-flex justify-center w-32 rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm'
            >
              Hapus
            </button>
          </div>
        )}

        <div className='w-full md:mr-2'>
          <div className='mt-1'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>
              pesan default
            </label>
            <textarea
              className={`min-h-[20rem] resize-y w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
              name='waBlasSettingsMessage'
              defaultValue={waBlasSettings.waBlasSettingsMessage || '...'}
              onInvalid={(e) => e.currentTarget.setCustomValidity('wajib diisi')}
              onInput={(e) => e.currentTarget.setCustomValidity('')}
              placeholder='Pesan'
              required={true}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <input name='waBlasSettingsImage' hidden value={imageUrl} />

        <div className='flex justify-end mt-4'>
          <button
            type='submit'
            className='inline-flex justify-center w-32 rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm'
          >
            {transition?.submission ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Form>
    </div>
  )
}
