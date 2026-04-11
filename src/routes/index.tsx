import { createFileRoute, redirect, useNavigate, useSearch } from '@tanstack/react-router'
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  Check
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Spinner } from '../components/ui/spinner'
import { api } from '../lib/api'
import { motion, AnimatePresence } from 'motion/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '../components/toast'

// --- Validation Schemas ---
const signinSchema = yup.object().shape({
  pgcode: yup.string().required('PGCode wajib diisi'),
  katasandi: yup.string().required('Password wajib diisi'),
})

const signupSchema = yup.object().shape({
  pgcode: yup.string().required('PGCode wajib diisi'),
  katasandi: yup.string().min(6, 'Password minimal 6 karakter').required('Password wajib diisi'),
  pageid: yup.string().matches(/^[a-zA-Z0-9_\-]+$/, 'Hanya alfabet, angka, underscore (_), atau strip (-) yang diperbolehkan').required('Page ID wajib diisi'),
  country_code: yup.string().default('62'),
  no_telpon: yup.string().required('No. Telepon wajib diisi'),
})

// --- Route Definition ---
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      throw redirect({ to: '/overview', replace: true })
    }
    
    throw redirect({
      to: '/$pgcode',
      params: { pgcode: 'hasbi' },
      replace: true,
    })
  },
  validateSearch: (search: Record<string, unknown>): { mode?: 'signin' | 'signup' } => {
    return {
      mode: (search.mode as 'signin' | 'signup') || undefined,
    }
  },
  component: LandingAuthPage,
})

