import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Map, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'uz'
  const { register, currentUser, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser && logout) {
      logout()
    }
  }, [currentUser, logout])
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    university: '',
    password: '',
    confirmPassword: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Parollar mos kelmadi')
      return
    }
    if (form.password.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
      return
    }
    setLoading(true)
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        university: form.university,
        email: form.email,
        password: form.password,
        avatar: avatarFile,
        role: 'student',
      })
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!")
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Map size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">GeoEdu</span>
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('auth.register')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Platformaga qo'shiling va o'rganishni boshlang
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{lang === 'uz' ? "Ism" : lang === 'ru' ? "Имя" : "First Name"}</label>
                <input className="input" placeholder="Bobur" value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div>
                <label className="label">{lang === 'uz' ? "Familiya" : lang === 'ru' ? "Фамилия" : "Last Name"}</label>
                <input className="input" placeholder="Mirzayev" value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>

            <div>
              <label className="label">{lang === 'uz' ? "O'quv muassasasi" : lang === 'ru' ? "Учебное заведение" : "Educational Institution"}</label>
              <input className="input" placeholder="O'zbekiston Milliy Universiteti" value={form.university} onChange={set('university')} required />
            </div>

            <div>
              <label className="label">{lang === 'uz' ? "Profil rasmi" : lang === 'ru' ? "Фото профиля" : "Profile Picture"}</label>
              <div className="flex items-center gap-4 mt-1 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 rounded-xl bg-gray-55/50 dark:bg-gray-700/50 flex items-center justify-center text-gray-400 border border-gray-150 dark:border-gray-650 overflow-hidden flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-center leading-none text-gray-400">No Image</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-950/30 dark:file:text-primary-400 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="label">{t('auth.email')}</label>
              <input type="email" className="input" placeholder="email@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="label">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">{t('auth.confirmPassword')}</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              <UserPlus size={18} />
              {loading ? t('common.loading') : t('auth.registerBtn')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
