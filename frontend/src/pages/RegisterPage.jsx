import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/authService'
import Input from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { User, Mail, Lock, Phone, ChevronRight } from 'lucide-react'

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      return setError('Passwords do not match')
    }

    setIsLoading(true)
    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-backgroundClr p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primaryClr rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondaryClr rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-display font-black text-primaryClr mb-2 tracking-tighter uppercase">Join Us</h1>
            <p className="text-primaryClr text-sm">Create your professional account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm mb-6 font-bold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Full Name"
              name="name"
              icon={User}
              placeholder="Abebe Kebede"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input 
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Input 
              label="Phone Number"
              name="phone"
              type="tel"
              icon={Phone}
              placeholder="+251..."
              value={form.phone}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Input 
                label="Confirm"
                name="confirm"
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              onClick={handleSubmit}
              loading={isLoading}
              icon={ChevronRight}
              className="w-full py-4 mt-6 group"
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center pt-6 border-t border-primaryClr/5">
            <p className="text-primaryClr text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primaryClr font-bold hover:text-primaryClr/30 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
