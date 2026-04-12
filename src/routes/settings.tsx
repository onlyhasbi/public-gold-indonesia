import { api } from '../lib/api'
import { useState, useMemo, Suspense, useEffect } from 'react'
import { useToast } from '../components/toast'
import { useForm } from 'react-hook-form'
import { settingsQueryOptions, googleStatusQueryOptions } from '../lib/queryOptions'
import { queryClient } from '../lib/queryClient'
import { useSuspenseQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { redirect, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, User, Mail, Phone, Link2, Globe } from 'lucide-react'
import { Spinner } from '../components/ui/spinner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
} from "../components/ui/combobox"
import { dialCodeOptions } from '../constant/countries'
import { Button } from "../components/ui/button"
import { cn } from '../lib/utils'
import { useSEO } from '../hooks/useSEO'
import { formatPhoneForAPI } from '../lib/phone'
import { ProfilePhotoCard } from '../components/settings/ProfilePhotoCard'
import { GoogleSyncCard } from '../components/settings/GoogleSyncCard'
import { SocialMediaCard } from '../components/settings/SocialMediaCard'
import { PasswordCard } from '../components/settings/PasswordCard'

export interface SettingsFormValues {
  nama_lengkap: string
  nama_panggilan: string
  email: string
  country_code: string
  no_telpon: string
  link_group_whatsapp: string
  sosmed_facebook: string
  sosmed_instagram: string
  sosmed_tiktok: string
}

export const Route = createFileRoute('/settings')({
  component: () => (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsPage />
    </Suspense>
  ),
  beforeLoad: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (!token || !userStr) {
      throw redirect({ to: '/', replace: true });
    }
  },
  loader: async () => {
    try {
      await queryClient.ensureQueryData(settingsQueryOptions());
    } catch {
      // Break redirect loop: clear session if data fails to load
      queryClient.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw redirect({ to: '/', replace: true });
    }
  },
});

