import { useState } from 'react'
import { api } from '../../lib/api'
import { useToast } from '../../components/toast'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { cn } from '../../lib/utils'

interface PasswordFormValues {
  katasandi_lama: string
  katasandi_baru: string
  konfirmasi_katasandi: string
}

export function PasswordCard() {
  const { showToast } = useToast()
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormValues>()

  const mutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await api.patch('/settings/password', {
        katasandi_lama: data.katasandi_lama,
        katasandi_baru: data.katasandi_baru,
      })
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        showToast('Kata sandi berhasil diperbarui!', 'success')
        reset()
      } else {
        showToast(data.message, 'error')
      }
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Gagal memperbarui kata sandi', 'error')
    }
  })

  const onSubmit = (data: PasswordFormValues) => {
    mutation.mutate(data)
  }

  const passwordBaru = watch('katasandi_baru')

  return (
    <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden bg-white">
      <CardHeader className="px-5 sm:px-6 py-4 border-b border-slate-100">
        <CardTitle className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-red-600" />
          Ubah Kata Sandi
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-semibold text-slate-600">Kata Sandi Lama</Label>
          <div className="relative">
            <Input
              type={showOld ? 'text' : 'password'}
              {...register('katasandi_lama', { required: 'Wajib diisi' })}
              className={cn("pr-10", errors.katasandi_lama && "border-red-400 bg-red-50/50")}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.katasandi_lama && <p className="text-xs text-red-500 font-medium">{errors.katasandi_lama.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-slate-600">Kata Sandi Baru</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                {...register('katasandi_baru', {
                  required: 'Wajib diisi',
                  minLength: { value: 6, message: 'Minimal 6 karakter' }
                })}
                className={cn("pr-10", errors.katasandi_baru && "border-red-400 bg-red-50/50")}
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.katasandi_baru && <p className="text-xs text-red-500 font-medium">{errors.katasandi_baru.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-slate-600">Konfirmasi Kata Sandi Baru</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                {...register('konfirmasi_katasandi', {
                  required: 'Wajib diisi',
                  validate: (val) => val === passwordBaru || 'Kata sandi tidak cocok'
                })}
                className={cn("pr-10", errors.konfirmasi_katasandi && "border-red-400 bg-red-50/50")}
                placeholder="Ulangi kata sandi baru"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.konfirmasi_katasandi && <p className="text-xs text-red-500 font-medium">{errors.konfirmasi_katasandi.message}</p>}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
            variant="outline"
            className="w-full border-slate-200 hover:bg-slate-50 hover:text-red-600 h-10 rounded-xl transition-all duration-200 font-bold"
          >
            {mutation.isPending ? (
              <ShieldCheck className="w-4 h-4 mr-2 animate-pulse" />
            ) : (
              <KeyRound className="w-4 h-4 mr-2" />
            )}
            {mutation.isPending ? 'Memproses...' : 'Perbarui Kata Sandi'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
