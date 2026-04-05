import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useEffect, useState } from 'react'
import { useToast } from '../components/toast'
import { Users, UserPlus, MessageCircle, Settings, LogOut, ExternalLink, TrendingUp, Copy, Check } from 'lucide-react'

export const Route = createFileRoute('/overview')({
  component: OverviewPage,
})

function OverviewPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    document.title = "Dashboard PGBO | Public Gold Indonesia";
    if (!localStorage.getItem('token')) {
      navigate({ to: '/signin' })
    }
  }, [navigate])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const res = await api.get('/overview')
      return res.data
    },
    retry: 1,
  })

  useEffect(() => {
    if (isError) {
      showToast('Terjadi kesalahan memuat data. Sesi mungkin kadaluarsa.', 'error')
    }
  }, [isError, showToast])

  const [copied, setCopied] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate({ to: '/signin' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-red-200 border-t-red-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <p className="text-slate-700 font-semibold mb-2">Terjadi Kesalahan</p>
          <p className="text-slate-500 text-sm">Sesi mungkin telah kadaluarsa. Silakan login kembali.</p>
          <button
            onClick={() => navigate({ to: '/signin' })}
            className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-all duration-200"
          >
            Login Kembali
          </button>
        </div>
      </div>
    )
  }

  const overview = data?.data
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } })()

  const stats = [
    {
      label: 'Total Pengunjung',
      value: overview?.total_pengunjung || 0,
      icon: Users,
      color: 'bg-red-50 text-red-600',
      accent: 'border-red-100',
    },
    {
      label: 'Total Pendaftar',
      value: overview?.total_pendaftar || 0,
      icon: UserPlus,
      color: 'bg-rose-50 text-rose-600',
      accent: 'border-rose-100',
    },
    {
      label: 'Klik WhatsApp',
      value: overview?.total_klik_whatsapp || 0,
      icon: MessageCircle,
      color: 'bg-emerald-50 text-emerald-600',
      accent: 'border-emerald-100',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  Halo, {user.nama_lengkap || user.pgcode || 'Dealer'}! 👋
                </h1>
                <p className="text-red-100 text-xs sm:text-sm truncate">Pantau performa landing page Anda</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => navigate({ to: '/settings' })}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border border-white/20"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Pengaturan</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border border-white/20"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 pb-10 space-y-5 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-white rounded-2xl shadow-sm border ${stat.accent} p-5 sm:p-6 hover:shadow-md transition-all duration-300 group`}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">{stat.value.toLocaleString()}</p>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Link */}
        {user.pageid && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-700 mb-0.5">Link Landing Page Anda</p>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-red-600 font-medium truncate">
                  {import.meta.env.DEV ? `localhost:5173/${user.pageid}` : `mypublicgold.id/${user.pageid}`}
                </p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      const url = import.meta.env.DEV ? `http://localhost:5173/${user.pageid}` : `https://mypublicgold.id/${user.pageid}`
                      navigator.clipboard.writeText(url)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-all duration-200"
                    title="Salin link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 shadow-lg">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const url = import.meta.env.DEV ? `http://localhost:5173/${user.pageid}` : `https://mypublicgold.id/${user.pageid}`
                window.open(url, '_blank')
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Lihat Halaman
            </button>
          </div>
        )}

        {/* Registrant Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Pendaftar Terbaru</h2>
            <p className="text-xs text-slate-400 mt-0.5">Daftar calon nasabah yang mendaftar melalui halaman Anda</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-5 sm:px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                  <th className="px-5 sm:px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                  <th className="px-5 sm:px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Telepon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {overview?.tabel_pendaftar_terbaru?.length > 0 ? (
                  overview.tabel_pendaftar_terbaru.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-red-50/40 transition-colors duration-150">
                      <td className="px-5 sm:px-6 py-4 text-sm text-slate-800 font-medium">{row.nama}</td>
                      <td className="px-5 sm:px-6 py-4 text-sm text-slate-600">{row.branch}</td>
                      <td className="px-5 sm:px-6 py-4 text-sm">
                        <a
                          href={`https://wa.me/${row.no_telpon}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 font-medium transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {row.no_telpon}
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                          <UserPlus className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Belum ada pendaftar</p>
                        <p className="text-slate-400 text-xs mt-1">Pendaftar baru akan muncul di sini</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