function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { data: profileData } = useSuspenseQuery(settingsQueryOptions());

  useSEO({ title: "Pengaturan Profil | Public Gold Indonesia" });

  // Prepare initial values from profile data
  const initialValues = useMemo(() => {
    if (!profileData) return {};
    
    let formPhone = profileData.no_telpon || '';
    let initialCountryCode = '62';
    let initialPhoneRest = formPhone;
    
    // Detect country code from phone number
    ['62', '60', '65'].forEach(code => {
      if (formPhone.startsWith(code)) {
        initialCountryCode = code;
        initialPhoneRest = formPhone.substring(code.length);
      }
    });

    return {
      nama_lengkap: profileData.nama_lengkap || '',
      nama_panggilan: profileData.nama_panggilan || '',
      email: profileData.email || '',
      country_code: initialCountryCode,
      no_telpon: initialPhoneRest,
      link_group_whatsapp: profileData.link_group_whatsapp || '',
      sosmed_facebook: profileData.sosmed_facebook || '',
      sosmed_instagram: profileData.sosmed_instagram || '',
      sosmed_tiktok: profileData.sosmed_tiktok || '',
    };
  }, [profileData]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    values: initialValues as SettingsFormValues,
  })

  // Profile Photo State & Logic
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null)
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)
  const [dialCodeSearch, setDialCodeSearch] = useState("");
  
  const filteredDialCodes = useMemo(() => {
    if (!dialCodeSearch) return dialCodeOptions;
    const term = dialCodeSearch.toLowerCase();
    return dialCodeOptions.filter(opt =>
      opt.label.toLowerCase().includes(term) ||
      opt.value.includes(term)
    );
  }, [dialCodeSearch]);

  const { data: googleData } = useQuery(googleStatusQueryOptions());
  const isGoogleConnected = googleData?.connected || false;

  const mutation = useMutation({
    mutationFn: async (formData: SettingsFormValues) => {
      const data = new FormData()
      if (fotoFile) data.append('foto_profil', fotoFile)
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof SettingsFormValues];
        if (value !== undefined) data.append(key, value);
      })

      const res = await api.put('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    },
    onSuccess: (data: any) => {
      if (data.success) {
        showToast('Profil berhasil diperbarui!', 'success')
        queryClient.invalidateQueries({ queryKey: ['settings'] })
        const oldUser = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...oldUser, ...data.data }))
      } else {
        showToast(data.message, 'error')
      }
    },
    onError: (error: any) => showToast(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengaturan.', 'error')
  })

  // Google Integration Logic
  const saveGoogleTokenMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/google/save-token', { code });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showToast('Google account connected!', 'success');
        queryClient.invalidateQueries({ queryKey: ['googleStatus'] });
      }
    },
    onError: (err: any) => showToast(err.response?.data?.message || 'Failed to connect Google account', 'error')
  });

  const disconnectGoogleMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/google/disconnect');
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showToast('Koneksi Google diputuskan', 'success');
        queryClient.invalidateQueries({ queryKey: ['googleStatus'] });
      }
    },
    onError: () => showToast('Gagal memutuskan koneksi', 'error')
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('google_code');
    if (code) {
      saveGoogleTokenMutation.mutate(code);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setCropperSrc(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setFotoFile(new File([croppedBlob], 'foto_profil.png', { type: 'image/png' }));
    setCroppedPreview(URL.createObjectURL(croppedBlob));
    setCropperSrc(null);
  };

  const handleCropCancel = () => setCropperSrc(null);

  const onSubmit = (data: SettingsFormValues) => {
    const finalPhone = formatPhoneForAPI(data.country_code, data.no_telpon);
    const { country_code, ...submitData } = { ...data, no_telpon: finalPhone };
    mutation.mutate(submitData as any); // Cast to any here if needed as it's being converted via phone utils, or update mutation to take final shape
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await api.get('/google/auth-url');
      if (res.data.url) window.location.href = res.data.url;
    } catch {
      showToast('Gagal mendapatkan tautan otorisasi Google', 'error');
    }
  };

  const handleGoogleDisconnect = () => {
    if (confirm('Apakah Anda yakin ingin memutuskan koneksi Google? Sinkronisasi otomatis akan berhenti.')) {
      disconnectGoogleMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
          <ProfilePhotoCard
            fotoProfilUrl={profileData?.foto_profil_url}
            namaLengkap={profileData?.nama_lengkap}
            pgcode={profileData?.pgcode}
            cropperSrc={cropperSrc}
            croppedPreview={croppedPreview}
            onFileChange={handleFileChange}
            onCropComplete={handleCropComplete}
            onCropCancel={handleCropCancel}
          />

          {/* Basic Info Card */}
          <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden bg-white">
            <CardHeader className="px-5 sm:px-6 py-4 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-800">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  PG Code
                </Label>
                <Input type="text" disabled value={profileData?.pgcode || ''} className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="nama_lengkap" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    Nama Lengkap
                  </Label>
                  <Input id="nama_lengkap" {...register('nama_lengkap', { required: 'Nama lengkap wajib diisi' })} type="text" className={cn(errors.nama_lengkap && "border-red-400 bg-red-50/50")} />
                  {errors.nama_lengkap && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.nama_lengkap.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama_panggilan" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    Nama Panggilan
                  </Label>
                  <Input id="nama_panggilan" {...register('nama_panggilan')} type="text" placeholder="Opsional" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  Email Publik
                </Label>
                <Input id="email" {...register('email')} type="email" />
              </div>

              {/* Phone Input with Dial Code Combobox */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  Nomor Telepon (WhatsApp)
                </Label>
                <div className="flex bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all">
                  <div className="w-[100px] border-r border-slate-200">
                    <Combobox
                      onValueChange={(val: string | null) => val && setValue('country_code', val)}
                      value={(watch('country_code') as string) || '62'}
                      inputValue={dialCodeSearch}
                      onInputValueChange={setDialCodeSearch}
                    >
                      <ComboboxTrigger className="border-none bg-slate-50 rounded-none h-full focus:ring-0">
                        <ComboboxValue className="truncate">
                          {dialCodeOptions.find(opt => opt.value === watch('country_code'))?.label?.replace('+', '') || '62'}
                        </ComboboxValue>
                      </ComboboxTrigger>
                      <ComboboxContent>
                        <ComboboxInput placeholder="Cari..." />
                        <ComboboxEmpty>No results.</ComboboxEmpty>
                        {filteredDialCodes.map((opt) => (
                          <ComboboxItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <Input
                    {...register('no_telpon', { onChange: (e) => e.target.value = e.target.value.replace(/\D/g, "") })}
                    type="text"
                    className="flex-1 border-none bg-transparent focus-visible:ring-0"
                    placeholder="8123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_group_whatsapp" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
                  <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  Link Grup WhatsApp
                </Label>
                <Input id="link_group_whatsapp" {...register('link_group_whatsapp')} type="text" placeholder="https://chat.whatsapp.com/..." />
              </div>
            </CardContent>
          </Card>

          <SocialMediaCard register={register} />
          
          <GoogleSyncCard
            isConnected={isGoogleConnected}
            onConnect={handleGoogleConnect}
            onDisconnect={handleGoogleDisconnect}
          />

          <PasswordCard />
        </form>
      </div>

      {/* Sticky Save Button */}
      <div className="sticky bottom-0 z-40 bg-gradient-to-t from-white via-white/95 to-white/0 pt-6 pb-4 sm:pb-5 pointer-events-none">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex justify-center pointer-events-auto">
          <Button
            type="submit"
            form="settings-form"
            disabled={mutation.isPending}
            className="px-6 sm:px-8 h-auto py-2.5 sm:py-3 rounded-xl shadow-lg shadow-red-600/25"
          >
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function SettingsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} className="text-red-600 opacity-100" />
        <p className="text-slate-500 text-sm font-medium">Memuat pengaturan...</p>
      </div>
    </div>
  );
}
