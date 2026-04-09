import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useEffect, useState, useMemo } from 'react'
import { useToast } from '../components/toast'
import { Users, UserPlus, MessageCircle, Settings, LogOut, ExternalLink, Copy, Check, Upload, Trash2, Loader2 } from 'lucide-react'
import dayjs from 'dayjs'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '../components/ui/data-table'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'

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
      navigate({ to: '/' })
    }
  }, [navigate])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const res = await api.get('/overview')
      return res.data
    },
    retry: 1,
    staleTime: 60_000,
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
    navigate({ to: '/' })
  }

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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLeadToDelete(info.row.original.id)}
          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Hapus pendaftar"
        >
          <Trash2 size={15} />
        </Button>
      ),
    }),
  ], [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
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
          <Button 
            onClick={() => navigate({ to: '/' })}
            className="w-full h-auto py-3 rounded-xl font-bold"
          >
            Masuk Kembali
          </Button>
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
              <Button
                variant="outline"
                rounded="xl"
                onClick={() => navigate({ to: '/settings' })}
                className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border-white/20"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Pengaturan</span>
              </Button>
              <Button
                variant="outline"
                rounded="xl"
                onClick={handleLogout}
                className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 pb-10 space-y-5 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className={cn("relative rounded-2xl shadow-sm border p-3.5 sm:p-6 overflow-hidden group hover:shadow-md transition-all duration-300", stat.accent)}
            >
              <stat.icon className={cn("absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-16 h-16 sm:w-24 sm:h-24 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-300", stat.iconColor)} />
              
              <CardContent className="p-0 relative z-10">
                <p className="text-2xl sm:text-4xl font-bold text-slate-800 tracking-tight">{stat.value.toLocaleString()}</p>
                <p className="text-slate-500 text-[10px] sm:text-sm font-medium mt-1 sm:mt-1.5 leading-tight">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Link */}
        {user.pageid && (
          <Card className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border-red-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-700 mb-0.5">Link Landing Page Anda</p>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-red-600 font-medium truncate">
                  {import.meta.env.DEV ? `localhost:5173/${user.pageid}` : `mypublicgold.id/${user.pageid}`}
                </p>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const url = import.meta.env.DEV ? `http://localhost:5173/${user.pageid}` : `https://mypublicgold.id/${user.pageid}`
                      navigator.clipboard.writeText(url)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="h-8 w-8 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-all duration-200"
                    title="Salin link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </Button>
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 shadow-lg">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                const url = import.meta.env.DEV ? `http://localhost:5173/${user.pageid}` : `https://mypublicgold.id/${user.pageid}`
                window.open(url, '_blank')
              }}
              className="w-full sm:w-auto h-auto py-2.5 rounded-xl transition-all duration-200 shadow-sm flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Lihat Halaman
            </Button>
          </Card>
        )}

        {/* Registrant Table */}
        <div className="space-y-3">
          <div className="px-1">
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
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md", count > 0 ? "text-red-600 bg-red-50" : "text-slate-400 bg-slate-100")}>
                  {count} terpilih
                </span>
                <Button
                  onClick={() => {
                    const ids = selectedRows.map((r: any) => r.id)
                    syncContactsMutation.mutate(ids, { onSuccess: () => clearSelection() })
                  }}
                  disabled={count === 0 || syncContactsMutation.isPending}
                  variant="outline"
                  className="h-auto py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                >
                  {syncContactsMutation.isPending ? (
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3 mr-1.5" />
                  )}
                  {syncContactsMutation.isPending ? 'Menyinkronkan...' : 'Sync ke Google Contacts'}
                </Button>
              </>
            )}
          />
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
        <DialogContent className="max-w-sm rounded-2xl overflow-hidden p-0 gap-0 border-none shadow-2xl">
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogHeader className="p-0 mb-2">
              <DialogTitle className="text-xl font-bold text-slate-900 text-center">Hapus Pendaftar?</DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-slate-500 text-sm mb-0 text-center">
              Data pendaftar ini akan dihapus secara permanen dan tidak dapat dikembalikan.
            </DialogDescription>
          </div>
          <DialogFooter className="p-6 pt-0 flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setLeadToDelete(null)}
              className="flex-1 rounded-xl h-auto py-2.5 font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => leadToDelete && deleteLeadMutation.mutate(leadToDelete)}
              disabled={deleteLeadMutation.isPending}
              className="flex-1 rounded-xl h-auto py-2.5 font-bold shadow-lg shadow-red-200"
            >
              {deleteLeadMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {deleteLeadMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
