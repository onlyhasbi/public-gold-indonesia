import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToast } from '../components/toast'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

const schema = yup.object().shape({
  pgcode: yup.string().required('PGCode wajib diisi'),
  katasandi: yup.string().min(6, 'Password minimal 6 karakter').required('Password wajib diisi'),
  pageid: yup.string().matches(/^[a-z0-9\-]+$/, 'Hanya huruf kecil, angka, dan strip (-) yang diperbolehkan').required('Page ID wajib diisi'),
  country_code: yup.string().default('62'),
  no_telpon: yup.string().required('No. Telepon wajib diisi'),
})

function SignupPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Redirect if already logged in as PGBO
  useEffect(() => {
    document.title = "Daftar | Public Gold Indonesia";
    const token = localStorage.getItem('token')
    if (token) {
      navigate({ to: '/overview', replace: true })
    }
  }, [navigate])

  const [showPassword, setShowPassword] = useState(false)
  const [namaLengkap, setNamaLengkap] = useState<string | null>(null)
  const [isPgcodeValid, setIsPgcodeValid] = useState(false)
  const [isVerifyingPgcode, setIsVerifyingPgcode] = useState(false)
  const [pageIdError, setPageIdError] = useState<string | null>(null)
  const [isPageIdValid, setIsPageIdValid] = useState(false)
  const [isVerifyingPageId, setIsVerifyingPageId] = useState(false)

  const checkPageId = async (pageid: string): Promise<boolean> => {
    if (!pageid || pageid.length < 3) return true;
    try {
      const res = await api.get(`/auth/check-pageid?pageid=${pageid}`)
      return res.data.isAvailable
    } catch {
      return true
    }
  }

  const fetchIntroducerName = async (pgcode: string) => {
    if (isPgcodeValid) return;
    
    if (!pgcode || pgcode.length < 6) {
      setNamaLengkap(null);
      setIsPgcodeValid(false);
      return;
    }

    setIsVerifyingPgcode(true);
    try {
      const params = new URLSearchParams();
      params.append('pgcode', pgcode);
      const res = await fetch('/api-proxy/index.php?route=account/register/getIntroducer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params.toString()
      });
      const data = await res.json();
      if (data.success && data.name) {
        setNamaLengkap(data.name.trim());
        setIsPgcodeValid(true);
      } else {
        setNamaLengkap(null);
        setIsPgcodeValid(false);
      }
    } catch (error) {
      console.error("Failed to auto-fetch PGCode name", error);
      setNamaLengkap(null);
      setIsPgcodeValid(false);
    } finally {
      setIsVerifyingPgcode(false);
    }
  };

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
      pageid: '',
      country_code: '62',
      no_telpon: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/register', data)
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        showToast(data.message, 'success')
        navigate({ to: '/overview' })
      } else {
        showToast(data.message, 'error')
      }
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Registrasi gagal', 'error')
    },
  })

  const onSubmit = (data: any) => {
    let finalPhone = undefined;
    if (data.no_telpon) {
      const cleanPhone = data.no_telpon.replace(/^0+/, '')
      finalPhone = `${data.country_code}${cleanPhone}`
    }
    mutation.mutate({ ...data, role: "pgbo", nama_lengkap: namaLengkap || undefined, no_telpon: finalPhone })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Pendaftaran</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={mutation.isPending} className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-slate-700">PGCode</label>
              {namaLengkap && (
                <p className="text-xs text-slate-500 text-right ml-2 font-medium">{namaLengkap}</p>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                {...register('pgcode', {
                  onChange: () => {
                    if (isPgcodeValid) {
                      setIsPgcodeValid(false);
                      setNamaLengkap(null);
                    }
                  },
                  onBlur: (e) => fetchIntroducerName(e.target.value)
                })}
                className={`w-full px-4 py-2 pr-10 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${errors.pgcode ? 'border-red-500' : 'border-slate-300'}`}
                placeholder="Contoh: PG123456"
              />
              {isVerifyingPgcode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
              )}
              {isPgcodeValid && !isVerifyingPgcode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
            {errors.pgcode && <p className="mt-1 text-sm text-red-500">{errors.pgcode.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon (WhatsApp)</label>
            <div className="flex bg-white rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-red-500 focus-within:outline-none">
              <select
                {...register('country_code')}
                className="bg-slate-50 px-3 py-2 text-slate-700 border-none focus:ring-0 outline-none border-r border-slate-300"
              >
                <option value="62">🇮🇩 +62</option>
                <option value="60">🇲🇾 +60</option>
                <option value="65">🇸🇬 +65</option>
              </select>
              <input
                type="text"
                {...register('no_telpon')}
                className="flex-1 w-full px-4 py-2 bg-transparent border-none focus:ring-0 outline-none"
                placeholder="8123456789"
              />
            </div>
            {errors.no_telpon && <p className="mt-1 text-sm text-red-500">{errors.no_telpon.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('katasandi')}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${errors.katasandi ? 'border-red-500' : 'border-slate-300'}`}
                placeholder="Katasandi minimal 6 karakter"
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
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-slate-700">Page ID (Unik)</label>
              {(errors.pageid || pageIdError) && (
                <p className="text-xs text-red-500 text-right ml-2">{errors.pageid?.message || pageIdError as string}</p>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                {...register('pageid', {
                  onChange: () => {
                    if (isPageIdValid) setIsPageIdValid(false);
                    if (pageIdError) setPageIdError(null);
                  },
                  onBlur: async (e) => {
                    if (isPageIdValid) return;
                    if (e.target.value.length >= 3) {
                      setIsVerifyingPageId(true);
                      const isAvailable = await checkPageId(e.target.value)
                      setIsVerifyingPageId(false);
                      if (!isAvailable) {
                        setPageIdError('Page ID ini sudah terdaftar')
                        setIsPageIdValid(false)
                      } else {
                        setPageIdError(null)
                        setIsPageIdValid(true)
                      }
                    } else {
                      setPageIdError(null)
                      setIsPageIdValid(false)
                    }
                  }
                })}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${errors.pageid || pageIdError ? 'border-red-500' : 'border-slate-300'}`}
                placeholder="Contoh: my-gold-shop"
              />
              {isVerifyingPageId && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
              )}
              {isPageIdValid && !isVerifyingPageId && !errors.pageid && !pageIdError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
          </div>
          <button
              type="submit"
              disabled={mutation.isPending || !isValid || !!pageIdError}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Daftar...' : 'Daftar'}
            </button>
          </fieldset>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Sudah punya akun? <a onClick={() => navigate({ to: '/signin' })} className="text-red-600 hover:underline cursor-pointer">Login di sini</a>
        </p>
      </div>
    </div>
  )
}
