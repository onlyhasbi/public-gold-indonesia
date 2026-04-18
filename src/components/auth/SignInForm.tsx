import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { motion } from 'motion/react'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { InputField, PasswordInput } from '../ui/form-elements'
import { signinSchema } from '../../schemas/auth.schema'
import { api } from '../../lib/api'
import { useToast } from '../toast'
import { authTokenAtom, authUserAtom } from '../../store/authStore'

const formVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.4 } },
}

export function SignInForm() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const setToken = useSetAtom(authTokenAtom)
  const setUser = useSetAtom(authUserAtom)

  const signinForm = useForm({
    resolver: yupResolver(signinSchema),
    mode: 'onChange',
    defaultValues: { pgcode: '', katasandi: '' },
  })

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
        setToken(data.token)
        setUser(data.user)
        navigate({ to: '/overview' })
      } else {
        showToast(data.message, 'error')
      }
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Login gagal, periksa kredensial Anda', 'error')
    },
  })

  return (
    <motion.form
      key="signin-form"
      className="space-y-6"
      variants={formVariants} initial="initial" animate="animate" exit="exit"
      onSubmit={signinForm.handleSubmit((data) => loginMutation.mutate(data))}
    >
      <div className="space-y-5">
        <InputField
          id="pgcode"
          label="PGCode"
          placeholder="PG123456"
          {...signinForm.register('pgcode', {
            onChange: (e) => {
              const value = e.target.value;
              const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
              if (value !== sanitized) signinForm.setValue('pgcode', sanitized);
            }
          })}
          error={signinForm.formState.errors.pgcode?.message}
        />
        <PasswordInput
          id="katasandi"
          label="Password"
          placeholder="••••••••"
          {...signinForm.register('katasandi')}
          error={signinForm.formState.errors.katasandi?.message}
        />
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
  )
}
