import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, ShieldCheck, KeyRound, AlertCircle, Clock, LogIn, UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: LandingAuthPage,
})

function LandingAuthPage() {
  const navigate = useNavigate()

  // Secret Code States
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [secretCode, setSecretCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState<number>(0)

  // Initialize lockout from localStorage just in case of refresh
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

  // Timer countdown hook
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            localStorage.removeItem('portal_lock_expiry')
            setAttempts(0) // reset attempts when lockout ends
            setErrorMsg('')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockoutTime])

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lockoutTime > 0) return

    // Securely check the secret code using SHA-256 hashing so the plaintext never appears in the JS bundle
    const encoder = new TextEncoder()
    const data = encoder.encode(secretCode.toLowerCase().trim())
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (hashHex === '2044fbdb55f9238637ff4adbdd07a491f8225a62b4db057bca43b73de9b3abad') {
      setIsUnlocked(true)
      setErrorMsg('')
      setAttempts(0)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 5) {
        // Calculate 5 minutes from now
        const expiryTime = Date.now() + 5 * 60 * 1000;
        localStorage.setItem('portal_lock_expiry', expiryTime.toString());
        setLockoutTime(300) // 300 seconds = 5 minutes
        setErrorMsg('Terlalu banyak percobaan yang salah.')
      } else {
        setErrorMsg('Secret code salah.')
      }
      setSecretCode('')
    }
  }

  // Format MM:SS for countdown timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-slate-950 overflow-hidden px-4 selection:bg-red-500/30">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -left-40 w-80 h-80 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
          <div className="inline-flex items-center justify-center p-3.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 mb-6 shadow-2xl">
            <img 
              src="/5g.webp" 
              alt="Public Gold" 
              className="w-14 h-14 object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            PGBO Portal
          </h1>
          <p className="text-slate-400 text-sm max-w-[280px] leading-relaxed">
            Kelola halaman pendaftaran dan ringkasan performa Anda dengan mudah.
          </p>
        </div>

        {/* Dynamic Container: Transparent initially, Glassmorphism card when unlocked */}
        <div className={`transition-all duration-700 ease-out fill-mode-both ${
          isUnlocked 
            ? 'bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95' 
            : 'p-2 sm:p-4 animate-in fade-in slide-in-from-bottom-8 delay-150'
        }`}>
          
          {!isUnlocked ? (
            <div className="flex flex-col">
              {lockoutTime > 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 mt-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="text-red-400 font-mono text-xl font-bold tracking-widest leading-none translate-y-[1px]">{formatTime(lockoutTime)}</span>
                  </div>
                  <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
                  <p className="text-slate-400 text-xs">Silahkan coba lagi dalam 5 menit.</p>
                </div>
              ) : (
                <form onSubmit={handleSecretSubmit} className="flex flex-col">
                  <div className={`relative flex items-center bg-slate-950/80 border ${errorMsg ? 'border-red-500/50 focus-within:border-red-500 max-w-[280px] mx-auto w-full' : 'border-slate-800 focus-within:border-slate-500 w-full'} rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-slate-500 transition-colors`}>
                    <div className="pl-4 text-slate-500 flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input 
                      type="password" 
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      placeholder="Secret code..."
                      className="flex-1 bg-transparent text-white px-3 py-3 focus:outline-none placeholder-slate-600"
                      autoFocus
                    />
                    <button 
                      type="submit"
                      disabled={!secretCode}
                      className="w-8 h-8 mr-2 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 disabled:bg-transparent disabled:text-slate-600 text-white transition-all duration-300"
                      aria-label="Unlock"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  {errorMsg && (
                    <p className="text-xs text-red-400 font-medium flex items-center gap-1 justify-center mt-3">
                      <AlertCircle className="w-3 h-3" /> 
                      {errorMsg} {attempts > 0 && attempts < 5 && <span className="opacity-80">({attempts}/5)</span>}
                    </p>
                  )}
                </form>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => navigate({ to: '/signin' })}
                className="group relative flex items-center justify-center gap-2 py-3.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/50 transition-all duration-300 active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <LogIn className="w-4 h-4 relative" />
                <span className="relative text-sm tracking-wide">Masuk</span>
              </button>
              
              <button 
                onClick={() => navigate({ to: '/signup' })}
                className="flex items-center justify-center gap-2 py-3.5 px-3 bg-transparent border border-slate-700 hover:border-slate-500 hover:bg-white/5 text-slate-300 hover:text-white font-semibold rounded-xl transition-colors duration-300 active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm tracking-wide">Daftar</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
          <span>Koneksi aman terenkripsi (End-to-End)</span>
        </div>
        
      </div>
    </div>
  )
}
