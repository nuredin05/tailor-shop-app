import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDarkMode } from '../context/DarkModeContext'
import { useTranslation } from 'react-i18next'
import { updateProfile } from '../services/authService'
import Input from '../components/ui/Input'
import { Button, Button1, BtnWarning } from '../components/ui/Button'
import {
  User, Bell, Shield, Moon, Save, CheckCircle, AlertCircle,
  Smartphone, Mail, Lock, Eye, EyeOff, Globe, Zap, Palette, Monitor, Upload, Trash2, Sun
} from 'lucide-react'

const SettingsPage = () => {
  const { user, updateUser } = useAuth()
  const { isDarkMode, setTheme, themeMode } = useDarkMode()
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  })

  const [profileImage, setProfileImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)

  const getRoleLabel = (role) => {
    if (role === 'superadmin') return 'Super Admin'
    if (role === 'admin') return 'Admin'
    return 'User'
  }

  const getRoleBadgeClasses = (role) => {
    if (role === 'superadmin') return 'bg-purple-100 text-purple-700 border border-purple-200'
    if (role === 'admin') return 'bg-blue-100 text-blue-700 border border-blue-200'
    return 'bg-gray-100 text-gray-700 border border-gray-200'
  }

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    smsUpdates: true,
    weeklyReport: true
  })

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (status.message) setStatus({ type: '', message: '' })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return setStatus({ type: 'error', message: 'File too large. Max 2MB.' })
      }
      setProfileImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setRemoveImage(false)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    setPreviewUrl(null)
    setRemoveImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setStatus({ type: 'error', message: 'Passwords do not match' })
    }

    setLoading(true)
    try {
      let dataToSubmit

      if (profileImage || removeImage) {
        dataToSubmit = new FormData()
        dataToSubmit.append('name', formData.name)
        dataToSubmit.append('phone', formData.phone)
        if (formData.password) dataToSubmit.append('password', formData.password)

        if (removeImage) {
          dataToSubmit.append('removeImage', 'true')
        } else if (profileImage) {
          dataToSubmit.append('profileImage', profileImage)
        }
      } else {
        dataToSubmit = {
          name: formData.name,
          phone: formData.phone,
          password: formData.password || undefined
        }
      }

      const { data } = await updateProfile(dataToSubmit)

      updateUser(data)
      setStatus({ type: 'success', message: 'Profile updated successfully!' })
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      setProfileImage(null)
      setRemoveImage(false)
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile'
      })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: t('settings.title') + ' — ' + 'Account Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'language', name: t('settings.language'), icon: Globe },
    { id: 'display', name: 'Display Theme', icon: Moon },
    { id: 'security', name: 'Security & Privacy', icon: Shield }
  ]

  const getImageSrc = () => {
    if (previewUrl) return previewUrl
    if (removeImage) return `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=075985&color=fff&size=128`
    if (user?.profileImage) return `http://localhost:5002${user.profileImage}`
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=075985&color=fff&size=128`
  }

  return (
    <div className="font-sans selection:bg-primaryClr/30 animate-fadeInUp">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-terciaryClr/80 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-primaryClr/5">
            <p className="text-[10px] font-black text-primaryClr/30 uppercase tracking-[0.2em] mb-4 pl-4">System Settings</p>
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${isActive
                      ? 'bg-primaryClr text-terciaryClr shadow-lg shadow-primaryClr/20 scale-[1.02]'
                      : 'text-primaryClr/60 hover:bg-primaryClr/5 hover:text-primaryClr'
                      }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="bg-primaryClr rounded-[2rem] p-8 text-terciaryClr shadow-xl shadow-primaryClr/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
              <Zap size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Connected as</p>
              <h4 className="text-xl font-black mb-1">{user?.name}</h4>
              <p className="text-xs opacity-70 mb-6">{user?.email}</p>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeClasses(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>
            </div>
          </div>
    </div>

        {/* Right Column - Content */ }
  <div className="lg:col-span-2">
    <div className="bg-terciaryClr rounded-[2rem] p-8 shadow-xl shadow-primaryClr/5 border border-primaryClr/10 min-h-[650px] relative overflow-hidden">

      <div className="flex items-center justify-between mb-10 pb-6 border-b border-primaryClr/5">
        <div>
          <h2 className="text-3xl font-black text-primaryClr tracking-tighter uppercase">{activeTab} Settings</h2>
          <p className="text-sm text-primaryClr/40">Customize your platform experience and preferences.</p>
        </div>
        {status.message && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold animate-fadeInUp ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {status.message}
          </div>
        )}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fadeInUp">
          <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-backgroundClr/30 rounded-3xl border border-primaryClr/5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-primaryClr/10 border-4 border-primaryClr shadow-lg flex items-center justify-center overflow-hidden transition-all duration-500">
                <img
                  src={getImageSrc()}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-primaryClr text-terciaryClr p-2 rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-primaryClr"
              >
                <Upload size={12} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h3 className="font-bold text-primaryClr">Profile Identity</h3>
                {user?.role === 'superadmin' && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-black uppercase tracking-tighter border border-purple-200">Super Admin</span>
                )}
              </div>
              <p className="text-xs text-primaryClr/50 mt-1">This will be visible to other team members.</p>
              <div className="flex justify-center md:justify-start gap-4 mt-4">
                <Button1
                  onClick={() => fileInputRef.current.click()}
                  icon={Upload}
                >
                  Update
                </Button1>
                <BtnWarning
                  onClick={handleRemoveImage}
                  icon={Trash2}
                >
                  Remove
                </BtnWarning>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Full Name"
              name="name"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              placeholder="Abebe Kebede"
            />
            <Input
              label="Phone Number"
              name="phone"
              icon={Smartphone}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+251..."
            />
            <Input
              label="Physical Address"
              name="address"
              icon={Globe}
              value={formData.address}
              onChange={handleChange}
              placeholder="Addis Ababa, Ethiopia"
            />
          </div>

          <div className="pt-8 border-t border-primaryClr/5">
            <h4 className="text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-6">Credential Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <Input
                label="New Password"
                name="password"
                type={showPassword ? "text" : "password"}
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-primaryClr/30 hover:text-primaryClr transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <Button
              onClick={handleSubmit}
              loading={loading}
              icon={Save}
              className="px-12 py-5"
            >
              Commit Changes
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-8 animate-fadeInUp">
          <div className="p-6 bg-primaryClr/5 rounded-3xl border border-primaryClr/10">
            <h3 className="font-bold text-primaryClr mb-2">Notification Center</h3>
            <p className="text-xs text-primaryClr/60 leading-relaxed">Choose how you want to be notified about important events and system updates.</p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'emailAlerts', name: 'Email Alerts', desc: 'Receive security alerts via email', icon: Mail },
              { id: 'pushNotifications', name: 'Push Notifications', desc: 'Real-time browser notifications', icon: Zap },
              { id: 'smsUpdates', name: 'SMS Updates', desc: 'Important codes via text message', icon: Smartphone },
              { id: 'weeklyReport', name: 'Weekly Analytics', desc: 'Digest of platform activity', icon: Monitor }
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl border border-primaryClr/5 hover:bg-primaryClr/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-primaryClr/60 group-hover:text-primaryClr transition-colors">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primaryClr">{item.name}</p>
                    <p className="text-[10px] text-primaryClr/40 font-medium uppercase tracking-wider">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationToggle(item.id)}
                  className={`w-12 h-6 rounded-full transition-all duration-500 relative ${notifications[item.id] ? 'bg-primaryClr' : 'bg-primaryClr/10'
                    }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-terciaryClr rounded-full transition-all duration-300 ${notifications[item.id] ? 'left-7' : 'left-1'
                    }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'language' && (
        <div className="space-y-8 animate-fadeInUp">
          <div className="p-6 bg-primaryClr/5 rounded-3xl border border-primaryClr/10">
            <h3 className="font-bold text-primaryClr mb-2 flex items-center gap-2">
              <Globe size={18} /> {t('settings.language')}
            </h3>
            <p className="text-xs text-primaryClr/60 leading-relaxed">Choose your preferred interface language. All labels and navigation will update instantly.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { code: 'en', label: 'English', sublabel: 'English (Default)', flag: '🇬🇧' },
              { code: 'am', label: 'አማርኛ', sublabel: 'Amharic (Ethiopian)', flag: '🇪🇹' }
            ].map(lang => {
              const isActive = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`p-6 rounded-[2rem] border-2 flex items-center gap-5 transition-all text-left ${
                    isActive
                      ? 'border-primaryClr bg-primaryClr/5 shadow-lg shadow-primaryClr/10'
                      : 'border-primaryClr/5 bg-backgroundClr/30 hover:border-primaryClr/20'
                  }`}
                >
                  <span className="text-4xl">{lang.flag}</span>
                  <div>
                    <p className={`font-black text-lg tracking-tight ${isActive ? 'text-primaryClr' : 'text-secondaryClr'}`}>{lang.label}</p>
                    <p className="text-xs text-secondaryClr/50 mt-0.5">{lang.sublabel}</p>
                    {isActive && (
                      <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-primaryClr bg-primaryClr/10 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'display' && (
        <div className="space-y-8 animate-fadeInUp">
          <div className="p-6 bg-primaryClr/5 rounded-3xl border border-primaryClr/10">
            <h3 className="font-bold text-primaryClr mb-2">Theme Settings</h3>
            <p className="text-xs text-primaryClr/60 leading-relaxed">Choose your preferred appearance mode. Dark mode reduces eye strain and saves battery on OLED displays.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'light', name: 'Light Mode', icon: Sun },
              { id: 'dark', name: 'Dark Mode', icon: Moon },
              { id: 'system', name: 'System Sync', icon: Monitor }
            ].map(theme => {
              const isActive = themeMode === theme.id
              return (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all cursor-pointer ${isActive
                    ? 'border-primaryClr bg-primaryClr/5 shadow-lg shadow-primaryClr/5'
                    : 'border-primaryClr/5 bg-backgroundClr/30 hover:border-primaryClr/20'
                    }`}
                >
                  <div className={`p-4 rounded-2xl transition-all ${isActive ? 'bg-primaryClr text-terciaryClr' : 'bg-white text-primaryClr/40'}`}>
                    <theme.icon size={24} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primaryClr' : 'text-primaryClr/40'}`}>
                    {theme.name}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="p-8 bg-primaryClr/5 rounded-[2.5rem] border border-primaryClr/10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-primaryClr uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Zap size={16} /> Current Mode
                </h4>
                <p className="text-sm text-primaryClr/60">
                  {isDarkMode ? '🌙 Dark mode is active' : '☀️ Light mode is active'}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider ${isDarkMode ? 'bg-primaryClr text-terciaryClr' : 'bg-yellow-100 text-yellow-700'}`}>
                {isDarkMode ? 'Dark' : 'Light'}
              </div>
            </div>
          </div>

          <div className="p-8 bg-backgroundClr/30 rounded-[2.5rem] border border-primaryClr/5">
            <h4 className="text-xs font-black text-primaryClr uppercase tracking-widest mb-6 flex items-center gap-2">
              <Palette size={16} /> Interface Accent
            </h4>
            <div className="flex gap-4">
              {['#075985', '#7c3aed', '#db2777', '#059669'].map(color => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded-full border-4 border-white shadow-lg transition-transform hover:scale-125 ${color === '#075985' ? 'ring-2 ring-primaryClr' : ''
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8 animate-fadeInUp text-center py-20">
          <div className="w-24 h-24 bg-primaryClr/5 rounded-full flex items-center justify-center text-primaryClr mx-auto mb-6 relative">
            <Shield size={48} />
            <div className="absolute inset-0 border-2 border-primaryClr/20 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-2xl font-black text-primaryClr uppercase tracking-tighter">Security Protocols</h3>
          <p className="text-primaryClr/40 max-w-sm mx-auto leading-relaxed">
            Advanced multi-factor authentication and session management controls are being integrated for your protection.
          </p>
        </div>
      )}

    </div>
  </div>
      </div>
    </div>
  )
}

export default SettingsPage
