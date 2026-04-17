import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  MessageCircle,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useToast } from '../components/toast'
import { Spinner } from '../components/ui/spinner'
import { api } from '../lib/api'
import { requireGuest } from '../lib/auth'

const MotionCard = motion.create(Card)

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
  beforeLoad: () => requireGuest(),
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
        if (data.user?.role !== 'pgbo') {
          showToast('Akses ditolak. Akun ini bukan Dealer PGBO.', 'error')
          return
        }
        if (data.user?.is_active === false || data.user?.is_active === 0 || !data.user?.is_active) {
          showToast('Akun Anda sedang dinonaktifkan atau belum aktif. Silakan hubungi admin.', 'error')
          return
        }
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
        if (data.user?.role !== 'pgbo') {
          showToast('Registrasi berhasil, namun akses portal ditolak.', 'error')
          return
        }
        if (data.user?.is_active === false || data.user?.is_active === 0 || data.user?.is_active === undefined) {
          showToast('Registrasi berhasil. Tunggu verifikasi admin untuk aktif.', 'success')
          signupForm.reset()
          setAuthMode('signin')
          return
        }
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
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50 overflow-hidden px-6 font-sans">

      {/* Refined Background Layers - Minimalist */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-50/50 via-slate-50 to-slate-50 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container - Centered Stack */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-8 md:gap-10"
      >
        {/* Row 1: Brand Presentation (Minimal) */}
        <AnimatePresence>
          {lockoutTime === 0 && !isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center gap-4 lg:gap-6 w-full max-w-lg mb-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-3 bg-[#000856] rounded-2xl shadow-sm border border-slate-100"
              >
                <img src="https://mypublicgold.com/5g/logo/logo_gold.png" alt="Logo" className="w-12 h-12 object-contain" />
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Interaktif: Gate atau Form Portal */}
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div
              key="secret-gate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-md mx-auto p-8 py-12 md:py-16 bg-white shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden ring-0"
            >
              {lockoutTime > 0 ? (
                <div className="flex flex-col items-center justify-center text-center space-y-8 py-8 transition-all duration-700">
                  <div className="relative flex items-center justify-center">
                    {/* Stellar Security Animation System */}
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-[40px] animate-pulse" />
                    <div className="absolute inset-0 border-2 border-rose-500/30 rounded-full animate-ping [animation-duration:3s]" />

                    <div className="relative p-7 bg-rose-50/80 rounded-full border border-rose-200 shadow-2xl shadow-rose-200/50">
                      <ShieldAlert className="w-10 h-10 text-rose-600" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col items-center">
                      <span className="text-rose-600 font-mono text-5xl font-black tracking-[0.2em] tabular-nums drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                        {formatTime(lockoutTime)}
                      </span>
                    </div>

                    <div className="space-y-1.5 px-4">
                      <p className="text-rose-600 text-xs tracking-[0.05em]">Banyak percobaan yang salah</p>
                      <p className="text-slate-400 text-[11px] font-medium max-w-[200px] mx-auto leading-relaxed">
                        Portal dikunci sementara demi keamanan akun Anda.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSecretSubmit} className="relative group max-w-xs mx-auto space-y-5">

                  <div className="relative flex items-center bg-slate-50/50 border border-slate-100 rounded-lg h-11 p-0.5 focus-within:bg-white focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5 transition-all duration-300">
                    <input
                      type="password"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="••••••"
                      className="flex-1 bg-transparent text-slate-900 text-center pl-8 pr-1 h-full focus:outline-none placeholder:text-slate-200 text-sm font-black tracking-[0.5em] selection:bg-rose-100"
                      autoFocus
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={lockoutTime > 0 || isVerifying || secretCode.length < 3}
                      className="h-9 w-9 bg-slate-900 text-white rounded-md shadow-lg shadow-slate-900/20 transition-colors hover:bg-black disabled:opacity-20 flex items-center justify-center shrink-0"
                    >
                      {isVerifying ? (
                        <Spinner size={14} className="text-white" />
                      ) : (
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      )}
                    </motion.button>
                  </div>

                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-1 text-[10px] text-rose-500 mt-1"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      {errorMsg} {attempts > 0 && attempts < 5 && <span className="opacity-60">({attempts}/5)</span>}
                    </motion.div>
                  )}
                </form>
              )}
            </motion.div>
          ) : (
            <MotionCard
              key="auth-content"
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              className="bg-white rounded-[1.5rem] overflow-hidden shadow-2xl shadow-slate-200/40 border-none ring-0 max-w-lg mx-auto w-full"
            >
              <CardContent className="p-0 flex flex-col h-full">
                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'signin' | 'signup')} className="w-full">
                  <div className="flex justify-center mb-4 pt-4">
                    <TabsList variant="line" className="flex bg-transparent border-none h-auto p-0 gap-8">
                      <TabsTrigger
                        value="signin"
                        className="font-bold rounded-none border-none py-3 text-xs transition-all px-2 text-slate-400 data-[state=active]:text-slate-900 data-[state=active]:after:!bg-slate-900"
                      >
                        Masuk
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="font-bold rounded-none border-none py-3 text-xs transition-all px-2 text-slate-400 data-[state=active]:text-slate-900 data-[state=active]:after:!bg-slate-900"
                      >
                        Daftar
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6 sm:px-10 pb-8 pt-0">
                    <AnimatePresence mode="wait">
                      <TabsContent value="signin" className="mt-0 outline-none">
                        <motion.form
                          key="signin-form"
                          className="space-y-6"
                          variants={formVariants} initial="initial" animate="animate" exit="exit"
                          onSubmit={signinForm.handleSubmit(onSigninSubmit)}
                        >
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <Label className="text-[11px] text-slate-400 ml-1">PGCode</Label>
                              <Input
                                {...signinForm.register('pgcode', {
                                  onChange: (e) => {
                                    const value = e.target.value;
                                    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
                                    if (value !== sanitized) signinForm.setValue('pgcode', sanitized);
                                  }
                                })}
                                placeholder="PG123456"
                                className={cn(
                                  "bg-slate-50/50 border-slate-100 rounded-lg h-11 px-5 text-sm text-slate-900 focus-visible:bg-white focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-900/5 transition-all duration-300 font-semibold placeholder:text-slate-200",
                                  signinForm.formState.errors.pgcode && "border-rose-200 bg-rose-50/30"
                                )}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[11px] text-slate-400 ml-1">Password</Label>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  {...signinForm.register('katasandi')}
                                  placeholder="••••••••"
                                  className={cn(
                                    "bg-slate-50/50 border-slate-100 rounded-lg h-11 px-5 text-sm text-slate-900 focus-visible:bg-white focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-900/5 transition-all duration-300 font-semibold placeholder:text-slate-200",
                                    signinForm.formState.errors.katasandi && "border-rose-200 bg-rose-50/30"
                                  )}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 p-0 text-slate-300 hover:text-slate-500 hover:bg-transparent"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              type="submit"
                              disabled={loginMutation.isPending || !signinForm.formState.isValid}
                              className="font-bold w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm shadow-xl shadow-slate-900/10 transition-all border-none"
                            >
                              {loginMutation.isPending ? <Spinner size={20} className="text-white" /> : "Masuk"}
                            </Button>
                          </motion.div>
                        </motion.form>
                      </TabsContent>

                      <TabsContent value="signup" className="mt-0 outline-none">
                        <motion.form
                          key="signup-form"
                          className="space-y-6"
                          variants={formVariants} initial="initial" animate="animate" exit="exit"
                          onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                        >
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <Label className="text-[11px] text-slate-400">PGCode</Label>
                                {namaLengkap && <span className="text-[10px] text-emerald-600 tracking-tighter">{namaLengkap}</span>}
                              </div>
                              <div className="relative">
                                <Input
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
                                  className={cn(
                                    "bg-slate-50/50 border-slate-100 rounded-lg h-11 px-5 text-sm text-slate-900 focus-visible:bg-white focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-900/5 transition-all duration-300 font-semibold placeholder:text-slate-200",
                                    signupForm.formState.errors.pgcode && "border-rose-200 bg-rose-50/30"
                                  )}
                                />
                                <div className="absolute right-3 inset-y-0 flex items-center">
                                  {isVerifyingPgcode ? <Spinner size={16} className="text-slate-300" /> : isPgcodeValid && <Check className="w-5 h-5 text-emerald-500" />}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[11px] text-slate-400 ml-1">WhatsApp</Label>
                                <div className="flex bg-slate-50/50 border border-slate-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5 transition-all duration-300">
                                  <Select
                                    defaultValue="62"
                                    onValueChange={(val) => signupForm.setValue('country_code', val as string)}
                                  >
                                    <SelectTrigger className="w-[80px] bg-transparent border-none text-slate-500 pl-4 h-11 focus:ring-0 ring-0 shadow-none text-xs hover:bg-slate-100/50 transition-colors">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-100 shadow-2xl rounded-lg">
                                      <SelectItem value="62" className="focus:bg-slate-50 rounded-lg">🇮🇩 +62</SelectItem>
                                      <SelectItem value="60" className="focus:bg-slate-50 rounded-lg">🇲🇾 +60</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    {...signupForm.register('no_telpon', {
                                      onChange: (e) => {
                                        const value = e.target.value;
                                        const sanitized = value.replace(/[^0-9]/g, '');
                                        if (value !== sanitized) signupForm.setValue('no_telpon', sanitized);
                                      }
                                    })}
                                    placeholder="812..."
                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 h-11 px-2 text-slate-900 text-sm font-semibold placeholder:text-slate-200"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[11px] text-slate-400 ml-1">ID Halaman</Label>
                                <div className="relative">
                                  <Input
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
                                    placeholder="username"
                                    className={cn(
                                      "bg-slate-50/50 border-slate-100 rounded-lg h-11 px-5 text-sm text-slate-900 focus-visible:bg-white focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-900/5 transition-all duration-300 font-semibold placeholder:text-slate-200",
                                      (signupForm.formState.errors.pageid || pageIdError) && "border-rose-200 bg-rose-50/30"
                                    )}
                                  />
                                  <div className="absolute right-5 inset-y-0 flex items-center">
                                    {isVerifyingPageId ? <Spinner size={16} className="text-slate-300" /> : isPgcodeValid && isPageIdValid && !pageIdError && <Check className="w-5 h-5 text-emerald-500" />}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[11px] text-slate-400 ml-1">Password Baru</Label>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  {...signupForm.register('katasandi')}
                                  placeholder="Min. 6 Karakter"
                                  className={cn(
                                    "bg-slate-50/50 border-slate-100 rounded-lg h-11 px-5 text-sm text-slate-900 focus-visible:bg-white focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-900/5 transition-all duration-300 font-semibold placeholder:text-slate-200",
                                    signupForm.formState.errors.katasandi && "border-rose-200 bg-rose-50/30"
                                  )}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 p-0 text-slate-300 hover:text-slate-500 hover:bg-transparent"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              type="submit"
                              disabled={registerMutation.isPending || !signupForm.formState.isValid || !isPgcodeValid || !isPageIdValid || !!pageIdError}
                              className="font-bold w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] border-none"
                            >
                              {registerMutation.isPending ? <Spinner size={20} className="text-white" /> : "Buat Akun"}
                            </Button>
                          </motion.div>
                        </motion.form>
                      </TabsContent>
                    </AnimatePresence>
                  </div>
                </Tabs>

                <div className="p-4 sm:p-5 pt-3 border-t border-slate-50 flex flex-col items-center gap-3 bg-transparent">
                  <a
                    href="https://wa.me/628979901844"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 bg-emerald-50 rounded-full">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-[9px] text-slate-400 tracking-wider">Butuh Bantuan? Hubungi Admin</span>
                  </a>
                  <div className="flex items-center gap-3 text-[9px] text-slate-300">
                    <Link to="/legal" search={{ tab: 'terms' }} className="hover:text-slate-500 transition-colors no-underline">Syarat & Ketentuan</Link>
                    <span>•</span>
                    <Link to="/legal" search={{ tab: 'privacy' }} className="hover:text-slate-500 transition-colors no-underline">Privasi</Link>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          )}
        </AnimatePresence>

        {/* Minimal Footer */}
        <AnimatePresence>
          {lockoutTime === 0 && !isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 mt-4"
            >
              <div className="flex items-center justify-center gap-2 opacity-30 text-[9px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Portal Keamanan Terpusat Public Gold
              </div>
              <div className="flex items-center gap-3 text-[9px] text-slate-300 opacity-40">
                <Link to="/legal" search={{ tab: 'terms' }} className="hover:text-slate-500 transition-colors no-underline">Syarat & Ketentuan</Link>
                <span>•</span>
                <Link to="/legal" search={{ tab: 'privacy' }} className="hover:text-slate-500 transition-colors no-underline">Privasi</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>

  )
}
