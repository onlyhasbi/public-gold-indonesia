import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useEffect, useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { useToast } from '../../components/toast'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable } from '../../components/ui/data-table'
import { Trash2, Plus, X, ToggleLeft, ToggleRight, Pencil } from 'lucide-react'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

const createSchema = yup.object().shape({
  pgcode: yup.string().min(3, 'Minimal 3 karakter').required('PGCode wajib diisi'),
  pageid: yup.string().min(3, 'Minimal 3 karakter').required('Page ID wajib diisi'),
  katasandi: yup.string().min(6, 'Minimal 6 karakter').required('Password wajib diisi'),
  nama_lengkap: yup.string().optional(),
  country_code: yup.string().default('62'),
  no_telpon: yup.string().required('No. Telepon wajib diisi'),
  foto_profil: yup.mixed().optional(),
})

const editSchema = yup.object().shape({
  nama_lengkap: yup.string().optional(),
  pgcode: yup.string().min(3, 'Minimal 3 karakter').required('PGCode wajib diisi'),
  pageid: yup.string().min(3, 'Minimal 3 karakter').required('Page ID wajib diisi'),
  country_code: yup.string().default('62'),
  no_telpon: yup.string().required('No. Telepon wajib diisi'),
  foto_profil: yup.mixed().optional(),
})

const columnHelper = createColumnHelper<any>()

function AdminDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pgboToDelete, setPgboToDelete] = useState<string | null>(null)
  const [pgboToEdit, setPgboToEdit] = useState<any | null>(null)

  const [pageIdErrorCreate, setPageIdErrorCreate] = useState<string | null>(null)
  const [pageIdErrorEdit, setPageIdErrorEdit] = useState<string | null>(null)
  const [showPasswordSementara, setShowPasswordSementara] = useState(false)

  const checkPageId = async (pageid: string, excludeId?: string): Promise<boolean> => {
    if (!pageid || pageid.length < 3) return true;
    try {
      const res = await api.get(`/admin/pgbo/check-pageid?pageid=${pageid}${excludeId ? `&excludeId=${excludeId}` : ''}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
      return res.data.isAvailable
    } catch {
      return true
    }
  }

  useEffect(() => {
    document.title = "Dashboard Super Admin | Public Gold Indonesia";
    if (!localStorage.getItem('admin_token')) {
      navigate({ to: '/admin/login' })
    }
  }, [navigate])

  const adminToken = localStorage.getItem('admin_token')

  const { data: pgboData, isLoading, isError, error } = useQuery({
    queryKey: ['admin_pgbo'],
    queryFn: async () => {
      const res = await api.get('/admin/pgbo', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      })
      return res.data?.data || []
    },
    retry: 1,
    enabled: !!adminToken,
  })

  // Auth interceptor
  useEffect(() => {
    if (isError) {
      if ((error as any).response?.status === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        navigate({ to: '/admin/login' })
      }
    }
  }, [isError, error, navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    navigate({ to: '/admin/login' })
  }

  // --- DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/pgbo/${id}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
      return res.data
    },
    onSuccess: (data) => {
      showToast(data.message, 'success')
      queryClient.invalidateQueries({ queryKey: ['admin_pgbo'] })
      setPgboToDelete(null)
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Gagal menghapus PGBO', 'error')
      setPgboToDelete(null)
    }
  })

  // --- TOGGLE ACTIVE MUTATION ---
  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/admin/pgbo/${id}/toggle`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
      return res.data
    },
    onSuccess: (data) => {
      showToast(data.message, 'success')
      queryClient.invalidateQueries({ queryKey: ['admin_pgbo'] })
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Gagal mengubah status PGBO', 'error')
    }
  })

  // --- CREATE FORM & MUTATION ---
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: createErrors, isValid: isValidCreate },
  } = useForm({
    resolver: yupResolver(createSchema),
    mode: 'onChange',
    defaultValues: { pgcode: '', pageid: '', katasandi: '', nama_lengkap: '', country_code: '62', no_telpon: '' },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/admin/pgbo', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
      return res.data
    },
    onSuccess: (data) => {
      showToast(data.message, 'success')
      queryClient.invalidateQueries({ queryKey: ['admin_pgbo'] })
      setIsModalOpen(false)
      resetCreate()
      setPageIdErrorCreate(null)
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Gagal mendaftar PGBO', 'error')
    }
  })

  const onSubmitCreate = (data: any) => {
    const formData = new FormData()
    formData.append('pgcode', data.pgcode)
    formData.append('pageid', data.pageid)
    formData.append('katasandi', data.katasandi)
    if (data.nama_lengkap) formData.append('nama_lengkap', data.nama_lengkap)
    if (data.no_telpon) {
      const cleanPhone = data.no_telpon.replace(/^0+/, '')
      formData.append('no_telpon', `${data.country_code}${cleanPhone}`)
    }
    if (data.foto_profil && data.foto_profil.length > 0) {
      formData.append('foto_profil', data.foto_profil[0])
    }
    
    createMutation.mutate(formData)
  }

  // --- EDIT FORM & MUTATION ---
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { errors: editErrors, isValid: isValidEdit },
  } = useForm({
    resolver: yupResolver(editSchema),
    mode: 'onChange',
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/admin/pgbo/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
      return res.data
    },
    onSuccess: (data) => {
      showToast(data.message, 'success')
      queryClient.invalidateQueries({ queryKey: ['admin_pgbo'] })
      setPgboToEdit(null)
      setPageIdErrorEdit(null)
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Gagal memperbarui PGBO', 'error')
    }
  })

  const fetchIntroducerName = async (pgcode: string, isEdit: boolean) => {
    if (!pgcode || pgcode.length < 6) return;

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
        if (isEdit) {
          setValueEdit('nama_lengkap', data.name.trim(), { shouldValidate: true });
        } else {
          setValueCreate('nama_lengkap', data.name.trim(), { shouldValidate: true });
        }
      }
    } catch (error) {
      console.error("Failed to auto-fetch PGCode name", error);
    }
  };

  const openEditModal = (pgbo: any) => {
    setPgboToEdit(pgbo)
    setPageIdErrorEdit(null)
    
    // Parse existing phone number to split country code and local number
    let parsedCountryCode = "62";
    let parsedPhone = pgbo.no_telpon || "";
    if (parsedPhone) {
      if (parsedPhone.startsWith("62")) {
        parsedCountryCode = "62";
        parsedPhone = parsedPhone.substring(2);
      } else if (parsedPhone.startsWith("60")) {
        parsedCountryCode = "60";
        parsedPhone = parsedPhone.substring(2);
      } else if (parsedPhone.startsWith("65")) {
        parsedCountryCode = "65";
        parsedPhone = parsedPhone.substring(2);
      }
    }

    resetEdit({
      nama_lengkap: pgbo.nama_lengkap || '',
      pgcode: pgbo.pgcode || '',
      pageid: pgbo.pageid || '',
      country_code: parsedCountryCode,
      no_telpon: parsedPhone,
    })
  }

  const onSubmitEdit = (data: any) => {
    if (!pgboToEdit) return
    const formData = new FormData()
    if (data.pgcode) formData.append('pgcode', data.pgcode)
    if (data.pageid) formData.append('pageid', data.pageid)
    if (data.nama_lengkap) formData.append('nama_lengkap', data.nama_lengkap)
    
    if (data.no_telpon) {
      // Hilangkan awalan 0 jika user terlanjur mengetiknya
      const cleanPhone = data.no_telpon.replace(/^0+/, '')
      formData.append('no_telpon', `${data.country_code}${cleanPhone}`)
    } else {
      formData.append('no_telpon', '') // To allow clearing the phone number
    }
    
    if (data.foto_profil && data.foto_profil.length > 0) {
      formData.append('foto_profil', data.foto_profil[0])
    }

    editMutation.mutate({ id: pgboToEdit.id, data: formData })
  }

  // --- TABLE COLUMN DEFINITIONS ---
  const columns = useMemo(() => [
    columnHelper.display({
      id: 'no',
      header: 'No',
      cell: (info) => <span className="text-sm text-slate-500">{info.row.index + 1}</span>,
    }),
    columnHelper.accessor('pgcode', {
      header: 'Informasi Akun',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">{info.getValue()}</span>
          <span className="text-xs text-slate-500">{info.row.original.nama_lengkap || '-'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('pageid', {
      header: 'Link/Identitas',
      cell: (info) => (
        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block w-fit font-mono">
          /{info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'kontak',
      header: 'Kontak',
      cell: (info) => {
        const d = info.row.original;
        return (
          <div className="flex flex-col gap-1">
            {d.no_telpon ? (
              <span className="text-xs text-slate-600 flex items-center gap-1">📞 {d.no_telpon}</span>
            ) : <span className="text-xs text-slate-400">Tidak ada telp</span>}
            {d.foto_profil_url && (
              <a href={d.foto_profil_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                🖼️ Lihat Foto
              </a>
            )}
          </div>
        )
      }
    }),
    columnHelper.accessor('created_at', {
      header: 'Tanggal Terdaftar',
      cell: (info) => (
        <span className="text-sm text-slate-500">
          {dayjs(info.getValue()).format('DD MMM YYYY, HH:mm')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'status',
      header: 'Status',
      cell: (info) => {
        const isActive = !!info.row.original.is_active;
        return (
          <button
            onClick={() => toggleMutation.mutate(info.row.original.id)}
            disabled={toggleMutation.isPending}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            title={isActive ? 'Nonaktifkan' : 'Aktifkan'}
          >
            {isActive ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} />}
            {isActive ? 'Aktif' : 'Nonaktif'}
          </button>
        )
      }
    }),
    columnHelper.display({
      id: 'aksi',
      header: 'Aksi',
      cell: (info) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(info.row.original)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
            title="Sunting Informasi"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setPgboToDelete(info.row.original.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Hapus PGBO"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    })
  ], [toggleMutation])

  // Table instance is now managed by DataTable component

  // Render Loader
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10">
      <nav className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="font-bold text-white text-sm">SA</span>
                </div>
                <span className="font-bold text-lg hidden sm:block">Super Admin Portal</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daftar Landing Page PGBO</h1>
            <p className="text-sm text-slate-500 mt-1">
              Total {pgboData?.length || 0} page aktif tercatat dalam sistem.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus size={16} />
            Buat Page Baru
          </button>
        </div>

        <DataTable
          columns={columns}
          data={pgboData || []}
          emptyMessage="Belum ada data pendaftar."
        />
      </main>

      {/* CREATE PGBO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Buat Page Baru PGBO</h3>
              <button onClick={() => { setIsModalOpen(false); resetCreate(); setPageIdErrorCreate(null); }} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
              <fieldset disabled={createMutation.isPending} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PGCode</label>
                  <input
                    type="text"
                    {...registerCreate('pgcode', {
                      onBlur: (e) => fetchIntroducerName(e.target.value, false)
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none ${createErrors.pgcode ? 'border-red-500' : 'border-slate-300'}`}
                    placeholder="Contoh: PG123456"
                  />
                  {createErrors.pgcode && <p className="mt-1 text-sm text-red-500">{createErrors.pgcode.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Page ID (Unik)</label>
                  <input
                    type="text"
                    {...registerCreate('pageid', {
                      onBlur: async (e) => {
                        if (e.target.value.length >= 3) {
                          const isAvailable = await checkPageId(e.target.value)
                          if (!isAvailable) setPageIdErrorCreate('Page ID ini sudah terdaftar')
                          else setPageIdErrorCreate(null)
                        } else {
                          setPageIdErrorCreate(null)
                        }
                      }
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none ${createErrors.pageid || pageIdErrorCreate ? 'border-red-500' : 'border-slate-300'}`}
                    placeholder="Contoh: my-gold-shop"
                  />
                  {(createErrors.pageid || pageIdErrorCreate) && <p className="mt-1 text-sm text-red-500">{createErrors.pageid?.message || pageIdErrorCreate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  {...registerCreate('nama_lengkap')}
                  className="w-full px-4 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg cursor-not-allowed focus:outline-none"
                  placeholder="Terisi otomatis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Foto Profil (Opsional - max 2MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  {...registerCreate('foto_profil')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon (WhatsApp)</label>
                <div className="flex shadow-sm rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900">
                  <select
                    {...registerCreate('country_code')}
                    className="bg-slate-50 px-3 py-2 text-slate-700 border-none focus:ring-0 outline-none border-r border-slate-300 sm:text-sm"
                  >
                    <option value="62">🇮🇩 +62</option>
                    <option value="60">🇲🇾 +60</option>
                    <option value="65">🇸🇬 +65</option>
                  </select>
                  <input
                    type="text"
                    {...registerCreate('no_telpon')}
                    className="flex-1 w-full px-4 py-2 border-none focus:ring-0 outline-none sm:text-sm"
                    placeholder="8123456789"
                  />
                </div>
                {createErrors.no_telpon && <p className="mt-1 text-sm text-red-500">{createErrors.no_telpon.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password Sementara</label>
                <div className="relative">
                  <input
                    type={showPasswordSementara ? 'text' : 'password'}
                    {...registerCreate('katasandi')}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none ${createErrors.katasandi ? 'border-red-500' : 'border-slate-300'}`}
                    placeholder="Katasandi akses pertama PGBO"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordSementara(!showPasswordSementara)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    {showPasswordSementara ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 013.168-4.477M6.343 6.343A9.97 9.97 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-4.168 4.477M6.343 6.343L3 3m3.343 3.343l2.829 2.829m4.243 4.243l2.829 2.829M3 3l18 18M9.878 9.878a3 3 0 104.243 4.243" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {createErrors.katasandi && <p className="mt-1 text-sm text-red-500">{createErrors.katasandi.message}</p>}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetCreate(); setPageIdErrorCreate(null); }}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !isValidCreate || !!pageIdErrorCreate}
                  className="px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 font-medium rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Buat'}
                </button>
              </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PGBO MODAL */}
      {pgboToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Sunting Informasi</h3>
              <button onClick={() => { setPgboToEdit(null); setPageIdErrorEdit(null); }} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
              <fieldset disabled={editMutation.isPending} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PGCode</label>
                  <input
                    type="text"
                    {...registerEdit('pgcode', {
                      onBlur: (e) => fetchIntroducerName(e.target.value, true)
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none ${editErrors.pgcode ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {editErrors.pgcode && <p className="mt-1 text-sm text-red-500">{editErrors.pgcode.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Page ID</label>
                  <input
                    type="text"
                    {...registerEdit('pageid', {
                      onBlur: async (e) => {
                        if (e.target.value.length >= 3 && pgboToEdit?.pageid !== e.target.value) {
                          const isAvailable = await checkPageId(e.target.value, pgboToEdit?.id)
                          if (!isAvailable) setPageIdErrorEdit('Page ID ini sudah dipakai')
                          else setPageIdErrorEdit(null)
                        } else {
                          setPageIdErrorEdit(null)
                        }
                      }
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none ${editErrors.pageid || pageIdErrorEdit ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {(editErrors.pageid || pageIdErrorEdit) && <p className="mt-1 text-sm text-red-500">{editErrors.pageid?.message || pageIdErrorEdit}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  {...registerEdit('nama_lengkap')}
                  className="w-full px-4 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg cursor-not-allowed focus:outline-none"
                  placeholder="Terisi otomatis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon (WhatsApp)</label>
                <div className="flex shadow-sm rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900">
                  <select
                    {...registerEdit('country_code')}
                    className="bg-slate-50 px-3 py-2 text-slate-700 border-none focus:ring-0 outline-none border-r border-slate-300 sm:text-sm"
                  >
                    <option value="62">🇮🇩 +62</option>
                    <option value="60">🇲🇾 +60</option>
                    <option value="65">🇸🇬 +65</option>
                  </select>
                  <input
                    type="text"
                    {...registerEdit('no_telpon')}
                    className="flex-1 w-full px-4 py-2 border-none focus:ring-0 outline-none sm:text-sm"
                    placeholder="8123456789"
                  />
                </div>
                {editErrors.no_telpon && <p className="mt-1 text-sm text-red-500">{editErrors.no_telpon.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Foto Profil Baru (Opsional - max 2MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  {...registerEdit('foto_profil')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                />
                <p className="mt-1 text-xs text-slate-500">Biarkan kosong jika tidak ingin mengubah foto</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setPgboToEdit(null); setPageIdErrorEdit(null); }}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending || !isValidEdit || !!pageIdErrorEdit}
                  className="px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 font-medium rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {pgboToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Halaman PGBO?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Aksi ini akan menghapus halaman dan seluruh data terkait secara permanen. Anda tidak dapat mengembalikan tindakan ini.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setPgboToDelete(null)}
                className="w-full px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={() => deleteMutation.mutate(pgboToDelete)}
                disabled={deleteMutation.isPending}
                className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg transition disabled:opacity-70"
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
