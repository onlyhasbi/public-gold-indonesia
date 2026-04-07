import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useEffect, useState, useMemo } from 'react'
import { useToast } from '../components/toast'
import { Users, UserPlus, MessageCircle, Settings, LogOut, ExternalLink, Copy, Check, Upload, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '../components/ui/data-table'

export const Route = createFileRoute('/overview')({
  component: OverviewPage,
})

const columnHelper = createColumnHelper<any>()

function OverviewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
    staleTime: 60_000, // Data dianggap fresh selama 1 menit
  })

  useEffect(() => {
    if (isError) {
      showToast('Terjadi kesalahan memuat data. Sesi mungkin kadaluarsa.', 'error')
    }
  }, [isError, showToast])

  const [copied, setCopied] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate({ to: '/signin' })
  }

  // --- SYNC TO GOOGLE CONTACTS MUTATION ---
  const syncContactsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await api.get('/google/status')
      if (!res.data?.connected) {
        throw new Error('Akun Google belum terhubung. Silakan hubungkan terlebih dahulu di halaman Pengaturan.')
      }
      const syncRes = await api.post('/overview/leads/sync-contacts', { ids })
      return syncRes.data
    },
    onSuccess: (data) => {
      showToast(data.message, 'success')
      queryClient.invalidateQueries({ queryKey: ['overview'] })
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || error.message || 'Gagal sinkronisasi kontak', 'error')
    }
  })

  // --- DELETE LEAD MUTATION ---
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/overview/leads/${id}`)
      return res.data
    },
    onSuccess: (data) => {
      showToast(data.message, 'success')
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      setLeadToDelete(null)
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Gagal menghapus pendaftar', 'error')
      setLeadToDelete(null)
    }
  })

  // --- TABLE COLUMNS ---
  const columns = useMemo(() => [
    columnHelper.accessor('nama', {
      header: 'Nama',
      cell: (info) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-slate-800">{info.getValue()}</span>
          {info.row.original.exported_at && (
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 border border-emerald-200 shrink-0"
              title={`Disinkronkan ${dayjs(info.row.original.exported_at).format('DD MMM YYYY, HH:mm')}`}
            >
              <Check className="w-2.5 h-2.5 text-emerald-600" />
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('branch', {
      header: 'Branch',
      cell: (info) => <span className="text-sm text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('no_telpon', {
      header: 'No. Telepon',
      cell: (info) => (
        <a
          href={`https://wa.me/${info.getValue()}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline transition-colors"
        >
          {info.getValue()}
        </a>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Tanggal Daftar',
      cell: (info) => (
        <span className="text-sm text-slate-500">
          {dayjs(info.getValue()).format('DD MMM YYYY, HH:mm')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'aksi',
      header: '',
      cell: (info) => (
        <button
          onClick={() => setLeadToDelete(info.row.original.id)}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          title="Hapus pendaftar"
        >
          <Trash2 size={15} />
        </button>
      ),
    }),
  ], [])

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sesi Berakhir</h2>
          <p className="text-slate-500 text-sm mb-6">Sesi Anda telah berakhir atau terjadi kesalahan. Silakan masuk kembali.</p>
          <button 
            onClick={() => navigate({ to: '/signin' })}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-md"
          >
            Masuk Kembali
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
      iconColor: 'text-red-600',
      accent: 'border-red-100',
    },
    {
      label: 'Total Pendaftar',
      value: overview?.total_pendaftar || 0,
      icon: UserPlus,
      color: 'bg-rose-50 text-rose-600',
      iconColor: 'text-rose-600',
      accent: 'border-rose-100',
    },
    {
      label: 'Klik WhatsApp',
      value: overview?.total_klik_whatsapp || 0,
      icon: MessageCircle,
      color: 'bg-emerald-50 text-emerald-600',
      iconColor: 'text-emerald-600',
      accent: 'border-emerald-100',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 flex-shrink-0">
                {user.foto_profil_url ? (
                  <img src={user.foto_profil_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold text-white truncate">
                  Halo, {user.nama_lengkap || user.pgcode || 'Dealer'}!
                </h1>
                <p className="text-red-100 text-[10px] sm:text-sm truncate">Pantau performa landing page</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => navigate({ to: '/settings' })}
                className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border border-white/20"
                title="Pengaturan"
              >
                <Settings className="w-4.5 h-4.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2 text-sm font-medium">Pengaturan</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border border-white/20"
                title="Keluar"
              >
                <LogOut className="w-4.5 h-4.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2 text-sm font-medium">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 pb-10 space-y-5 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`relative bg-white rounded-2xl shadow-sm border ${stat.accent} p-3.5 sm:p-6 overflow-hidden group hover:shadow-md transition-all duration-300`}
            >
              {/* Watermark icon */}
              <stat.icon className={`absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-16 h-16 sm:w-24 sm:h-24 opacity-[0.06] ${stat.iconColor} group-hover:opacity-[0.1] transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <p className="text-2xl sm:text-4xl font-bold text-slate-800 tracking-tight">{stat.value.toLocaleString()}</p>
                <p className="text-slate-500 text-[10px] sm:text-sm font-medium mt-1 sm:mt-1.5 leading-tight">{stat.label}</p>
              </div>
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Lihat Halaman
            </button>
          </div>
        )}

        {/* Registrant Table */}
        <div className="space-y-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Daftar Pendaftar</h2>
            <p className="text-xs text-slate-400 mt-0.5">Daftar calon nasabah yang mendaftar melalui halaman Anda</p>
          </div>
          <DataTable
            columns={columns}
            data={overview?.tabel_pendaftar_terbaru || []}
            emptyMessage="Belum ada pendaftar"
            enableSearch
            searchPlaceholder="Cari nama, branch, no. telepon..."
            enablePagination
            defaultPageSize={10}
            enableRowSelection
            renderBulkActions={(count, selectedRows, clearSelection) => (
              <>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${count > 0 ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-100'}`}>
                  {count} terpilih
                </span>
                <button
                  onClick={() => {
                    const ids = selectedRows.map((r: any) => r.id)
                    syncContactsMutation.mutate(ids, { onSuccess: () => clearSelection() })
                  }}
                  disabled={count === 0 || syncContactsMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-50"
                >
                  <Upload size={13} />
                  {syncContactsMutation.isPending ? 'Menyinkronkan...' : 'Sync ke Google Contacts'}
                </button>
              </>
            )}
          />
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {leadToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setLeadToDelete(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative p-6 text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Pendaftar?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Data pendaftar ini akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setLeadToDelete(null)}
                className="w-full px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={() => deleteLeadMutation.mutate(leadToDelete)}
                disabled={deleteLeadMutation.isPending}
                className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg transition disabled:opacity-70"
              >
                {deleteLeadMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
