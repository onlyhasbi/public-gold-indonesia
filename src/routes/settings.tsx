import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useEffect, useState, useRef } from 'react'
import { useToast } from '../components/toast'
import { useForm } from 'react-hook-form'
import { ImageCropper } from '../components/ui/image-cropper'
import { ArrowLeft, Camera, Save, User, Mail, Phone, Link2, Globe } from 'lucide-react'
import { Spinner } from '../components/ui/spinner'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(true);
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null)
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nama_lengkap: '',
      nama_panggilan: '',
      email: '',
      country_code: '62',
      no_telpon: '',
      link_group_whatsapp: '',
      sosmed_facebook: '',
      sosmed_instagram: '',
      sosmed_tiktok: ''
    }
  })

  useEffect(() => {
    document.title = "Pengaturan Profil | Public Gold Indonesia";
    if (!localStorage.getItem('token')) {
      navigate({ to: '/' })
    }
  }, [navigate])

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings')
      return res.data?.data
    },
    retry: 1,
  })

  // Synchronize fetched data into local form state
  useEffect(() => {
    if (profileData) {
      let formPhone = profileData.no_telpon || '';
      let initialCountryCode = '62';
      let initialPhoneRest = formPhone;
      
      if (formPhone.startsWith('62')) {
        initialCountryCode = '62';
        initialPhoneRest = formPhone.substring(2);
      } else if (formPhone.startsWith('60')) {
        initialCountryCode = '60';
        initialPhoneRest = formPhone.substring(2);
      } else if (formPhone.startsWith('65')) {
        initialCountryCode = '65';
        initialPhoneRest = formPhone.substring(2);
      }

      reset({
        nama_lengkap: profileData.nama_lengkap || '',
        nama_panggilan: profileData.nama_panggilan || '',
        email: profileData.email || '',
        country_code: initialCountryCode,
        no_telpon: initialPhoneRest,
        link_group_whatsapp: profileData.link_group_whatsapp || '',
        sosmed_facebook: profileData.sosmed_facebook || '',
        sosmed_instagram: profileData.sosmed_instagram || '',
        sosmed_tiktok: profileData.sosmed_tiktok || '',
      })
    }
  }, [profileData, reset])

  const mutation = useMutation({
    mutationFn: async (formData: any) => {
      // Need multipart/form-data for file upload
      const data = new FormData()
      if (fotoFile) {
        data.append('foto_profil', fotoFile)
      }
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key])
      })

      const res = await api.put('/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    },
    onSuccess: (data: any) => {
      if (data.success) {
        showToast('Profil berhasil diperbarui!', 'success')
        queryClient.invalidateQueries({ queryKey: ['settings'] })

        // Update user data in localStorage to reflect changes in Header
        const oldUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = { ...oldUser, ...data.data }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        showToast(data.message, 'error')
      }
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengaturan.', 'error')
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Open cropper modal with the selected file
      const reader = new FileReader()
      reader.onload = () => {
        setCropperSrc(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convert Blob to File for FormData upload
    const croppedFile = new File([croppedBlob], 'foto_profil.png', { type: 'image/png' })
    setFotoFile(croppedFile)
    setCroppedPreview(URL.createObjectURL(croppedBlob))
    setCropperSrc(null)
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCropCancel = () => {
    setCropperSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = (data: any) => {
    let finalPhone = undefined;
    if (data.no_telpon) {
      const cleanPhone = data.no_telpon.replace(/^0+/, '')
      finalPhone = `${data.country_code}${cleanPhone}`
    }
    
    // Create a copy of data to avoid modifying the original React Hook Form's data
    const submitData = { ...data, no_telpon: finalPhone };
    // remove purely frontend properties
    delete submitData.country_code;
    
    mutation.mutate(submitData)
  }

  // Google Integration logic
  useEffect(() => {
    fetchGoogleStatus();

    // Check for google_code in URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('google_code');
    if (code) {
      saveGoogleToken(code);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchGoogleStatus = async () => {
    setIsCheckingGoogle(true);
    try {
      const res = await api.get('/google/status');
      setIsGoogleConnected(res.data.connected);
    } catch (err) {
      console.error("Failed to fetch google status:", err);
    } finally {
      setIsCheckingGoogle(false);
    }
  };

  const saveGoogleToken = async (code: string) => {
    try {
      const res = await api.post('/google/save-token', { code });
      if (res.data.success) {
        showToast('Google account connected!', 'success');
        setIsGoogleConnected(true);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to connect Google account', 'error');
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await api.get('/google/auth-url');
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      showToast('Gagal mendapatkan tautan otorisasi Google', 'error');
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!confirm('Apakah Anda yakin ingin memutuskan koneksi Google? Sinkronisasi otomatis akan berhenti.')) return;
    try {
      const res = await api.post('/google/disconnect');
      if (res.data.success) {
        showToast('Koneksi Google diputuskan', 'success');
        setIsGoogleConnected(false);
      }
    } catch (err) {
      showToast('Gagal memutuskan koneksi', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={40} className="text-red-600 opacity-100" />
          <p className="text-slate-500 text-sm font-medium">Memuat pengaturan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Image Cropper Modal */}
      {cropperSrc && (
        <ImageCropper
          imageSrc={cropperSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate({ to: '/overview' })}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-all duration-200 border border-white/20 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Pengaturan Profil</h1>
              <p className="text-red-100 text-xs sm:text-sm">Kelola informasi landing page Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 pb-10">
        <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
          {/* Profile Photo Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-3 ring-red-100 shadow-lg">
                  {croppedPreview ? (
                    <img
                      src={croppedPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : profileData?.foto_profil_url ? (
                    <img
                      src={profileData.foto_profil_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center">
                      <User className="w-10 h-10 sm:w-12 sm:h-12 text-red-300" />
                    </div>
                  )}
                </div>
                {/* Edit overlay on hover */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-base sm:text-lg font-bold text-slate-800">{profileData?.nama_lengkap || 'Nama Anda'}</p>
                <p className="text-xs sm:text-sm text-slate-400 mb-3">{profileData?.pgcode || 'PGCODE'}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Ganti Foto
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-[11px] text-slate-400 mt-2">Pilih gambar, lalu atur posisi dan zoom.</p>
              </div>
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-bold text-slate-800">Informasi Dasar</h2>
            </div>
            <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
              {/* PG Code */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  PG Code
                </label>
                <input
                  type="text"
                  disabled
                  value={profileData?.pgcode || ''}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              {/* Name & Nickname in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    Nama Lengkap
                  </label>
                  <input
                    {...register('nama_lengkap', { required: 'Nama lengkap wajib diisi' })}
                    type="text"
                    className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all ${errors.nama_lengkap ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                  />
                  {errors.nama_lengkap && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.nama_lengkap.message as string}</p>}
                </div>

                {/* Nickname */}
                <div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    Nama Panggilan
                  </label>
                  <input
                    {...register('nama_panggilan')}
                    type="text"
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all"
                    placeholder="Opsional"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  Email Publik
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  Nomor Telepon (WhatsApp)
                </label>
                <div className="flex bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all">
                  <select
                    {...register('country_code')}
                    className="bg-slate-50 px-3.5 sm:px-4 py-2.5 sm:py-3 text-slate-700 text-sm border-none focus:ring-0 outline-none border-r border-slate-200"
                  >
                    <option value="62">🇮🇩 +62</option>
                    <option value="60">🇲🇾 +60</option>
                    <option value="65">🇸🇬 +65</option>
                  </select>
                  <input
                    {...register('no_telpon', { onChange: (e) => e.target.value = e.target.value.replace(/\D/g, "") })}
                    type="text"
                    className="flex-1 w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-transparent text-sm border-none focus:ring-0 outline-none"
                    placeholder="8123456789"
                  />
                </div>
              </div>

              {/* WhatsApp Group */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                  <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  Link Grup WhatsApp
                </label>
                <input
                  {...register('link_group_whatsapp')}
                  type="text"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all"
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
            </div>
          </div>

          {/* Social Media Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-bold text-slate-800">Tautan Sosial Media</h2>
              <p className="text-xs text-slate-400 mt-0.5">Opsional — akan tampil di landing page Anda</p>
            </div>
            <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
              {/* Facebook */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </label>
                <input
                  {...register('sosmed_facebook')}
                  type="text"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all"
                  placeholder="https://facebook.com/..."
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </label>
                <input
                  {...register('sosmed_instagram')}
                  type="text"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all"
                  placeholder="https://instagram.com/..."
                />
              </div>

              {/* TikTok */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                  TikTok
                </label>
                <input
                  {...register('sosmed_tiktok')}
                  type="text"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all"
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </div>

          {/* Google Sync Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800">Integrasi Google Contacts</h2>
                <p className="text-xs text-slate-400 mt-0.5">Sinkronisasi pendaftar langsung ke HP Anda</p>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isGoogleConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {isCheckingGoogle ? 'Checking...' : (isGoogleConnected ? 'Connected' : 'Disconnected')}
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isGoogleConnected ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Google People API</p>
                    <p className="text-xs text-slate-500">Otomatis tambah kontak saat pendaftaran sukses</p>
                  </div>
                </div>
                {isGoogleConnected ? (
                  <button
                    type="button"
                    onClick={handleGoogleDisconnect}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm font-semibold rounded-xl transition-all"
                  >
                    Putuskan Koneksi
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleConnect}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-red-600/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Hubungkan ke Google
                  </button>
                )}
              </div>
              {!isGoogleConnected && !isCheckingGoogle && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <strong>Penting:</strong> Fitur ini memerlukan izin akses ke kontak Google Anda untuk menambahkan nasabah baru secara otomatis. Kami tidak akan menghapus atau memodifikasi kontak yang sudah ada.
                  </p>
                </div>
              )}
            </div>
          </div>

        </form>
      </div>

      {/* Sticky Save Button */}
      <div className="sticky bottom-0 z-40 bg-gradient-to-t from-white via-white/95 to-white/0 pt-6 pb-4 sm:pb-5 pointer-events-none">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex justify-center pointer-events-auto">
          <button
            type="submit"
            form="settings-form"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
