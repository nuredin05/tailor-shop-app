import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { loginUser } from '../services/authService'
import Input from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Mail, Lock, ChevronRight } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await loginUser(form)
      login(response.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-backgroundClr p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primaryClr rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondaryClr rounded-full blur-[150px]"></div>
      </div>

      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        <div className="bg-terciaryClr rounded-[2.5rem] p-10 shadow-2xl shadow-secondaryClr/10 border border-primaryClr">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-display font-black text-primaryClr mb-2 tracking-tighter uppercase">{t('login.title')}</h1>
            <p className="text-primaryClr/60 text-sm">{t('login.subtitle')}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm mb-6 font-bold flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label={t('login.email')}
              name="email"
              type="email"
              icon={Mail}
              placeholder={t('login.emailPlaceholder')}
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className="space-y-2">
              <div className="flex justify-end px-1 mb-[-8px]">
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-primaryClr uppercase tracking-widest hover:underline transition-all relative z-10">
                  {t('login.forgot')}
                </Link>
              </div>
              <Input 
                label={t('login.password')}
                name="password"
                type="password"
                icon={Lock}
                placeholder={t('login.passwordPlaceholder')}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              onClick={handleSubmit}
              loading={isLoading}
              icon={ChevronRight}
              className="w-full py-4 group"
            >
              {t('login.signIn')}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center pt-8 border-t border-primaryClr/5">
            <p className="text-primaryClr/60 text-sm">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-primaryClr font-bold hover:underline hover:text-primaryClr/50 transition-colors">
                {t('login.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
