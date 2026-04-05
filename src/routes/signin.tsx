import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToast } from '../components/toast'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

export const Route = createFileRoute('/signin')({
  component: SigninPage,
})

const schema = yup.object().shape({
  pgcode: yup.string().required('PGCode wajib diisi'),
  katasandi: yup.string().required('Password wajib diisi'),
})

function SigninPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Redirect if already logged in as PGBO
  useEffect(() => {
    document.title = "Login | Public Gold Indonesia";
    const token = localStorage.getItem('token')
    if (token) {
      navigate({ to: '/overview', replace: true })
    }
  }, [navigate])

  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      pgcode: '',
      katasandi: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/login', data)
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate({ to: '/overview' })
      } else {
        showToast(data.message, 'error')
      }
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Login gagal, periksa kredensial Anda', 'error')
    },
  })

  const onSubmit = (data: any) => {
    mutation.mutate({
      identifier: data.pgcode,
      katasandi: data.katasandi
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Masuk</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={mutation.isPending} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">PGCode</label>
            <input
              type="text"
              {...register('pgcode')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${errors.pgcode ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="Contoh: PG123456"
            />
            {errors.pgcode && <p className="mt-1 text-sm text-red-500">{errors.pgcode.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('katasandi')}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${errors.katasandi ? 'border-red-500' : 'border-slate-300'}`}
                placeholder="Katasandi Anda"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 013.168-4.477M6.343 6.343A9.97 9.97 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-4.168 4.477M6.343 6.343L3 3m3.343 3.343l2.829 2.829m4.243 4.243l2.829 2.829M3 3l18 18M9.878 9.878a3 3 0 104.243 4.243" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {errors.katasandi && <p className="mt-1 text-sm text-red-500">{errors.katasandi.message}</p>}
          </div>
          <button
            type="submit"
            disabled={mutation.isPending || !isValid}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Masuk...' : 'Masuk'}
          </button>
          </fieldset>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Belum punya akun? <a onClick={() => navigate({ to: '/signup' })} className="text-red-600 hover:underline cursor-pointer">Daftar di sini</a>
        </p>
      </div>
    </div>
  )
}