function LandingAuthPage() {
  const navigate = useNavigate()
  const { mode } = useSearch({ from: '/' })
  const { showToast } = useToast()

  // --- UI States ---
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(mode || 'signin')
  const [showPassword, setShowPassword] = useState(false)

  // --- Secret Code States ---
  const [secretCode, setSecretCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState<number>(0)
  const [isVerifying, setIsVerifying] = useState(false)

  // --- Signup Logic States ---
  const [namaLengkap, setNamaLengkap] = useState<string | null>(null)
  const [isPgcodeValid, setIsPgcodeValid] = useState(false)
  const [isVerifyingPgcode, setIsVerifyingPgcode] = useState(false)
  const [pageIdError, setPageIdError] = useState<string | null>(null)
  const [isPageIdValid, setIsPageIdValid] = useState(false)
  const [isVerifyingPageId, setIsVerifyingPageId] = useState(false)


  // Sync mode from URL search param
  useEffect(() => {
    if (mode) setAuthMode(mode)
  }, [mode])

  // lockout timer logic
  useEffect(() => {
    const storedLockout = localStorage.getItem('portal_lock_expiry');
    if (storedLockout) {
      const expiry = parseInt(storedLockout, 10);
      const now = Date.now();
      if (expiry > now) {
        setLockoutTime(Math.ceil((expiry - now) / 1000));
      } else {
        localStorage.removeItem('portal_lock_expiry')
      }
    }
  }, [])

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            localStorage.removeItem('portal_lock_expiry')
            setAttempts(0)
            setErrorMsg('')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockoutTime])

  // --- Form Hooks ---
  const signinForm = useForm({
    resolver: yupResolver(signinSchema),
    mode: 'onChange',
    defaultValues: { pgcode: '', katasandi: '' },
  })

  const signupForm = useForm({
    resolver: yupResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { pgcode: '', katasandi: '', pageid: '', country_code: '62', no_telpon: '' },
  })

  // --- Mutations ---
  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/login', { identifier: data.pgcode, katasandi: data.katasandi })
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

  const registerMutation = useMutation({
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

  // --- Helper Functions ---
  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutTime > 0 || isVerifying) return
    setIsVerifying(true)
    setErrorMsg('')
    try {
      const res = await api.post('/public/portal/verify', { code: secretCode })
      if (res.data.success) {
        setIsUnlocked(true)
        setErrorMsg('')
        setAttempts(0)
      }
    } catch (error: any) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      const isLockout = newAttempts >= 5
      if (isLockout) {
        const expiryTime = Date.now() + 5 * 60 * 1000
        localStorage.setItem('portal_lock_expiry', expiryTime.toString())
        setLockoutTime(300)
      }
      setErrorMsg(isLockout ? 'Banyak percobaan yang salah' : (error.response?.data?.message || 'Secret code salah.'))
    } finally {
      setIsVerifying(false)
      setSecretCode('')
    }
  }

  const fetchIntroducerName = async (pgcode: string) => {
    if (isPgcodeValid || !pgcode || pgcode.length < 6) {
      if (!pgcode || pgcode.length < 6) {
        setNamaLengkap(null);
        setIsPgcodeValid(false);
      }
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
      setNamaLengkap(null);
      setIsPgcodeValid(false);
    } finally {
      setIsVerifyingPgcode(false);
    }
  };

  const checkPageId = async (pageid: string): Promise<boolean> => {
    if (!pageid || pageid.length < 3) return true;
    try {
      const res = await api.get(`/auth/check-pageid?pageid=${pageid}`)
      return res.data.isAvailable
    } catch {
      return true
    }
  }

  const onSigninSubmit = (data: any) => loginMutation.mutate(data)
  const onSignupSubmit = (data: any) => {
    let finalPhone = undefined;
    if (data.no_telpon) {
      const cleanPhone = data.no_telpon.replace(/^0+/, '')
      finalPhone = `${data.country_code}${cleanPhone}`
    }
    registerMutation.mutate({ ...data, role: "pgbo", nama_lengkap: namaLengkap || undefined, no_telpon: finalPhone })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }

  const formVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.4 } },
  }


  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#020617] overflow-hidden px-6 font-sans">

      {/* Refined Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-900/10 via-[#020617] to-[#020617] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-600/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay" />

      {/* Main Container - Centered Stack */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-xl flex flex-col items-center gap-10 md:gap-12"
      >
        {/* Row 1: Brand Presentation (Horizontal like sketch) */}
        <AnimatePresence>
          {lockoutTime === 0 && !isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center justify-center gap-6 md:gap-8 w-full max-w-lg mb-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 relative p-4 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"
              >
                <img
                  src="/5g.webp"
                  alt="Logo"
                  className="w-14 h-14 md:w-16 md:h-16 object-contain brightness-110"
                />
              </motion.div>

              <div className="flex flex-col text-left">
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  PGBO Portal
                </h1>
                <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed max-w-[280px]">
                  Dashboard eksklusif untuk pantau bisnismu secara real-time.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 2: Interactive Access Field */}
        <div className="w-full max-w-md relative self-center">
          <div className={`relative transition-all duration-1000 ease-[0.2, 1, 0.2, 1] w-full ${isUnlocked
            ? 'bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-1 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)]'
            : 'p-0'
            }`}>
            {isUnlocked && (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.02] to-indigo-500/[0.02] rounded-[2.5rem] pointer-events-none" />
            )}

            <div className={`${isUnlocked ? 'p-6 sm:p-8 bg-[#0f172a]/20 rounded-[2.25rem] border border-white/5 overflow-hidden' : ''}`}>
              <AnimatePresence mode="wait">
                {!isUnlocked ? (
                  <motion.div
                    key="secret-gate"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full"
                  >
                    {lockoutTime > 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-6">
                        <div className="relative">
                          {/* Pulsing Alert Rings */}
                          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse" />
                          <div className="absolute inset-0 border-2 border-rose-500/30 rounded-full animate-ping duration-[3000ms]" />
                          <div className="relative p-6 bg-[#020617] rounded-full border border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]">
                            <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-col items-center">
                            <span className="text-rose-400 font-mono text-5xl font-black tracking-widest tabular-nums drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                              {formatTime(lockoutTime)}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-rose-500/90 text-[11px] font-black">{errorMsg}</p>
                            <p className="text-slate-500 text-[9px] font-medium max-w-[200px] mx-auto leading-relaxed">
                              Portal dikunci sementara.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSecretSubmit} className="relative group">
                        {/* Glow effect */}
                        <div className="absolute -inset-[1px] bg-white/10 rounded-xl opacity-20 group-focus-within:opacity-100 transition duration-700" />

                        <div className="relative flex items-center bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden focus-within:border-white/20 transition-all">
                          <input
                            type="password"
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                            placeholder="Kode akses"
                            className="flex-1 bg-transparent text-white px-7 py-4.5 focus:outline-none placeholder:text-slate-600 text-lg font-medium"
                            autoFocus
                          />

                          {/* Integrated Action Button */}
                          <button
                            type="submit"
                            disabled={lockoutTime > 0 || isVerifying || secretCode.length < 3}
                            className="mr-3 p-3.5 bg-white text-[#020617] rounded-xl shadow-lg transition-all hover:bg-slate-200 active:scale-90 disabled:opacity-20 flex items-center justify-center"
                          >
                            {isVerifying ? (
                              <Spinner size={20} className="text-[#020617]" />
                            ) : (
                              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                            )}
                          </button>
                        </div>

                        {errorMsg && (
                          <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="absolute -bottom-7 left-0 w-full text-center text-[10px] text-rose-500 font-bold tracking-wide"
                          >
                            {errorMsg} {attempts > 0 && attempts < 5 && <span>({attempts}/5)</span>}
                          </motion.p>
                        )}
                      </form>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="auth-content"
                    initial={{ opacity: 0, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    className="space-y-8"
                  >
                    {/* Simplified Tabs */}
                    <div className="flex p-1 bg-slate-950/50 rounded-xl border border-white/5">
                      <button
                        onClick={() => setAuthMode('signin')}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-500 ${authMode === 'signin'
                          ? 'bg-rose-600 text-white shadow-xl shadow-rose-950/40'
                          : 'text-slate-500 hover:text-slate-300'
                          }`}
                      >
                        Masuk
                      </button>
                      <button
                        onClick={() => setAuthMode('signup')}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-500 ${authMode === 'signup'
                          ? 'bg-rose-600 text-white shadow-xl shadow-rose-950/40'
                          : 'text-slate-500 hover:text-slate-300'
                          }`}
                      >
                        Daftar
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {authMode === 'signin' ? (
                        <motion.form
                          key="signin-form"
                          className="space-y-5"
                          variants={formVariants} initial="initial" animate="animate" exit="exit"
                          onSubmit={signinForm.handleSubmit(onSigninSubmit)}
                        >
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 pl-1">PGCode</label>
                              <input
                                {...signinForm.register('pgcode', {
                                  onChange: (e) => {
                                    const value = e.target.value;
                                    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
                                    if (value !== sanitized) signinForm.setValue('pgcode', sanitized);
                                  }
                                })}
                                placeholder="Contoh: PG123456"
                                className={`w-full bg-slate-950/20 border ${signinForm.formState.errors.pgcode ? 'border-rose-500/30' : 'border-white/5'} rounded-xl py-3.5 px-6 text-white focus:outline-none focus:border-rose-500/40 transition-all placeholder:text-slate-700 font-medium`}
                              />
                              {signinForm.formState.errors.pgcode && <p className="text-[10px] text-rose-500 font-bold pl-1">{signinForm.formState.errors.pgcode.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 pl-1">Password</label>
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  {...signinForm.register('katasandi')}
                                  placeholder="Masukkan password"
                                  className={`w-full bg-slate-950/20 border ${signinForm.formState.errors.katasandi ? 'border-rose-500/30' : 'border-white/5'} rounded-xl py-3.5 px-6 text-white focus:outline-none focus:border-rose-500/40 transition-all placeholder:text-slate-700 font-medium`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600">
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                              {signinForm.formState.errors.katasandi && <p className="text-[10px] text-rose-500 font-bold pl-1">{signinForm.formState.errors.katasandi.message}</p>}
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loginMutation.isPending || !signinForm.formState.isValid}
                            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-xl font-bold shadow-2xl shadow-rose-950/20 transition-all active:scale-[0.98] disabled:opacity-20"
                          >
                            {loginMutation.isPending ? <Spinner size={20} className="text-white" /> : "Masuk Portal"}
                          </button>
                        </motion.form>
                      ) : (
                        <motion.form
                          key="signup-form"
                          className="space-y-6"
                          variants={formVariants} initial="initial" animate="animate" exit="exit"
                          onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                        >
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center px-1">
                                <label className="text-[11px] font-bold text-slate-500">Dealer PGCode</label>
                                {namaLengkap && <span className="text-[10px] text-emerald-500 font-bold">{namaLengkap}</span>}
                              </div>
                              <div className="relative">
                                <input
                                  {...signupForm.register('pgcode', {
                                    onChange: (e) => {
                                      const value = e.target.value;
                                      const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
                                      if (value !== sanitized) signupForm.setValue('pgcode', sanitized);
                                      if (isPgcodeValid) { setIsPgcodeValid(false); setNamaLengkap(null); }
                                    },
                                    onBlur: (e) => fetchIntroducerName(e.target.value)
                                  })}
                                  placeholder="PG123456"
                                  className={`w-full bg-slate-950/20 border ${signupForm.formState.errors.pgcode ? 'border-rose-500/30' : 'border-white/5'} rounded-xl py-3.5 px-6 text-white focus:outline-none focus:border-rose-500/40 transition-all font-medium`}
                                />
                                <div className="absolute right-6 inset-y-0 flex items-center">
                                  {isVerifyingPgcode ? <Spinner size={18} className="text-slate-500" /> : isPgcodeValid && <Check className="w-5 h-5 text-emerald-500" />}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 pl-1">WhatsApp</label>
                                <div className="flex bg-slate-950/20 border border-white/5 rounded-xl overflow-hidden focus-within:border-rose-500/40">
                                  <select
                                    {...signupForm.register('country_code')}
                                    className="bg-transparent text-slate-400 pl-4 py-3.5 border-none focus:ring-0 outline-none text-xs font-bold appearance-none cursor-pointer"
                                  >
                                    <option value="62" className="bg-[#020617]">🇮🇩 +62</option>
                                    <option value="60" className="bg-[#020617]">🇲🇾 +60</option>
                                  </select>
                                  <input
                                    {...signupForm.register('no_telpon', {
                                      onChange: (e) => {
                                        const value = e.target.value;
                                        const sanitized = value.replace(/[^0-9]/g, '');
                                        if (value !== sanitized) signupForm.setValue('no_telpon', sanitized);
                                      }
                                    })}
                                    placeholder="812..."
                                    className="flex-1 bg-transparent px-3 py-3.5 text-white focus:outline-none text-sm font-medium"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 pl-1">Custom Page ID</label>
                                <div className="relative">
                                  <input
                                    {...signupForm.register('pageid', {
                                      onChange: (e) => {
                                        const value = e.target.value;
                                        const sanitized = value.replace(/[^a-zA-Z0-9_\-]/g, '');
                                        if (value !== sanitized) {
                                          signupForm.setValue('pageid', sanitized);
                                        }
                                        if (isPageIdValid) setIsPageIdValid(false);
                                        if (pageIdError) setPageIdError(null);
                                      },
                                      onBlur: async (e) => {
                                        if (e.target.value.length >= 3) {
                                          setIsVerifyingPageId(true);
                                          const isAvailable = await checkPageId(e.target.value);
                                          setIsVerifyingPageId(false);
                                          if (!isAvailable) { setPageIdError('Taken'); setIsPageIdValid(false); }
                                          else { setPageIdError(null); setIsPageIdValid(true); }
                                        }
                                      }
                                    })}
                                    placeholder="page-id"
                                    className={`w-full bg-slate-950/20 border ${signupForm.formState.errors.pageid || pageIdError ? 'border-rose-500/30' : 'border-white/5'} rounded-xl py-3.5 px-6 text-white focus:outline-none text-base font-medium`}
                                  />
                                  <div className="absolute right-6 inset-y-0 flex items-center">
                                    {isVerifyingPageId ? <Spinner size={18} className="text-slate-500" /> : isPgcodeValid && isPageIdValid && !pageIdError && <Check className="w-5 h-5 text-emerald-500" />}
                                  </div>
                                </div>
                                {pageIdError === 'Taken' && <p className="text-[10px] text-rose-500 font-bold pl-1 mt-1">Page ID sudah digunakan</p>}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 pl-1">Password</label>
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  {...signupForm.register('katasandi')}
                                  placeholder="Min. 6 Karakter"
                                  className={`w-full bg-slate-950/20 border ${signupForm.formState.errors.katasandi ? 'border-rose-500/30' : 'border-white/5'} rounded-xl py-3.5 px-6 text-white focus:outline-none focus:border-rose-500/40 transition-all font-medium`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600">
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={registerMutation.isPending || !signupForm.formState.isValid || !isPgcodeValid || !isPageIdValid || !!pageIdError}
                            className="w-full py-3.5 mt-2 bg-white text-[#020617] rounded-xl font-bold shadow-xl transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center"
                          >
                            {registerMutation.isPending ? <Spinner size={20} className="text-[#020617]" /> : "Buat Akun Portal"}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <AnimatePresence>
          {lockoutTime === 0 && !isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-6 opacity-30 mt-4 font-bold text-[10px] text-white"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Keamanan Portal Terjamin
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>

  )
}
